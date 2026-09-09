import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { dbGetOrderByNumber, dbUpdateOrderPayment } from "@/lib/db";
import { resolveMpAccessToken } from "@/lib/mercadopago";

/** Reconsulta el pago en MP si el pedido quedó pending al volver a /exito */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderNumber = String(body.orderNumber ?? "").trim();
    if (!orderNumber) {
      return NextResponse.json({ error: "Falta pedido" }, { status: 400 });
    }

    const order = await dbGetOrderByNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({
        ok: true,
        status: order.status,
        moneyReleaseDate: order.mp_money_release_date,
      });
    }

    const token = await resolveMpAccessToken();
    if (!token) {
      return NextResponse.json({ ok: true, status: order.status });
    }

    const paymentIdFromQuery = String(body.paymentId ?? "").trim();
    const client = new MercadoPagoConfig({ accessToken: token });
    const paymentApi = new Payment(client);

    let paymentId = paymentIdFromQuery || order.mp_payment_id || "";

    if (!paymentId) {
      // Buscar por external_reference (id del pedido)
      const searchUrl = new URL("https://api.mercadopago.com/v1/payments/search");
      searchUrl.searchParams.set("external_reference", order.id);
      searchUrl.searchParams.set("sort", "date_created");
      searchUrl.searchParams.set("criteria", "desc");
      const res = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as {
          results?: Array<{ id?: number | string }>;
        };
        const first = data.results?.[0];
        if (first?.id) paymentId = String(first.id);
      }
    }

    if (!paymentId) {
      return NextResponse.json({ ok: true, status: order.status, synced: false });
    }

    const payment = await paymentApi.get({ id: paymentId });
    const status = payment.status;
    const moneyRelease =
      (payment as { money_release_date?: string | null }).money_release_date ?? null;
    const statusDetail =
      (payment as { status_detail?: string | null }).status_detail ?? null;

    let orderStatus: "paid" | "cancelled" | "refunded" | "pending" = "pending";
    if (status === "approved") orderStatus = "paid";
    if (status === "rejected" || status === "cancelled") orderStatus = "cancelled";
    if (status === "refunded") orderStatus = "refunded";

    await dbUpdateOrderPayment(order.id, paymentId, orderStatus, {
      moneyReleaseDate: moneyRelease,
      statusDetail,
    });

    return NextResponse.json({
      ok: true,
      status: orderStatus,
      synced: true,
      moneyReleaseDate: moneyRelease,
    });
  } catch (error) {
    console.error("MP sync:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al sincronizar" },
      { status: 500 },
    );
  }
}
