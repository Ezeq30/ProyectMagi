import { DEFAULT_SETTINGS } from "./data/seed";
import { DEFAULT_THEME } from "./theme";
import { createServerDataClient, createServiceClient, hasServiceRole, useSupabaseData } from "./supabase/admin";
import {
  readStore,
  updateStore,
  type StoreData,
} from "./data/store";
import type {
  Category,
  Coupon,
  Order,
  OrderItem,
  Product,
  ProductVariant,
  SiteSettings,
  ThemeColors,
} from "./types";

function mapProduct(row: Record<string, unknown>, variants?: ProductVariant[]): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    price: Number(row.price),
    compare_at: row.compare_at != null ? Number(row.compare_at) : null,
    stock: Number(row.stock ?? 0),
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    category_id: row.category_id ? String(row.category_id) : null,
    featured: Boolean(row.featured),
    bestseller: Boolean(row.bestseller),
    active: Boolean(row.active),
    variants,
  };
}

function normalizeSettings(row?: Record<string, unknown> | null): SiteSettings {
  const theme = (row?.theme as ThemeColors | undefined) ?? {};
  return {
    ...DEFAULT_SETTINGS,
    free_shipping_from: Number(row?.free_shipping_from ?? DEFAULT_SETTINGS.free_shipping_from),
    flat_shipping_cost: Number(row?.flat_shipping_cost ?? DEFAULT_SETTINGS.flat_shipping_cost),
    whatsapp: String(row?.whatsapp ?? DEFAULT_SETTINGS.whatsapp),
    promo_banner: String(row?.promo_banner ?? DEFAULT_SETTINGS.promo_banner),
    about_title: String(row?.about_title ?? DEFAULT_SETTINGS.about_title),
    about_text: String(row?.about_text ?? DEFAULT_SETTINGS.about_text),
    hero_headline: String(row?.hero_headline ?? DEFAULT_SETTINGS.hero_headline),
    hero_sub: String(row?.hero_sub ?? DEFAULT_SETTINGS.hero_sub),
    theme: {
      ...DEFAULT_THEME,
      ...theme,
      primary: DEFAULT_THEME.primary,
      sage: DEFAULT_THEME.sage,
      gold: DEFAULT_THEME.gold,
    },
  };
}

export async function dbGetSettings(): Promise<SiteSettings> {
  if (!useSupabaseData()) {
    const store = await readStore();
    return store.settings;
  }
  const sb = createServerDataClient();
  const { data, error } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return normalizeSettings(data);
}

export async function dbGetCategories(): Promise<Category[]> {
  if (!useSupabaseData()) {
    const store = await readStore();
    return [...store.categories].sort((a, b) => a.sort_order - b.sort_order);
  }
  const sb = createServerDataClient();
  const { data, error } = await sb
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: String(c.id),
    name: String(c.name),
    slug: String(c.slug),
    parent_id: c.parent_id ? String(c.parent_id) : null,
    sort_order: Number(c.sort_order ?? 0),
  }));
}

export async function dbGetProducts(options?: {
  categoryId?: string;
  featured?: boolean;
  bestseller?: boolean;
  activeOnly?: boolean;
  includeInactive?: boolean;
}): Promise<Product[]> {
  if (!useSupabaseData()) {
    const store = await readStore();
    let products = store.products;
    const activeOnly = options?.activeOnly ?? !options?.includeInactive;
    if (activeOnly) products = products.filter((p) => p.active);
    if (options?.categoryId) {
      products = products.filter((p) => p.category_id === options.categoryId);
    }
    if (options?.featured) products = products.filter((p) => p.featured);
    if (options?.bestseller) products = products.filter((p) => p.bestseller);
    return products;
  }

  const sb = createServerDataClient();
  let query = sb.from("products").select("*, product_variants(*)").order("created_at", {
    ascending: false,
  });

  if (!options?.includeInactive && (options?.activeOnly ?? true)) {
    query = query.eq("active", true);
  }
  if (options?.categoryId) query = query.eq("category_id", options.categoryId);
  if (options?.featured) query = query.eq("featured", true);
  if (options?.bestseller) query = query.eq("bestseller", true);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const variants = Array.isArray(row.product_variants)
      ? row.product_variants.map((v: Record<string, unknown>) => ({
          id: String(v.id),
          product_id: String(v.product_id),
          name: String(v.name),
          value: String(v.value),
          stock: Number(v.stock ?? 0),
        }))
      : [];
    return mapProduct(row, variants);
  });
}

export async function dbGetProductBySlug(slug: string): Promise<Product | null> {
  const products = await dbGetProducts({ activeOnly: true });
  return products.find((p) => p.slug === slug) ?? null;
}

