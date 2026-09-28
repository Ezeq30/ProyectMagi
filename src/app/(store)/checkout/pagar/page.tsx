import { notFound } from "next/navigation";
import { PaymentTransferPanel } from "@/components/PaymentTransferPanel";
import { dbGetOrderByNumber, dbGetSettings } from "@/lib/db";
import { isMercadoPagoReady } from "@/lib/mercadopago";
import {
  hasTransferPayment,
  ticketMethodFromNotes,
  ticketUrlFromNotes,
} from "@/lib/payment";

type Props = {
  searchParams: Promise<{ order?: string; autostart?: string }>;
};

export default async function CheckoutPayPage({ searchParams }: Props) {
  const { order: orderNumber, autostart } = await searchParams;
  if (!orderNumber) notFound();

  const [order, settings, mpReady] = await Promise.all([
    dbGetOrderByNumber(orderNumber),
    dbGetSettings(),
    isMercadoPagoReady(),
  ]);

  if (!order) notFound();

  const notesLower = order.notes.toLowerCase();
  const payTransfer =
    notesLower.includes("pago: transferencia") || notesLower.includes("pago: efectivo");
  const ticketMethod = ticketMethodFromNotes(order.notes);
  const arrangeWithSeller = notesLower.includes("a coordinar con el vendedor");

  const canPay = Boolean(ticketMethod) || payTransfer || mpReady || hasTransferPayment(settings);
  if (!canPay) notFound();

  return (
    <PaymentTransferPanel
      orderNumber={order.order_number}
      total={order.total}
      subtotal={order.subtotal}
      shippingCost={order.shipping_cost}
      discount={order.discount}
      shippingLabel={arrangeWithSeller ? "Envío (a coordinar)" : "Envío"}
      paymentMethod={ticketMethod ? "ticket" : payTransfer ? "transfer" : "mercadopago"}
      ticketMethod={ticketMethod ?? undefined}
      ticketUrl={ticketUrlFromNotes(order.notes) ?? undefined}
      orderStatus={order.status}
      alias={settings.payment_alias}
      cbu={settings.payment_cbu}
      holder={settings.payment_holder}
      whatsapp={settings.whatsapp}
      mpReady={mpReady}
      autoStartMp={autostart === "1"}
    />
  );
}
