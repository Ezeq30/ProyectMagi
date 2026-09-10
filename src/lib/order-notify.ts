import { getSettings } from "@/lib/catalog";
import {
  buildSellerOrderMessage,
  type OrderNotifyEvent,
} from "@/lib/order-messages";
import type { Order } from "@/lib/types";
import { normalizeWhatsappNumber, whatsappUrl } from "@/lib/whatsapp";

export type { OrderNotifyEvent } from "@/lib/order-messages";
export {
  buildCustomerOrderMessage,
  buildSellerOrderMessage,
  customerOrderWhatsAppUrl,
} from "@/lib/order-messages";

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

export async function sellerOrderNotifyUrl(
  order: Order,
  event: OrderNotifyEvent = "created",
): Promise<string> {
  const settings = await getSettings();
  return whatsappUrl(buildSellerOrderMessage(order, event), settings.whatsapp);
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
