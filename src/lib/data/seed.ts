import type { Category, Coupon, Product, SiteSettings } from "../types";
import { DEFAULT_THEME } from "../theme";

export const DEFAULT_SETTINGS: SiteSettings = {
  free_shipping_from: 0,
  flat_shipping_cost: 4500,
  whatsapp: "5491135787669",
  promo_banner:
    "Lujo minimalista · Elegante y natural | WhatsApp 11 3578-7669",
  about_title: "Elegante y natural",
  about_text:
    "Somos Accesorios Tortugas Online: carteras, bolsos, mochilas, bijou y vasos elegidos con cuidado. Comprá online y recibí en todo el país.",
  hero_headline: "Accesorios con estilo propio",
  hero_sub: "Carteras, bolsos, mochilas, bijou y vasos — lujo minimalista.",
  theme: { ...DEFAULT_THEME },
};

/** Categorías principales de la tienda */
export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-carteras",
    name: "Carteras",
    slug: "carteras",
    parent_id: null,
    sort_order: 1,
  },
  {
    id: "cat-bolsos",
    name: "Bolsos",
    slug: "bolsos",
    parent_id: null,
    sort_order: 2,
  },
  {
    id: "cat-mochilas",
    name: "Mochilas",
    slug: "mochilas",
    parent_id: null,
    sort_order: 3,
  },
  {
    id: "cat-bijou",
    name: "Bijou",
    slug: "bijou",
    parent_id: null,
    sort_order: 4,
  },
  {
    id: "cat-vasos",
    name: "Vasos",
    slug: "vasos",
    parent_id: null,
    sort_order: 5,
  },
  {
    id: "cat-bandoleras",
    name: "Bandoleras",
    slug: "bandoleras",
    parent_id: null,
    sort_order: 6,
  },
  {
    id: "cat-rebajas",
    name: "Rebajas",
    slug: "rebajas",
    parent_id: null,
    sort_order: 7,
  },
];

/** Sin productos de prueba: Magali los carga desde el admin */
export const SEED_PRODUCTS: Product[] = [];

export const SEED_COUPONS: Coupon[] = [
  {
    id: "cup-1",
    code: "TORTUGA15",
    percent_off: 15,
    amount_off: null,
    active: true,
    min_subtotal: 0,
  },
];
