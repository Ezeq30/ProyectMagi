import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  calcDiscount,
  calcShipping,
  getCoupon,
  getSettings,
} from "@/lib/catalog";
import { updateStore } from "@/lib/data/store";
import { createCheckoutPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import type { CartItem, Order } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = (body.items ?? []) as CartItem[];
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
    }

    const required = [
      "customer_name",
      "customer_email",
      "customer_phone",
      "shipping_address",
      "shipping_city",
      "shipping_postal",
    ] as const;

    for (const key of required) {
      if (!body[key] || String(body[key]).trim() === "") {
        return NextResponse.json({ error: `Falta ${key}` }, { status: 400 });
      }
    }

    const settings = await getSettings();
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const coupon = body.coupon ? await getCoupon(String(body.coupon)) : null;
    const discount = calcDiscount(subtotal, coupon);
    const shippingCost = calcShipping(Math.max(0, subtotal - discount), settings);
    const total = Math.max(0, subtotal - discount + shippingCost);

    const orderId = randomUUID();
    const orderNumber = `AM-${Date.now().toString().slice(-8)}`;

    let mpPreferenceId: string | null = null;
    let initPoint: string | null = null;

    if (isMercadoPagoConfigured()) {
      const pref = await createCheckoutPreference({
        orderId,
        orderNumber,
        items,
        shippingCost,
        discount,
        payerEmail: String(body.customer_email),
      });
      if (pref) {
        mpPreferenceId = pref.id;
        initPoint = pref.init_point;
      }
    }

    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      status: initPoint ? "pending" : "pending",
      customer_name: String(body.customer_name),
      customer_email: String(body.customer_email),
      customer_phone: String(body.customer_phone),
      shipping_address: String(body.shipping_address),
      shipping_city: String(body.shipping_city),
      shipping_postal: String(body.shipping_postal),
      shipping_cost: shippingCost,
      subtotal,
      discount,
      total,
      coupon_code: coupon?.code ?? null,
      mp_preference_id: mpPreferenceId,
      mp_payment_id: null,
      notes: String(body.notes ?? ""),
      created_at: new Date().toISOString(),
      items: items.map((item) => ({
        id: randomUUID(),
        product_id: item.productId,
        product_name: item.name,
        variant_label: item.variantLabel ?? null,
        unit_price: item.price,
        quantity: item.quantity,
        image: item.image ?? null,
      })),
    };

    await updateStore((store) => {
      store.orders.unshift(order);
      for (const item of items) {
        const product = store.products.find((p) => p.id === item.productId);
        if (!product) continue;
        if (item.variantId && product.variants) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (variant) variant.stock = Math.max(0, variant.stock - item.quantity);
        }
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    });

    return NextResponse.json({
      orderId,
      orderNumber,
      init_point: initPoint,
      demo: !initPoint,
      total,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error de checkout" },
      { status: 500 },
    );
  }
}
