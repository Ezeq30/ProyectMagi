import { formatPrice } from "@/lib/format";
import { getSettings } from "@/lib/catalog";
import type { Order } from "@/lib/types";
import { normalizeWhatsappNumber, whatsappUrl } from "@/lib/whatsapp";

export type OrderNotifyEvent = "created" | "paid";

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function buildSellerOrderMessage(
  order: Order,
  event: OrderNotifyEvent = "created",
): string {
  const title =
    event === "paid"
      ? `✅ Pedido PAGADO ${order.order_number}`
      : `🐢 Nuevo pedido ${order.order_number}`;

  const lines = [
    title,
    `Total: ${formatPrice(order.total)}`,
    `Cliente: ${order.customer_name}`,
    `Tel: ${order.customer_phone}`,
    `Email: ${order.customer_email}`,
    `Envío: ${order.shipping_address}, ${order.shipping_city} (${order.shipping_postal})`,
  ];

  if (order.coupon_code) lines.push(`Cupón: ${order.coupon_code}`);
  if (order.notes) lines.push(`Notas:\n${order.notes}`);

  const items = order.items
    .map(
      (i) =>
        `• ${i.product_name}${i.variant_label ? ` (${i.variant_label})` : ""} x${i.quantity}`,
    )
    .join("\n");
  if (items) lines.push(`Items:\n${items}`);

  return lines.join("\n");
}

export function buildCustomerOrderMessage(
  order: Order,
  kind: "ready" | "shipped" = "ready",
): string {
  const greeting = `Hola ${order.customer_name}! Soy Magali de Accesorios Tortugas 🐢`;
  if (kind === "shipped") {
    return `${greeting}\n\nTu pedido ${order.order_number} ya está en camino.\nTotal: ${formatPrice(order.total)}\n\n¡Gracias por tu compra!`;
  }
  return `${greeting}\n\nTu pedido ${order.order_number} está listo.\nTotal: ${formatPrice(order.total)}\n\n¿Coordinamos entrega o retiro?`;
}

export async function sellerOrderNotifyUrl(
  order: Order,
  event: OrderNotifyEvent = "created",
): Promise<string> {
  const settings = await getSettings();
  return whatsappUrl(buildSellerOrderMessage(order, event), settings.whatsapp);
}

export function customerOrderWhatsAppUrl(
  order: Order,
  kind: "ready" | "shipped" = "ready",
): string {
  return whatsappUrl(buildCustomerOrderMessage(order, kind), order.customer_phone);
}

/**
 * Aviso a Magali: CallMeBot y/o webhook opcional.
 * Sin API externa no se puede empujar WhatsApp solo con wa.me.
 */
export async function notifySellerOrder(
  order: Order,
  event: OrderNotifyEvent = "created",
): Promise<{ sent: boolean; channel?: string }> {
  const message = buildSellerOrderMessage(order, event);
  const settings = await getSettings();
  const phone = normalizeWhatsappNumber(settings.whatsapp);

  const webhook = env("ORDER_NOTIFY_WEBHOOK");
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          phone,
          message,
          order_number: order.order_number,
          total: order.total,
          customer_name: order.customer_name,
        }),
      });
      if (res.ok) return { sent: true, channel: "webhook" };
      console.error("ORDER_NOTIFY_WEBHOOK failed", res.status);
    } catch (e) {
      console.error("ORDER_NOTIFY_WEBHOOK error", e);
    }
  }

  const callmebotKey = env("CALLMEBOT_API_KEY");
  if (callmebotKey) {
    try {
      const url = new URL("https://api.callmebot.com/whatsapp.php");
      url.searchParams.set("phone", phone);
      url.searchParams.set("text", message);
      url.searchParams.set("apikey", callmebotKey);
      const res = await fetch(url.toString());
      if (res.ok) return { sent: true, channel: "callmebot" };
      console.error("CallMeBot failed", res.status, await res.text().catch(() => ""));
    } catch (e) {
      console.error("CallMeBot error", e);
    }
  }

  console.info(
    `[order-notify] ${event} ${order.order_number} — sin canal automático. wa.me:`,
    whatsappUrl(message, phone),
  );
  return { sent: false };
}
