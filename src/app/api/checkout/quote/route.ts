import { NextResponse } from "next/server";
import {
  calcDiscount,
  calcShipping,
  getCoupon,
  getSettings,
  type ShippingMethod,
} from "@/lib/catalog";
import {
  calcCashDiscount,
  CASH_DISCOUNT_PERCENT,
  type CheckoutPaymentMethod,
} from "@/lib/payment";

function parseShippingMethod(value: unknown): ShippingMethod {
  return value === "seller_arrange" ? "seller_arrange" : "delivery";
}

function parsePaymentMethod(value: unknown): CheckoutPaymentMethod {
  return value === "cash" ? "cash" : "mercadopago";
}

export async function POST(request: Request) {
  const body = await request.json();
  const subtotal = Number(body.subtotal) || 0;
  const shippingMethod = parseShippingMethod(body.shippingMethod);
  const paymentMethod = parsePaymentMethod(body.paymentMethod);
  const settings = await getSettings();
  const coupon = body.coupon ? await getCoupon(String(body.coupon)) : null;

  const cashDiscount = calcCashDiscount(subtotal, paymentMethod);
  const afterCash = Math.max(0, subtotal - cashDiscount);
  const couponDiscount = calcDiscount(afterCash, coupon);
  const discount = cashDiscount + couponDiscount;
  const shippingCost = calcShipping(afterCash - couponDiscount, settings, shippingMethod);

  return NextResponse.json({
    shippingCost,
    discount,
    cashDiscount,
    couponDiscount,
    cashDiscountPercent: CASH_DISCOUNT_PERCENT,
    flatShipping: settings.flat_shipping_cost,
    shippingMethod,
    paymentMethod,
    couponApplied: coupon?.code ?? null,
  });
}
