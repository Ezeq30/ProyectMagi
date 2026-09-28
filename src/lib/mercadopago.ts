import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { getSiteUrl } from "./site-url";
import {
  paymentPayeeLabel,
  STORE_DISPLAY_NAME,
  TICKET_EXPIRATION_DAYS,
  type TicketMethod,
} from "./payment";
import {
  canUseAdminRpc,
  createServerDataClient,
  getAdminWriteToken,
  hasServiceRole,
  useSupabaseData,
} from "./supabase/admin";
import type { CartItem, Order } from "./types";
import { dbGetSettings } from "./db";

function envMpToken(): string {
  const token = (process.env.MP_ACCESS_TOKEN ?? "").trim();
  if (!token || token === "[SENSITIVE]") return "";
  return token;
}

/** Token desde Vercel o desde Config del admin (Supabase privado). */
export async function resolveMpAccessToken(): Promise<string> {
  const fromEnv = envMpToken();
  if (fromEnv) return fromEnv;

  if (!useSupabaseData() || !canUseAdminRpc()) return "";

  try {
    const sb = createServerDataClient();
    const { data, error } = await sb.rpc("admin_get_mp_token", {
      p_token: getAdminWriteToken(),
    });
    if (error) {
      console.error("admin_get_mp_token", error);
      return "";
    }
    return String(data ?? "").trim();
  } catch (e) {
    console.error(e);
    return "";
  }
}

export function isMercadoPagoConfigured(): boolean {
  // Sync check solo mira env; el flujo async usa resolveMpAccessToken
  return Boolean(envMpToken());
}

export async function isMercadoPagoReady(): Promise<boolean> {
  return Boolean(await resolveMpAccessToken());
}

export async function saveMpAccessToken(accessToken: string): Promise<void> {
  if (!useSupabaseData()) {
    throw new Error("Supabase no configurado");
  }
  const sb = createServerDataClient();
  if (hasServiceRole()) {
    // prefer RPC anyway for private schema
  }
  const { error } = await sb.rpc("admin_set_mp_token", {
    p_token: getAdminWriteToken(),
    p_access_token: accessToken.trim(),
  });
  if (error) throw error;
}

export async function hasStoredMpToken(): Promise<boolean> {
  const token = await resolveMpAccessToken();
  return Boolean(token);
}

async function createPreferenceBody(params: {
  orderId: string;
  orderNumber: string;
  unitPrice: number;
  title: string;
  description: string;
  payerEmail: string;
}): Promise<{ id: string; init_point: string }> {
  const token = await resolveMpAccessToken();
  if (!token) {
    throw new Error(
      "El pago online aún no está activado. Usá la transferencia por alias o CBU más abajo.",
    );
  }

  const siteUrl = getSiteUrl();
  const client = new MercadoPagoConfig({ accessToken: token });
  const preference = new Preference(client);

  const amount = Number(Math.max(0, params.unitPrice).toFixed(2));
  if (amount <= 0) {
    throw new Error("El monto del pedido debe ser mayor a 0");
  }

  const result = await preference.create({
    body: {
      items: [
        {
          id: params.orderId,
          title: params.title,
          description: params.description,
          quantity: 1,
          unit_price: amount,
          currency_id: "ARS",
        },
      ],
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
      // Hasta 13 caracteres en el resumen de tarjeta
      statement_descriptor: "TORTUGAS",
    },
  });

  const initPoint = result.init_point || result.sandbox_init_point;
  if (!result.id || !initPoint) {
    throw new Error("No se pudo crear la preferencia de Mercado Pago");
  }

  return { id: result.id, init_point: initPoint };
}

function buildPayeeCopy(holder: string | undefined, orderNumber: string) {
  const payee = paymentPayeeLabel(holder);
  return {
    title: `${STORE_DISPLAY_NAME} · Pedido ${orderNumber}`,
    description: payee,
  };
}

export async function createCheckoutPreference(params: {
  orderId: string;
  orderNumber: string;
  items: CartItem[];
  shippingCost: number;
  discount: number;
  payerEmail: string;
}): Promise<{ id: string; init_point: string } | null> {
  if (!(await isMercadoPagoReady())) return null;

  const subtotal = params.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = Math.max(0, subtotal - params.discount + params.shippingCost);
  const settings = await dbGetSettings();
  const copy = buildPayeeCopy(settings.payment_holder, params.orderNumber);

  return createPreferenceBody({
    orderId: params.orderId,
    orderNumber: params.orderNumber,
    unitPrice: total,
    title: copy.title,
    description: copy.description,
    payerEmail: params.payerEmail,
  });
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: parts[0] ?? "Cliente", last: parts[0] ?? "Cliente" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

/** Emite un cupón de Pago Fácil / Rapipago para pagar en efectivo en sucursal. */
export async function createCashTicket(params: {
  orderId: string;
  orderNumber: string;
  amount: number;
  method: TicketMethod;
  payerEmail: string;
  payerName: string;
  payerDni: string;
}): Promise<{ paymentId: string; ticketUrl: string; expiresAt: string }> {
  const token = await resolveMpAccessToken();
  if (!token) {
    throw new Error("El pago en efectivo no está disponible por el momento.");
  }

  const amount = Number(Math.max(0, params.amount).toFixed(2));
  if (amount < 50) {
    throw new Error("El monto mínimo para pagar en efectivo es $50.");
  }

  const expiresAt = new Date(
    Date.now() + TICKET_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { first, last } = splitName(params.payerName);
  const siteUrl = getSiteUrl();
  const settings = await dbGetSettings();

  const client = new MercadoPagoConfig({ accessToken: token });
  const result = await new Payment(client).create({
    body: {
      transaction_amount: amount,
      description: buildPayeeCopy(settings.payment_holder, params.orderNumber).title,
      payment_method_id: params.method,
      external_reference: params.orderId,
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      date_of_expiration: expiresAt,
      statement_descriptor: "TORTUGAS",
      metadata: { order_number: params.orderNumber },
      payer: {
        email: params.payerEmail,
        first_name: first,
        last_name: last,
        identification: { type: "DNI", number: params.payerDni },
      },
    },
    requestOptions: { idempotencyKey: `ticket-${params.orderId}` },
  });

  const ticketUrl = result.transaction_details?.external_resource_url;
  if (!result.id || !ticketUrl) {
    throw new Error("No se pudo generar el cupón de pago.");
  }

  return { paymentId: String(result.id), ticketUrl, expiresAt };
}

export async function createPreferenceForOrder(
  order: Order,
): Promise<{ id: string; init_point: string }> {
  const settings = await dbGetSettings();
  const copy = buildPayeeCopy(settings.payment_holder, order.order_number);

  return createPreferenceBody({
    orderId: order.id,
    orderNumber: order.order_number,
    unitPrice: order.total,
    title: copy.title,
    description: copy.description,
    payerEmail: order.customer_email,
  });
}
