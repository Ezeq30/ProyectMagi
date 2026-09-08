import {
  dbGetCategories,
  dbGetCoupon,
  dbGetProductById,
  dbGetProductBySlug,
  dbGetProducts,
  dbGetSettings,
} from "./db";
import type { Category, Coupon, Product, SiteSettings } from "./types";

export async function getSettings(): Promise<SiteSettings> {
  return dbGetSettings();
}

export async function getCategories(): Promise<Category[]> {
  return dbGetCategories();
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
  return dbGetProducts(options);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return dbGetProductBySlug(slug);
}

export async function getProductById(id: string): Promise<Product | null> {
  return dbGetProductById(id);
}

export async function getCoupon(code: string): Promise<Coupon | null> {
  return dbGetCoupon(code);
}

export function calcShipping(
  _subtotal: number,
  settings: SiteSettings,
): number {
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
