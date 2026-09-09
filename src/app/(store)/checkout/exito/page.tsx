import Link from "next/link";
import { MpPaymentSync } from "@/components/MpPaymentSync";
import { ShareReceiptButton } from "@/components/ShareReceiptButton";
import { dbGetOrderByNumber, dbGetSettings } from "@/lib/db";
import { formatPrice } from "@/lib/format";

type Props = {
  searchParams: Promise<{
    order?: string;
    demo?: string;
    payment_id?: string;
    status?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order, demo, payment_id, status } = await searchParams;
  const [settings, orderData] = await Promise.all([
    dbGetSettings(),
    order ? dbGetOrderByNumber(order) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">¡Gracias por tu compra!</h1>
      {order && (
        <p className="mt-4 text-ink-soft">
          Número de pedido: <strong className="text-ink">{order}</strong>
        </p>
      )}
      {orderData && (
        <p className="mt-2 text-ink-soft">
          Total: <strong className="text-ink">{formatPrice(orderData.total)}</strong>
        </p>
      )}
      {status === "approved" || orderData?.status === "paid" ? (
        <p className="mt-3 text-sm text-success">Pago aprobado en Mercado Pago.</p>
      ) : null}
      {order && (
        <MpPaymentSync
          orderNumber={order}
          paymentId={payment_id}
          initialStatus={orderData?.status}
        />
      )}
      {demo === "1" && (
        <p className="mt-3 text-sm text-ink-soft">
          El pedido quedó registrado. Coordiná el pago y enviá el comprobante por WhatsApp.
        </p>
      )}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <ShareReceiptButton
          orderNumber={order ?? ""}
          total={orderData?.total ?? 0}
          whatsapp={settings.whatsapp}
        />
        <Link href="/productos" className="magi-btn magi-btn-outline">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
