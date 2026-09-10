import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";
import { whatsappUrl } from "@/lib/whatsapp";

export type OrderNotifyEvent = "created" | "paid";

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

export function customerOrderWhatsAppUrl(
  order: Order,
  kind: "ready" | "shipped" = "ready",
): string {
  return whatsappUrl(buildCustomerOrderMessage(order, kind), order.customer_phone);
}
