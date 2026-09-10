export type ProductColorInput = {
  value: string;
  stock: number;
  image?: string | null;
};

export function parseProductColors(raw: unknown): ProductColorInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") {
        return { value: item.trim(), stock: 0, image: null };
      }
      if (item && typeof item === "object") {
        const row = item as {
          value?: unknown;
          stock?: unknown;
          image?: unknown;
          image_url?: unknown;
        };
        const imageRaw = row.image ?? row.image_url;
        const image =
          imageRaw != null && String(imageRaw).trim()
            ? String(imageRaw).trim()
            : null;
        return {
          value: String(row.value ?? "").trim(),
          stock: Math.max(0, Number(row.stock) || 0),
          image,
        };
      }
      return { value: "", stock: 0, image: null };
    })
    .filter((c) => c.value);
}

export const MAX_PRODUCT_IMAGES = 8;
