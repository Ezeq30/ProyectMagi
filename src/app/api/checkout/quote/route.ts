import { NextResponse } from "next/server";
import { calcDiscount, calcShipping, getCoupon, getSettings } from "@/lib/catalog";

export async function POST(request: Request) {
  const body = await request.json();
  const subtotal = Number(body.subtotal) || 0;
  const settings = await getSettings();
  const coupon = body.coupon ? await getCoupon(String(body.coupon)) : null;
  const discount = calcDiscount(subtotal, coupon);
  const shippingCost = calcShipping(Math.max(0, subtotal - discount), settings);

  return NextResponse.json({
    shippingCost,
    discount,
    freeShippingFrom: settings.free_shipping_from,
    flatShipping: settings.flat_shipping_cost,
    couponApplied: coupon?.code ?? null,
  });
}