export async function dbGetProductById(id: string): Promise<Product | null> {
  if (!useSupabaseData()) {
    const store = await readStore();
    return store.products.find((p) => p.id === id) ?? null;
  }
  const sb = createServerDataClient();
  const { data, error } = await sb
    .from("products")
    .select("*, product_variants(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const variants = Array.isArray(data.product_variants)
    ? data.product_variants.map((v: Record<string, unknown>) => ({
        id: String(v.id),
        product_id: String(v.product_id),
        name: String(v.name),
        value: String(v.value),
        stock: Number(v.stock ?? 0),
      }))
    : [];
  return mapProduct(data, variants);
}

export async function dbGetCoupon(code: string): Promise<Coupon | null> {
  if (!useSupabaseData()) {
    const store = await readStore();
    return (
      store.coupons.find(
        (c) => c.code.toLowerCase() === code.toLowerCase() && c.active,
      ) ?? null
    );
  }
  const sb = createServerDataClient();
  const { data, error } = await sb
    .from("coupons")
    .select("*")
    .ilike("code", code)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: String(data.id),
    code: String(data.code),
    percent_off: data.percent_off != null ? Number(data.percent_off) : null,
    amount_off: data.amount_off != null ? Number(data.amount_off) : null,
    active: Boolean(data.active),
    min_subtotal: Number(data.min_subtotal ?? 0),
  };
}

export async function dbUpsertProduct(
  product: Omit<Product, "id" | "variants"> & { id?: string },
): Promise<string> {
  if (!useSupabaseData() || !hasServiceRole()) {
    let id = product.id;
    await updateStore((store) => {
      if (id) {
        const idx = store.products.findIndex((p) => p.id === id);
        if (idx < 0) throw new Error("No encontrado");
        store.products[idx] = { ...store.products[idx], ...product, id };
      } else {
        id = crypto.randomUUID();
        store.products.unshift({ ...product, id });
      }
    });
    return id!;
  }

  const sb = createServerDataClient();
  const payload = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compare_at: product.compare_at,
    stock: product.stock,
    images: product.images,
    category_id: product.category_id,
    featured: product.featured,
    bestseller: product.bestseller,
    active: product.active,
    updated_at: new Date().toISOString(),
  };

  if (product.id) {
    const { error } = await sb.from("products").update(payload).eq("id", product.id);
    if (error) throw error;
    return product.id;
  }

  const { data, error } = await sb.from("products").insert(payload).select("id").single();
  if (error) throw error;
  return String(data.id);
}

