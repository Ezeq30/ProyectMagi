export const STORE_DISPLAY_NAME = "Accesorios Tortugas Online";

/** Descuento por pago con transferencia sobre el precio de lista. */
export const TRANSFER_DISCOUNT_PERCENT = 5;

export type CheckoutPaymentMethod = "mercadopago" | "transfer" | "ticket";

/** Cupones de pago en efectivo que emite Mercado Pago. */
export type TicketMethod = "pagofacil" | "rapipago";

export const TICKET_METHOD_LABELS: Record<TicketMethod, string> = {
  pagofacil: "Pago Fácil",
  rapipago: "Rapipago",
};

/** Días hasta que vence el cupón. */
export const TICKET_EXPIRATION_DAYS = 3;

/** Acepta "cash" de carritos/pedidos anteriores y lo trata como transferencia. */
export function normalizePaymentMethod(value: unknown): CheckoutPaymentMethod {
  if (value === "ticket") return "ticket";
  return value === "transfer" || value === "cash" ? "transfer" : "mercadopago";
}

export function normalizeTicketMethod(value: unknown): TicketMethod {
  return value === "rapipago" ? "rapipago" : "pagofacil";
}

/** DNI argentino: 7 u 8 dígitos. Devuelve solo los dígitos o null si no es válido. */
export function parseDni(value: unknown): string | null {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 8 ? digits : null;
}

/** Línea de la nota del pedido donde se guarda el link del cupón. */
export const TICKET_URL_NOTE_PREFIX = "Cupón: ";

export function ticketUrlFromNotes(notes: string): string | null {
  const line = notes
    .split("\n")
    .find((l) => l.startsWith(TICKET_URL_NOTE_PREFIX));
  const url = line?.slice(TICKET_URL_NOTE_PREFIX.length).trim();
  return url && url.startsWith("https://") ? url : null;
}

export function ticketMethodFromNotes(notes: string): TicketMethod | null {
  const lower = notes.toLowerCase();
  if (!lower.includes("pago: cupón")) return null;
  return lower.includes("rapipago") ? "rapipago" : "pagofacil";
}

export function calcTransferDiscount(
  subtotal: number,
  method: CheckoutPaymentMethod | string | undefined,
): number {
  if (normalizePaymentMethod(method) !== "transfer") return 0;
  const base = Math.max(0, Number(subtotal) || 0);
  return Math.round((base * TRANSFER_DISCOUNT_PERCENT) / 100);
}

export function transferPrice(listPrice: number): number {
  const price = Math.max(0, Number(listPrice) || 0);
  return Math.max(0, Math.round(price * (1 - TRANSFER_DISCOUNT_PERCENT / 100)));
}

export function hasTransferPayment(settings: {
  payment_alias?: string;
  payment_cbu?: string;
}): boolean {
  return Boolean(settings.payment_alias?.trim() || settings.payment_cbu?.trim());
}

/** Texto de cobro: tienda + titular (si está cargado). */
export function paymentPayeeLabel(holder?: string): string {
  const store = STORE_DISPLAY_NAME;
  const name = holder?.trim();
  if (!name) return store;
  return `${store} · Titular: ${name}`;
}

/** Web válida de Mercado Pago (abre la app en muchos celulares). */
export const MERCADOPAGO_WEB_URL = "https://www.mercadopago.com.ar/";

/** Deep link de la app (si está instalada). */
export const MERCADOPAGO_APP_URL = "mercadopago://home";

/**
 * Intenta abrir la app de Mercado Pago; si no responde, cae a la web oficial.
 * El alias se copia antes desde la UI.
 */
export function openMercadoPagoApp(): void {
  const started = Date.now();
  const fallback = () => {
    if (Date.now() - started < 2200) {
      window.location.href = MERCADOPAGO_WEB_URL;
    }
  };

  try {
    window.location.href = MERCADOPAGO_APP_URL;
  } catch {
    window.location.href = MERCADOPAGO_WEB_URL;
    return;
  }

  window.setTimeout(fallback, 1200);
}
