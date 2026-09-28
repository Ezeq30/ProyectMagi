import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  calcDiscount,
  calcShipping,
  getCoupon,
  getSettings,
  type ShippingMethod,
} from "@/lib/catalog";
import { dbCreateOrder } from "@/lib/db";
import {
  createCashTicket,
  createPreferenceForOrder,
  isMercadoPagoReady,
} from "@/lib/mercadopago";
import {
  calcTransferDiscount,
  hasTransferPayment,
  normalizePaymentMethod,
  normalizeTicketMethod,
  parseDni,
  TICKET_METHOD_LABELS,
  TICKET_URL_NOTE_PREFIX,
  TRANSFER_DISCOUNT_PERCENT,
} from "@/lib/payment";
import { notifySellerOrder } from "@/lib/order-notify";
import { createServerDataClient, hasServiceRole, useSupabaseData } from "@/lib/supabase/admin";
import type { CartItem, Order } from "@/lib/types";

function parseShippingMethod(value: unknown): ShippingMethod {
  return value === "seller_arrange" ? "seller_arrange" : "delivery";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = (body.items ?? []) as CartItem[];
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
    }

    const shippingMethod = parseShippingMethod(body.shippingMethod);
    const paymentMethod = normalizePaymentMethod(body.paymentMethod);
    const arrangeWithSeller = shippingMethod === "seller_arrange";
    const payTransfer = paymentMethod === "transfer";
    const payTicket = paymentMethod === "ticket";
    const ticketMethod = normalizeTicketMethod(body.ticketMethod);
    const payerDni = payTicket ? parseDni(body.customer_dni) : null;
    if (payTicket && !payerDni) {
      return NextResponse.json(
        { error: "Ingresá un DNI válido (7 u 8 números) para generar el cupón" },
        { status: 400 },
      );
    }

    const required = [
      "customer_name",
      "customer_email",
      "customer_phone",
      ...(arrangeWithSeller
        ? []
        : (["shipping_address", "shipping_city", "shipping_postal"] as const)),
    ] as const;

    for (const key of required) {
      if (!body[key] || String(body[key]).trim() === "") {
        return NextResponse.json({ error: `Falta ${key}` }, { status: 400 });
      }
    }

    const settings = await getSettings();
    const transfer = hasTransferPayment(settings);
    if (payTransfer && !transfer) {
      return NextResponse.json(
        { error: "La transferencia no está disponible por el momento" },
        { status: 400 },
      );
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const coupon = body.coupon ? await getCoupon(String(body.coupon)) : null;
    const transferDiscount = calcTransferDiscount(subtotal, paymentMethod);
    const afterTransfer = Math.max(0, subtotal - transferDiscount);
    const couponDiscount = calcDiscount(afterTransfer, coupon);
    const discount = transferDiscount + couponDiscount;
    const shippingCost = calcShipping(
      Math.max(0, afterTransfer - couponDiscount),
      settings,
      shippingMethod,
    );
    const total = Math.max(0, subtotal - discount + shippingCost);

    const orderId = randomUUID();
    const orderNumber = `AT-${Date.now().toString().slice(-8)}`;

    const mpReady = await isMercadoPagoReady();
    if (payTicket && !mpReady) {
      return NextResponse.json(
        { error: "El pago en efectivo no está disponible por el momento" },
        { status: 400 },
      );
    }
    const payPage = payTransfer || payTicket || mpReady || transfer;

    let ticket: Awaited<ReturnType<typeof createCashTicket>> | null = null;
    if (payTicket && payerDni) {
      try {
        ticket = await createCashTicket({
          orderId,
          orderNumber,
          amount: total,
          method: ticketMethod,
          payerEmail: String(body.customer_email),
          payerName: String(body.customer_name),
          payerDni,
        });
      } catch (e) {
        console.error("MP cash ticket:", e);
        return NextResponse.json(
          { error: "No se pudo generar el cupón de pago. Probá de nuevo o elegí otro medio." },
          { status: 502 },
        );
      }
    }

    const userNotes = String(body.notes ?? "").trim();
    const paymentNote = payTransfer
      ? `Pago: transferencia (${TRANSFER_DISCOUNT_PERCENT}% de descuento).`
      : payTicket
        ? `Pago: cupón ${TICKET_METHOD_LABELS[ticketMethod]} (efectivo, vence ${new Date(
            ticket!.expiresAt,
          ).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}).`
        : "Pago: Mercado Pago.";
    const ticketNote = ticket ? `${TICKET_URL_NOTE_PREFIX}${ticket.ticketUrl}` : "";
    const shippingNote = arrangeWithSeller
      ? "Envío: a coordinar con el vendedor (sin cargo de envío)."
      : "";
    const notes = [paymentNote, ticketNote, shippingNote, userNotes]
      .filter(Boolean)
      .join("\n");

    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      status: "pending",
      customer_name: String(body.customer_name),
      customer_email: String(body.customer_email),
      customer_phone: String(body.customer_phone),
      shipping_address: arrangeWithSeller
        ? "A coordinar con el vendedor"
        : String(body.shipping_address),
      shipping_city: arrangeWithSeller
        ? "A coordinar"
        : String(body.shipping_city),
      shipping_postal: arrangeWithSeller ? "-" : String(body.shipping_postal),
      shipping_cost: shippingCost,
      subtotal,
      discount,
      total,
      coupon_code: coupon?.code ?? null,
      mp_preference_id: null,
      mp_payment_id: ticket?.paymentId ?? null,
      mp_money_release_date: null,
      mp_status_detail: null,
      notes,
      created_at: new Date().toISOString(),
      items: items.map((item) => ({
        id: randomUUID(),
        product_id: item.productId,
        product_name: item.name,
        variant_id: item.variantId ?? null,
        variant_label: item.variantLabel ?? null,
        unit_price: item.price,
        quantity: item.quantity,
        image: item.image ?? null,
      })),
    };

    await dbCreateOrder(order);

    // Aviso a Magali (CallMeBot / webhook si están configurados)
    void notifySellerOrder(order, "created").catch((e) =>
      console.error("notifySellerOrder created:", e),
    );

    let initPoint: string | null = null;
    if (!payTransfer && !payTicket && mpReady) {
      try {
        const pref = await createPreferenceForOrder(order);
        initPoint = pref.init_point;
        order.mp_preference_id = pref.id;
        if (useSupabaseData() && hasServiceRole()) {
          try {
            const sb = createServerDataClient();
            await sb
              .from("orders")
              .update({ mp_preference_id: pref.id })
              .eq("id", order.id);
          } catch {
            /* ok */
          }
        }
      } catch (e) {
        console.error("MP preference at checkout:", e);
      }
    }

    return NextResponse.json({
      orderId,
      orderNumber,
      init_point: initPoint,
      ticket_url: ticket?.ticketUrl ?? null,
      transfer,
      payPage,
      demo: !payPage,
      total,
      shippingMethod,
      paymentMethod,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error de checkout" },
      { status: 500 },
    );
  }
}
