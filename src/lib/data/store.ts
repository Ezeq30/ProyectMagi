import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_SETTINGS,
  SEED_CATEGORIES,
  SEED_COUPONS,
  SEED_PRODUCTS,
} from "./seed";
import { DEFAULT_THEME } from "../theme";
import type { Category, Coupon, Order, Product, SiteSettings } from "../types";

export type StoreData = {
  categories: Category[];
  products: Product[];
  settings: SiteSettings;
  coupons: Coupon[];
  orders: Order[];
};

const DATA_PATH = path.join(process.cwd(), "data", "store.json");

function defaultStore(): StoreData {
  return {
    categories: structuredClone(SEED_CATEGORIES),
    products: structuredClone(SEED_PRODUCTS),
    settings: structuredClone(DEFAULT_SETTINGS),
    coupons: structuredClone(SEED_COUPONS),
    orders: [],
  };
}

function normalizeSettings(settings: Partial<SiteSettings> | undefined): SiteSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    theme: {
      ...DEFAULT_THEME,
      ...(settings?.theme ?? {}),
      // siempre fijos
      primary: DEFAULT_THEME.primary,
      sage: DEFAULT_THEME.sage,
      gold: DEFAULT_THEME.gold,
      background: settings?.theme?.background ?? DEFAULT_THEME.background,
      card: settings?.theme?.card ?? DEFAULT_THEME.card,
    },
  };
}

export async function readStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoreData;
    return {
      ...parsed,
      settings: normalizeSettings(parsed.settings),
      categories: parsed.categories?.length ? parsed.categories : structuredClone(SEED_CATEGORIES),
      products: Array.isArray(parsed.products) ? parsed.products : structuredClone(SEED_PRODUCTS),
      coupons: parsed.coupons?.length ? parsed.coupons : structuredClone(SEED_COUPONS),
      orders: parsed.orders ?? [],
    };
  } catch {
    const store = defaultStore();
    await writeStore(store);
    return store;
  }
}

export async function writeStore(store: StoreData): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8");
}

export async function updateStore(
  updater: (store: StoreData) => StoreData | void,
): Promise<StoreData> {
  const store = await readStore();
  const next = updater(store) ?? store;
  next.settings = normalizeSettings(next.settings);
  await writeStore(next);
  return next;
}
