import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_SETTINGS,
  SEED_CATEGORIES,
  SEED_COUPONS,
  SEED_PRODUCTS,
} from "./seed";
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
    settings: { ...DEFAULT_SETTINGS },
    coupons: structuredClone(SEED_COUPONS),
    orders: [],
  };
}

export async function readStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(raw) as StoreData;
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
  await writeStore(next);
  return next;
}
