import type { ThemeColors } from "./types";

/** Paleta fija — Guía de estilo lujo minimalista */
export const BRAND_PALETTE = [
  { id: "taupe", name: "Beige Taupe", hex: "#C2A87D", role: "Color primario" },
  { id: "sage", name: "Sage Green", hex: "#6B8A7A", role: "Detalles / botones" },
  { id: "offwhite", name: "Off White", hex: "#F9F6F1", role: "Fondo sugerido" },
  { id: "gold", name: "Matte Gold", hex: "#D4AF87", role: "Acentos premium" },
] as const;

export type PaletteHex = (typeof BRAND_PALETTE)[number]["hex"];

export const DEFAULT_THEME: ThemeColors = {
  primary: "#C2A87D",
  sage: "#6B8A7A",
  gold: "#D4AF87",
  background: "#F9F6F1",
  card: "#FFFFFF",
};

export function isPaletteColor(hex: string): boolean {
  const normalized = hex.toUpperCase();
  return (
    BRAND_PALETTE.some((c) => c.hex.toUpperCase() === normalized) ||
    normalized === "#FFFFFF"
  );
}

export function themeToCssVars(theme: ThemeColors): Record<string, string> {
  const background = theme.background || DEFAULT_THEME.background;
  const card = theme.card || DEFAULT_THEME.card;
  const sage = DEFAULT_THEME.sage;
  const gold = DEFAULT_THEME.gold;
  const primary = DEFAULT_THEME.primary;

  return {
    "--bg": background,
    "--bg-deep": shade(background, -6),
    "--card": card,
    "--card-text": isDark(card) ? "#fffcf7" : "#3a342c",
    "--card-muted": isDark(card) ? "#e8e0d6" : "#6b6358",
    "--ink": "#3a342c",
    "--ink-soft": "#6b6358",
    "--accent": sage,
    "--accent-deep": shade(sage, -18),
    "--gold": gold,
    "--primary": primary,
    "--line": shade(primary, 38),
    "--white": "#fffcf7",
    "--success": sage,
  };
}

function isDark(hex: string): boolean {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return false;
  const num = parseInt(raw, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  // relative luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

function shade(hex: string, percent: number): string {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return hex;
  const num = parseInt(raw, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
