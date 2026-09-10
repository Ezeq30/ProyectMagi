import type { ProductVariant } from "@/lib/types";

const FALLBACK = "#9a9590";

/** Nombres habituales en catálogo AR → CSS (incluye tonos tipo Juanita Jo). */
const COLOR_MAP: Record<string, string> = {
  negro: "#1a1a1a",
  black: "#1a1a1a",
  blanco: "#f5f2ec",
  white: "#f5f2ec",
  crema: "#efe6d6",
  cream: "#efe6d6",
  beige: "#d9cbb8",
  nude: "#e0c4b0",
  camel: "#c4a574",
  marron: "#6b4a32",
  marrón: "#6b4a32",
  brown: "#6b4a32",
  chocolate: "#4a2f22",
  vison: "#a89888",
  visón: "#a89888",
  taupe: "#8b7e74",
  gris: "#8a8680",
  gray: "#8a8680",
  grey: "#8a8680",
  plata: "#c5c5c8",
  plateado: "#c5c5c8",
  dorado: "#c5a35a",
  oro: "#c5a35a",
  gold: "#c5a35a",
  rojo: "#b33a3a",
  red: "#b33a3a",
  bordo: "#6e1f2a",
  bordó: "#6e1f2a",
  burgundy: "#6e1f2a",
  rosa: "#d4a0b0",
  pink: "#d4a0b0",
  fucsia: "#c43b7a",
  durazno: "#e8b896",
  peach: "#e8b896",
  naranja: "#d4783a",
  orange: "#d4783a",
  amarillo: "#e0c34a",
  yellow: "#e0c34a",
  verde: "#4a6b4a",
  green: "#4a6b4a",
  oliva: "#6b7340",
  sage: "#8a9a7a",
  menta: "#8fbea8",
  azul: "#3a4a6b",
  blue: "#3a4a6b",
  navy: "#1e2a44",
  celeste: "#7eb0d0",
  turquesa: "#3a9a8a",
  violeta: "#6b4a7a",
  purple: "#6b4a7a",
  lila: "#b09ac4",
  lavanda: "#b09ac4",
};

function normalizeColorKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Color CSS para pintar el swatch a partir del nombre del variante. */
export function swatchCss(colorName: string): string {
  const key = normalizeColorKey(colorName);
  if (COLOR_MAP[key]) return COLOR_MAP[key];

  // Match parcial: "Azul marino" → azul, "Rosa viejo" → rosa
  for (const [name, css] of Object.entries(COLOR_MAP)) {
    if (key.includes(name) || name.includes(key)) return css;
  }
  return FALLBACK;
}

export function isLightSwatch(css: string): boolean {
  const hex = css.replace("#", "");
  if (hex.length !== 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 186;
}

export function colorVariantsOf(variants: ProductVariant[] | undefined): ProductVariant[] {
  return (variants ?? []).filter((v) => v.name.toLowerCase() === "color");
}

/** Imagen del color: foto asignada, o fallback por índice / primera. */
export function imageForColorVariant(
  images: string[],
  variant: ProductVariant | undefined,
  colorIndex: number,
  fallback = "https://placehold.co/800x1000/1a1a1a/fafaf8/png?text=Tortugas",
): string {
  if (variant?.image_url) return variant.image_url;
  return imageForColorIndex(images, colorIndex, fallback);
}

/** @deprecated Prefer imageForColorVariant */
export function imageForColorIndex(
  images: string[],
  colorIndex: number,
  fallback = "https://placehold.co/800x1000/1a1a1a/fafaf8/png?text=Tortugas",
): string {
  if (!images.length) return fallback;
  return images[colorIndex] ?? images[0] ?? fallback;
}
