const DEFAULT_WHATSAPP = "5491135787669";

/** Solo dígitos, listo para wa.me (ej: 5491135787669). */
export function normalizeWhatsappNumber(raw?: string | null): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return DEFAULT_WHATSAPP;
  // Si pegaron 11... sin país, asumimos Argentina móvil
  if (digits.length === 10 && digits.startsWith("11")) return `549${digits}`;
  if (digits.length === 11 && digits.startsWith("911")) return `54${digits}`;
  return digits;
}

export const WHATSAPP_NUMBER = normalizeWhatsappNumber(
  process.env.NEXT_PUBLIC_WHATSAPP || DEFAULT_WHATSAPP,
);

export function whatsappUrl(message?: string, number?: string): string {
  const phone = normalizeWhatsappNumber(number ?? WHATSAPP_NUMBER);
  const base = `https://wa.me/${phone}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
