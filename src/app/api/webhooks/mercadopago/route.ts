import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { updateStore } from "@/lib/data/store";

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
      await updateStore((store) => {
        const order = store.orders.find(
          (o) => o.id === orderId || o.order_number === orderId,
        );
        if (!order) return;
        order.mp_payment_id = String(paymentId);
        if (status === "approved") order.status = "paid";
        if (status === "rejected" || status === "cancelled") order.status = "cancelled";
        if (status === "refunded") order.status = "refunded";
      });
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
