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
  createPreferenceForOrder,
  isMercadoPagoReady,
} from "@/lib/mercadopago";
import {
  calcCashDiscount,
  CASH_DISCOUNT_PERCENT,
  hasTransferPayment,
  type CheckoutPaymentMethod,
} from "@/lib/payment";
import { createServerDataClient, hasServiceRole, useSupabaseData } from "@/lib/supabase/admin";
import type { CartItem, Order } from "@/lib/types";

function parseShippingMethod(value: unknown): ShippingMethod {
  return value === "seller_arrange" ? "seller_arrange" : "delivery";
}

function parsePaymentMethod(value: unknown): CheckoutPaymentMethod {
  return value === "cash" ? "cash" : "mercadopago";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = (body.items ?? []) as CartItem[];
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
    }

    const shippingMethod = parseShippingMethod(body.shippingMethod);
    const paymentMethod = parsePaymentMethod(body.paymentMethod);
    const arrangeWithSeller = shippingMethod === "seller_arrange";
    const payCash = paymentMethod === "cash";

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
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const coupon = body.coupon ? await getCoupon(String(body.coupon)) : null;
    const cashDiscount = calcCashDiscount(subtotal, paymentMethod);
    const afterCash = Math.max(0, subtotal - cashDiscount);
    const couponDiscount = calcDiscount(afterCash, coupon);
    const discount = cashDiscount + couponDiscount;
    const shippingCost = calcShipping(
      Math.max(0, afterCash - couponDiscount),
      settings,
      shippingMethod,
    );
    const total = Math.max(0, subtotal - discount + shippingCost);

    const orderId = randomUUID();
    const orderNumber = `AT-${Date.now().toString().slice(-8)}`;

    const mpReady = await isMercadoPagoReady();
    const transfer = hasTransferPayment(settings);
    // Efectivo siempre tiene pantalla de pago (coordinar por WhatsApp)
    const payPage = payCash || mpReady || transfer;

    const userNotes = String(body.notes ?? "").trim();
    const paymentNote = payCash
      ? `Pago: efectivo (${CASH_DISCOUNT_PERCENT}% de descuento).`
      : "Pago: Mercado Pago.";
    const shippingNote = arrangeWithSeller
      ? "Envío: a coordinar con el vendedor (sin cargo de envío)."
      : "";
    const notes = [paymentNote, shippingNote, userNotes].filter(Boolean).join("\n");

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
      mp_payment_id: null,
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

    let initPoint: string | null = null;
    if (!payCash && mpReady) {
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
