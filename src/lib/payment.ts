export const STORE_DISPLAY_NAME = "Accesorios Tortugas Online";

/** Descuento por pago en efectivo sobre el precio de lista. */
export const CASH_DISCOUNT_PERCENT = 5;

export type CheckoutPaymentMethod = "mercadopago" | "cash";

export function calcCashDiscount(
  subtotal: number,
  method: CheckoutPaymentMethod | string | undefined,
): number {
  if (method !== "cash") return 0;
  const base = Math.max(0, Number(subtotal) || 0);
  return Math.round((base * CASH_DISCOUNT_PERCENT) / 100);
}

export function cashPrice(listPrice: number): number {
  const price = Math.max(0, Number(listPrice) || 0);
  return Math.max(0, Math.round(price * (1 - CASH_DISCOUNT_PERCENT / 100)));
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
