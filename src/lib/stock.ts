import type { Product } from "@/lib/types";

export const LOW_STOCK_THRESHOLD = 3;

export type LowStockRow = {
  productId: string;
  productName: string;
  label: string;
  stock: number;
};

/** Productos o colores con stock ≤ umbral (incluye 0). */
export function getLowStockRows(
  products: Product[],
  threshold = LOW_STOCK_THRESHOLD,
): LowStockRow[] {
  const rows: LowStockRow[] = [];
  for (const p of products) {
    if (!p.active) continue;
    const colors = (p.variants ?? []).filter(
      (v) => v.name.toLowerCase() === "color",
    );
    if (colors.length > 0) {
      for (const c of colors) {
        if (c.stock <= threshold) {
          rows.push({
            productId: p.id,
            productName: p.name,
            label: c.value,
            stock: c.stock,
          });
        }
      }
    } else if (p.stock <= threshold) {
      rows.push({
        productId: p.id,
        productName: p.name,
        label: "Stock general",
        stock: p.stock,
      });
    }
  }
  return rows.sort((a, b) => a.stock - b.stock || a.productName.localeCompare(b.productName));
}

export function productMinStock(p: Product): number {
  const colors = (p.variants ?? []).filter(
    (v) => v.name.toLowerCase() === "color",
  );
  if (colors.length > 0) {
    return Math.min(...colors.map((c) => c.stock));
  }
  return p.stock;
}

export function isProductLowStock(
  p: Product,
  threshold = LOW_STOCK_THRESHOLD,
): boolean {
  return productMinStock(p) <= threshold;
}
