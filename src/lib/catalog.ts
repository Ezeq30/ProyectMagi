import { readStore } from "./data/store";
import type { Category, Coupon, Product, SiteSettings } from "./types";

export async function getSettings(): Promise<SiteSettings> {
  const store = await readStore();
  return store.settings;
}

export async function getCategories(): Promise<Category[]> {
  const store = await readStore();
  return [...store.categories].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function getProducts(options?: {
  categoryId?: string;
  featured?: boolean;
  bestseller?: boolean;
  activeOnly?: boolean;
}): Promise<Product[]> {
  const store = await readStore();
  let products = store.products;
  const activeOnly = options?.activeOnly ?? true;
  if (activeOnly) products = products.filter((p) => p.active);
  if (options?.categoryId) {
    products = products.filter((p) => p.category_id === options.categoryId);
  }
  if (options?.featured) products = products.filter((p) => p.featured);
  if (options?.bestseller) products = products.filter((p) => p.bestseller);
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const store = await readStore();
  return store.products.find((p) => p.slug === slug && p.active) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const store = await readStore();
  return store.products.find((p) => p.id === id) ?? null;
}

export async function getCoupon(code: string): Promise<Coupon | null> {
  const store = await readStore();
  const coupon = store.coupons.find(
    (c) => c.code.toLowerCase() === code.toLowerCase() && c.active,
  );
  return coupon ?? null;
}

export function calcShipping(
  subtotal: number,
  settings: SiteSettings,
): number {
  if (subtotal >= settings.free_shipping_from) return 0;
  return settings.flat_shipping_cost;
}

export function calcDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  if (subtotal < coupon.min_subtotal) return 0;
  if (coupon.percent_off != null) {
    return Math.round((subtotal * coupon.percent_off) / 100);
  }
  if (coupon.amount_off != null) {
    return Math.min(subtotal, coupon.amount_off);
  }
  return 0;
}