export async function dbDeleteProduct(id: string): Promise<void> {
  if (!useSupabaseData() || !hasServiceRole()) {
    await updateStore((store) => {
      store.products = store.products.filter((p) => p.id !== id);
    });
    return;
  }
  const sb = createServerDataClient();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function dbAddCategory(name: string, slug: string): Promise<Category> {
  if (!useSupabaseData() || !hasServiceRole()) {
    const category: Category = {
      id: crypto.randomUUID(),
      name,
      slug,
      parent_id: null,
      sort_order: Date.now(),
    };
    await updateStore((store) => {
      store.categories.push(category);
    });
    return category;
  }
  const sb = createServerDataClient();
  const { data, error } = await sb
    .from("categories")
    .insert({ name, slug, sort_order: Date.now() })
    .select("*")
    .single();
  if (error) throw error;
  return {
    id: String(data.id),
    name: String(data.name),
    slug: String(data.slug),
    parent_id: null,
    sort_order: Number(data.sort_order ?? 0),
  };
}

export async function dbDeleteCategory(id: string): Promise<void> {
  if (!useSupabaseData() || !hasServiceRole()) {
    await updateStore((store) => {
      store.categories = store.categories.filter((c) => c.id !== id);
      store.products = store.products.map((p) =>
        p.category_id === id ? { ...p, category_id: null } : p,
      );
    });
    return;
  }
  const sb = createServerDataClient();
  await sb.from("products").update({ category_id: null }).eq("category_id", id);
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function dbUpdateSettings(settings: SiteSettings): Promise<void> {
  if (!useSupabaseData() || !hasServiceRole()) {
    await updateStore((store) => {
      store.settings = settings;
    });
    return;
  }
  const sb = createServerDataClient();
  const { error } = await sb.from("site_settings").upsert({
    id: 1,
    free_shipping_from: settings.free_shipping_from,
    flat_shipping_cost: settings.flat_shipping_cost,
    whatsapp: settings.whatsapp,
    promo_banner: settings.promo_banner,
    about_title: settings.about_title,
    about_text: settings.about_text,
    hero_headline: settings.hero_headline,
    hero_sub: settings.hero_sub,
    theme: settings.theme,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function dbGetOrders(): Promise<Order[]> {
  if (!useSupabaseData()) {
    const store = await readStore();
    return store.orders;
  }
  const sb = createServerDataClient();
  const { data, error } = await sb
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((o) => ({
    id: String(o.id),
    order_number: String(o.order_number),
    status: o.status,
    customer_name: String(o.customer_name),
    customer_email: String(o.customer_email),
    customer_phone: String(o.customer_phone ?? ""),
    shipping_address: String(o.shipping_address ?? ""),
    shipping_city: String(o.shipping_city ?? ""),
    shipping_postal: String(o.shipping_postal ?? ""),
    shipping_cost: Number(o.shipping_cost ?? 0),
    subtotal: Number(o.subtotal ?? 0),
    discount: Number(o.discount ?? 0),
    total: Number(o.total ?? 0),
    coupon_code: o.coupon_code ? String(o.coupon_code) : null,
    mp_preference_id: o.mp_preference_id ? String(o.mp_preference_id) : null,
    mp_payment_id: o.mp_payment_id ? String(o.mp_payment_id) : null,
    notes: String(o.notes ?? ""),
    created_at: String(o.created_at),
    items: (o.order_items ?? []).map((item: Record<string, unknown>) => ({
      id: String(item.id),
      product_id: item.product_id ? String(item.product_id) : null,
      product_name: String(item.product_name),
      variant_label: item.variant_label ? String(item.variant_label) : null,
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      image: item.image ? String(item.image) : null,
    })),
  }));
}

export async function dbCreateOrder(order: Order): Promise<void> {
  if (!useSupabaseData() || !hasServiceRole()) {
    await updateStore((store) => {
      store.orders.unshift(order);
      for (const item of order.items) {
        const product = store.products.find((p) => p.id === item.product_id);
        if (!product) continue;
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    });
    return;
  }

  const sb = createServerDataClient();
  const { error } = await sb.from("orders").insert({
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    shipping_address: order.shipping_address,
    shipping_city: order.shipping_city,
    shipping_postal: order.shipping_postal,
    shipping_cost: order.shipping_cost,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    coupon_code: order.coupon_code,
    mp_preference_id: order.mp_preference_id,
    mp_payment_id: order.mp_payment_id,
    notes: order.notes,
  });
  if (error) throw error;

  if (order.items.length) {
    const { error: itemsError } = await sb.from("order_items").insert(
      order.items.map((item) => ({
        id: item.id,
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        variant_label: item.variant_label,
        unit_price: item.unit_price,
        quantity: item.quantity,
        image: item.image,
      })),
    );
    if (itemsError) throw itemsError;
  }

  for (const item of order.items) {
    if (!item.product_id) continue;
    const { data: product } = await sb
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .maybeSingle();
    if (!product) continue;
    await sb
      .from("products")
      .update({ stock: Math.max(0, Number(product.stock) - item.quantity) })
      .eq("id", item.product_id);
  }
}

export async function dbUpdateOrderStatus(
  id: string,
  status: Order["status"],
): Promise<void> {
  if (!useSupabaseData() || !hasServiceRole()) {
    await updateStore((store) => {
      const order = store.orders.find((o) => o.id === id);
      if (order) order.status = status;
    });
    return;
  }
  const sb = createServerDataClient();
  const { error } = await sb
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function dbUpdateOrderPayment(
  orderId: string,
  paymentId: string,
  status: Order["status"],
): Promise<void> {
  if (!useSupabaseData() || !hasServiceRole()) {
    await updateStore((store) => {
      const order = store.orders.find(
        (o) => o.id === orderId || o.order_number === orderId,
      );
      if (!order) return;
      order.mp_payment_id = paymentId;
      order.status = status;
    });
    return;
  }
  const sb = createServerDataClient();
  await sb
    .from("orders")
    .update({
      mp_payment_id: paymentId,
      status,
      updated_at: new Date().toISOString(),
    })
    .or(`id.eq.${orderId},order_number.eq.${orderId}`);
}

export async function dbAddNewsletter(email: string): Promise<void> {
  if (!useSupabaseData()) {
    // local fallback handled in route historically; keep noop for store
    return;
  }
  const sb = createServerDataClient();
  await sb.from("newsletter_subscribers").upsert({ email }, { onConflict: "email" });
}

export async function dbUploadProductImage(
  file: File,
): Promise<string> {
  if (!useSupabaseData() || !hasServiceRole()) {
    throw new Error("UPLOAD_LOCAL");
  }
  const sb = createServiceClient();
  const ext = file.type.split("/")[1] || "jpg";
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await sb.storage.from("product-images").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = sb.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export type { StoreData, OrderItem };
