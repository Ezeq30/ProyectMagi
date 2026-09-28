import { NextResponse } from "next/server";
import {
  calcDiscount,
  calcShipping,
  getCoupon,
  getSettings,
  type ShippingMethod,
} from "@/lib/catalog";
import {
  calcTransferDiscount,
  normalizePaymentMethod,
  TRANSFER_DISCOUNT_PERCENT,
} from "@/lib/payment";

function parseShippingMethod(value: unknown): ShippingMethod {
  return value === "seller_arrange" ? "seller_arrange" : "delivery";
}

export async function POST(request: Request) {
  const body = await request.json();
  const subtotal = Number(body.subtotal) || 0;
  const shippingMethod = parseShippingMethod(body.shippingMethod);
  const paymentMethod = normalizePaymentMethod(body.paymentMethod);
  const settings = await getSettings();
  const coupon = body.coupon ? await getCoupon(String(body.coupon)) : null;

  const transferDiscount = calcTransferDiscount(subtotal, paymentMethod);
  const afterTransfer = Math.max(0, subtotal - transferDiscount);
  const couponDiscount = calcDiscount(afterTransfer, coupon);
  const discount = transferDiscount + couponDiscount;
  const shippingCost = calcShipping(afterTransfer - couponDiscount, settings, shippingMethod);

  return NextResponse.json({
    shippingCost,
    discount,
    transferDiscount,
    couponDiscount,
    transferDiscountPercent: TRANSFER_DISCOUNT_PERCENT,
    flatShipping: settings.flat_shipping_cost,
    shippingMethod,
    paymentMethod,
    couponApplied: coupon?.code ?? null,
  });
}
