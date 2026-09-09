import type { ThemeColors } from "./types";

/** Paleta fija — Boutique premium (claro / oscuro) */
export const BRAND_PALETTE = [
  { id: "ink", name: "Ink", hex: "#1A1A1A", role: "Texto / tipografía" },
  { id: "sage", name: "Sage Green", hex: "#5F7F6E", role: "CTA / ofertas" },
  { id: "offwhite", name: "Gallery White", hex: "#FAFAF8", role: "Fondo claro" },
  { id: "gold", name: "Matte Gold", hex: "#C4A574", role: "Acentos premium" },
] as const;

export type PaletteHex = (typeof BRAND_PALETTE)[number]["hex"];

export const DEFAULT_THEME: ThemeColors = {
  primary: "#C4A574",
  sage: "#5F7F6E",
  gold: "#C4A574",
  background: "#FAFAF8",
  card: "#FFFFFF",
};

export function isPaletteColor(hex: string): boolean {
  const normalized = hex.toUpperCase();
  return (
    BRAND_PALETTE.some((c) => c.hex.toUpperCase() === normalized) ||
    normalized === "#FFFFFF" ||
    normalized === "#FAFAF8" ||
    normalized === "#1A1A1A"
  );
}

/** Solo acentos de marca — superficies las controla light/dark en CSS */
export function themeToCssVars(theme: ThemeColors): Record<string, string> {
  const sage = theme.sage || DEFAULT_THEME.sage;
  const gold = theme.gold || DEFAULT_THEME.gold;
  const primary = theme.primary || DEFAULT_THEME.primary;

  return {
    "--accent": sage,
    "--accent-deep": shade(sage, -18),
    "--gold": gold,
    "--primary": primary,
    "--success": sage,
    "--sale": "#3D8B6E",
  };
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
