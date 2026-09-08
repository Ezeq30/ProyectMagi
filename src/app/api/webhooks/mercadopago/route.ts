import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { dbUpdateOrderPayment } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const paymentId =
      body?.data?.id ??
      body?.id ??
      new URL(request.url).searchParams.get("data.id") ??
      new URL(request.url).searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ ok: true, demo: true });
    }

    const client = new MercadoPagoConfig({ accessToken: token });
    const paymentApi = new Payment(client);
    const payment = await paymentApi.get({ id: String(paymentId) });

    const orderId = payment.external_reference;
    const status = payment.status;

    if (orderId) {
      let orderStatus: "paid" | "cancelled" | "refunded" | "pending" = "pending";
      if (status === "approved") orderStatus = "paid";
      if (status === "rejected" || status === "cancelled") orderStatus = "cancelled";
      if (status === "refunded") orderStatus = "refunded";
      await dbUpdateOrderPayment(String(orderId), String(paymentId), orderStatus);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("MP webhook error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
