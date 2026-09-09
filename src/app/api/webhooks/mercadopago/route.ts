import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { dbUpdateOrderPayment } from "@/lib/db";
import { resolveMpAccessToken } from "@/lib/mercadopago";

async function extractPaymentId(request: Request): Promise<string | null> {
  const url = new URL(request.url);
  const fromQuery =
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    url.searchParams.get("data_id");

  const topic = url.searchParams.get("topic") || url.searchParams.get("type");
  if (fromQuery && (topic === "payment" || topic === "payments" || !topic)) {
    return fromQuery;
  }
  if (fromQuery && topic === "merchant_order") {
    // merchant_order: el id no es payment; se ignora acá (sync por payment)
    return null;
  }

  const body = await request.json().catch(() => ({}));
  const id = body?.data?.id ?? body?.id ?? fromQuery;
  return id ? String(id) : null;
}

async function processPayment(paymentId: string) {
  const token = await resolveMpAccessToken();
  if (!token) {
    return { ok: true, demo: true };
  }

  const client = new MercadoPagoConfig({ accessToken: token });
  const paymentApi = new Payment(client);
  const payment = await paymentApi.get({ id: String(paymentId) });

  const orderId = payment.external_reference;
  const status = payment.status;
  const moneyRelease =
    (payment as { money_release_date?: string | null }).money_release_date ?? null;
  const statusDetail =
    (payment as { status_detail?: string | null }).status_detail ?? null;

  if (orderId) {
    let orderStatus: "paid" | "cancelled" | "refunded" | "pending" = "pending";
    if (status === "approved") orderStatus = "paid";
    if (status === "rejected" || status === "cancelled") orderStatus = "cancelled";
    if (status === "refunded") orderStatus = "refunded";
    await dbUpdateOrderPayment(String(orderId), String(paymentId), orderStatus, {
      moneyReleaseDate: moneyRelease,
      statusDetail,
    });
  }

  return { ok: true, status };
}

export async function POST(request: Request) {
  try {
    const paymentId = await extractPaymentId(request);
    if (!paymentId) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    const result = await processPayment(paymentId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("MP webhook error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const paymentId = await extractPaymentId(request);
    if (paymentId) {
      await processPayment(paymentId);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("MP webhook GET error", error);
    return NextResponse.json({ ok: true });
  }
}
