import { MercadoPagoConfig, Preference } from "mercadopago";
import { getSiteUrl } from "./site-url";
import type { CartItem } from "./types";

export function isMercadoPagoConfigured(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

export async function createCheckoutPreference(params: {
  orderId: string;
  orderNumber: string;
  items: CartItem[];
  shippingCost: number;
  discount: number;
  payerEmail: string;
}): Promise<{ id: string; init_point: string } | null> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;

  const siteUrl = getSiteUrl();
  const client = new MercadoPagoConfig({ accessToken: token });
  const preference = new Preference(client);

  const subtotal = params.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const payableItems = Math.max(0, subtotal - params.discount);

  const mpItems: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: "ARS";
  }> = [
    {
      id: params.orderId,
      title: `Pedido Accesorios Tortugas ${params.orderNumber}`,
      quantity: 1,
      unit_price: Number(payableItems.toFixed(2)),
      currency_id: "ARS",
    },
  ];

  if (params.shippingCost > 0) {
    mpItems.push({
      id: "shipping",
      title: "Envío",
      quantity: 1,
      unit_price: Number(params.shippingCost.toFixed(2)),
      currency_id: "ARS",
    });
  }

  const result = await preference.create({
    body: {
      items: mpItems,
      payer: { email: params.payerEmail },
      external_reference: params.orderId,
      metadata: { order_number: params.orderNumber },
      back_urls: {
        success: `${siteUrl}/checkout/exito?order=${params.orderNumber}`,
        pending: `${siteUrl}/checkout/pendiente?order=${params.orderNumber}`,
        failure: `${siteUrl}/checkout/error?order=${params.orderNumber}`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
    },
  });

  if (!result.id || !result.init_point) {
    throw new Error("No se pudo crear la preferencia de Mercado Pago");
  }

  return { id: result.id, init_point: result.init_point };
}
