import { DEFAULT_SETTINGS } from "./data/seed";
import { DEFAULT_THEME } from "./theme";
import {
  canUseAdminRpc,
  canUseLocalStore,
  createServerDataClient,
  createServiceClient,
  getAdminWriteToken,
  hasServiceRole,
  requireSupabaseWrites,
  useSupabaseData,
} from "./supabase/admin";
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

/** Escrituras locales solo fuera de Vercel. */
function useLocalWrites(): boolean {
  if (useSupabaseData() && (hasServiceRole() || canUseAdminRpc())) return false;
  if (!canUseLocalStore()) requireSupabaseWrites();
  return true;
}

function useRpcWrites(): boolean {
  return useSupabaseData() && !hasServiceRole() && canUseAdminRpc();
}

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
    payment_alias: String(row?.payment_alias ?? DEFAULT_SETTINGS.payment_alias),
    payment_cbu: String(row?.payment_cbu ?? DEFAULT_SETTINGS.payment_cbu),
    payment_holder: String(row?.payment_holder ?? DEFAULT_SETTINGS.payment_holder),
    hero_slides: Array.isArray(row?.hero_slides)
      ? row.hero_slides.map(String).filter(Boolean).slice(0, 8)
      : [...DEFAULT_SETTINGS.hero_slides],
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
  if (useLocalWrites()) {
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

  if (useRpcWrites()) {
    const { data, error } = await sb.rpc("admin_upsert_product", {
      p_token: getAdminWriteToken(),
      p_name: product.name,
      p_slug: product.slug,
      p_description: product.description,
      p_price: product.price,
      p_compare_at: product.compare_at,
      p_stock: product.stock,
      p_images: product.images,
      p_category_id: product.category_id,
      p_featured: product.featured,
      p_bestseller: product.bestseller,
      p_active: product.active,
      p_id: product.id ?? null,
    });
    if (error) throw error;
    return String(data);
  }

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

/** Reemplaza los colores (variantes name=Color) de un producto. */
export async function dbSetProductColors(
  productId: string,
  colors: { value: string; stock: number }[],
): Promise<void> {
  const cleaned = colors
    .map((c) => ({
      value: String(c.value ?? "").trim(),
      stock: Math.max(0, Number(c.stock) || 0),
    }))
    .filter((c) => c.value);

  const totalStock = cleaned.reduce((s, c) => s + c.stock, 0);

  if (useLocalWrites()) {
    await updateStore((store) => {
      const idx = store.products.findIndex((p) => p.id === productId);
      if (idx < 0) throw new Error("No encontrado");
      const prev = store.products[idx];
      const other = (prev.variants ?? []).filter(
        (v) => v.name.toLowerCase() !== "color",
      );
      const colorVariants: ProductVariant[] = cleaned.map((c) => ({
        id: crypto.randomUUID(),
        product_id: productId,
        name: "Color",
        value: c.value,
        stock: c.stock,
      }));
      store.products[idx] = {
        ...prev,
        stock: cleaned.length ? totalStock : prev.stock,
        variants: [...other, ...colorVariants],
      };
    });
    return;
  }

  const sb = createServerDataClient();

  if (useRpcWrites()) {
    const { error } = await sb.rpc("admin_set_product_colors", {
      p_token: getAdminWriteToken(),
      p_product_id: productId,
      p_colors: cleaned,
    });
    if (error) throw error;
    return;
  }

  await sb
    .from("product_variants")
    .delete()
    .eq("product_id", productId)
    .ilike("name", "color");

  if (cleaned.length === 0) return;

  const { error } = await sb.from("product_variants").insert(
    cleaned.map((c) => ({
      product_id: productId,
      name: "Color",
      value: c.value,
      stock: c.stock,
    })),
  );
  if (error) throw error;

  await sb
    .from("products")
    .update({ stock: totalStock, updated_at: new Date().toISOString() })
    .eq("id", productId);
}

export async function dbApplyOrderStockDecrement(orderId: string): Promise<void> {
  if (useLocalWrites()) {
    await updateStore((store) => {
      const order = store.orders.find(
        (o) => o.id === orderId || o.order_number === orderId,
      );
      if (!order || order.status !== "paid") return;
      if ((order as Order & { stock_decremented?: boolean }).stock_decremented) return;

      for (const item of order.items) {
        const product = store.products.find((p) => p.id === item.product_id);
        if (!product) continue;
        product.stock = Math.max(0, product.stock - item.quantity);
        if (item.variant_id && product.variants) {
          const variant = product.variants.find((v) => v.id === item.variant_id);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
          }
        }
      }
      (order as Order & { stock_decremented?: boolean }).stock_decremented = true;
    });
    return;
  }

  const sb = createServerDataClient();
  const { error } = await sb.rpc("apply_order_stock_decrement", {
    p_order_id: orderId,
  });
  if (error) throw error;
}

export async function dbDeleteProduct(id: string): Promise<void> {
  if (useLocalWrites()) {
    await updateStore((store) => {
      store.products = store.products.filter((p) => p.id !== id);
    });
    return;
  }
  const sb = createServerDataClient();
  if (useRpcWrites()) {
    const { error } = await sb.rpc("admin_delete_product", {
      p_token: getAdminWriteToken(),
      p_id: id,
    });
    if (error) throw error;
    return;
  }
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function dbAddCategory(name: string, slug: string): Promise<Category> {
  if (useLocalWrites()) {
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
  if (useRpcWrites()) {
    const { data, error } = await sb.rpc("admin_add_category", {
      p_token: getAdminWriteToken(),
      p_name: name,
      p_slug: slug,
    });
    if (error) throw error;
    const row = data as Record<string, unknown>;
    return {
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      parent_id: null,
      sort_order: Number(row.sort_order ?? 0),
    };
  }
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
  if (useLocalWrites()) {
    await updateStore((store) => {
      store.categories = store.categories.filter((c) => c.id !== id);
      store.products = store.products.map((p) =>
        p.category_id === id ? { ...p, category_id: null } : p,
      );
    });
    return;
  }
  const sb = createServerDataClient();
  if (useRpcWrites()) {
    const { error } = await sb.rpc("admin_delete_category", {
      p_token: getAdminWriteToken(),
      p_id: id,
    });
    if (error) throw error;
    return;
  }
  await sb.from("products").update({ category_id: null }).eq("category_id", id);
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function dbUpdateSettings(settings: SiteSettings): Promise<void> {
  if (useLocalWrites()) {
    await updateStore((store) => {
      store.settings = settings;
    });
    return;
  }
  const sb = createServerDataClient();
  if (useRpcWrites()) {
    const { error } = await sb.rpc("admin_update_settings", {
      p_token: getAdminWriteToken(),
      p_free_shipping_from: settings.free_shipping_from,
      p_flat_shipping_cost: settings.flat_shipping_cost,
      p_whatsapp: settings.whatsapp,
      p_promo_banner: settings.promo_banner,
      p_about_title: settings.about_title,
      p_about_text: settings.about_text,
      p_hero_headline: settings.hero_headline,
      p_hero_sub: settings.hero_sub,
      p_theme: settings.theme,
      p_payment_alias: settings.payment_alias,
      p_payment_cbu: settings.payment_cbu,
      p_payment_holder: settings.payment_holder,
    });
    if (error) throw error;
    return;
  }
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
    payment_alias: settings.payment_alias,
    payment_cbu: settings.payment_cbu,
    payment_holder: settings.payment_holder,
    hero_slides: settings.hero_slides.slice(0, 8),
    theme: settings.theme,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function dbSetHeroSlides(slides: string[]): Promise<void> {
  const cleaned = slides.map((s) => s.trim()).filter(Boolean).slice(0, 8);

  if (useLocalWrites()) {
    await updateStore((store) => {
      store.settings = { ...store.settings, hero_slides: cleaned };
    });
    return;
  }

  const sb = createServerDataClient();
  if (useRpcWrites()) {
    const { error } = await sb.rpc("admin_set_hero_slides", {
      p_token: getAdminWriteToken(),
      p_slides: cleaned,
    });
    if (error) throw error;
    return;
  }

  const { error } = await sb
    .from("site_settings")
    .upsert({
      id: 1,
      hero_slides: cleaned,
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
    mp_money_release_date: o.mp_money_release_date
      ? String(o.mp_money_release_date)
      : null,
    mp_status_detail: o.mp_status_detail ? String(o.mp_status_detail) : null,
    notes: String(o.notes ?? ""),
    created_at: String(o.created_at),
    items: (o.order_items ?? []).map((item: Record<string, unknown>) => ({
      id: String(item.id),
      product_id: item.product_id ? String(item.product_id) : null,
      product_name: String(item.product_name),
      variant_id: item.variant_id ? String(item.variant_id) : null,
      variant_label: item.variant_label ? String(item.variant_label) : null,
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      image: item.image ? String(item.image) : null,
    })),
  }));
}

export async function dbGetOrderByNumber(orderNumber: string): Promise<Order | null> {
  if (!orderNumber) return null;
  if (!useSupabaseData()) {
    const store = await readStore();
    return store.orders.find((o) => o.order_number === orderNumber) ?? null;
  }
  const sb = createServerDataClient();
  const { data, error } = await sb
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: String(data.id),
    order_number: String(data.order_number),
    status: data.status,
    customer_name: String(data.customer_name),
    customer_email: String(data.customer_email),
    customer_phone: String(data.customer_phone ?? ""),
    shipping_address: String(data.shipping_address ?? ""),
    shipping_city: String(data.shipping_city ?? ""),
    shipping_postal: String(data.shipping_postal ?? ""),
    shipping_cost: Number(data.shipping_cost ?? 0),
    subtotal: Number(data.subtotal ?? 0),
    discount: Number(data.discount ?? 0),
    total: Number(data.total ?? 0),
    coupon_code: data.coupon_code ? String(data.coupon_code) : null,
    mp_preference_id: data.mp_preference_id ? String(data.mp_preference_id) : null,
    mp_payment_id: data.mp_payment_id ? String(data.mp_payment_id) : null,
    mp_money_release_date: data.mp_money_release_date
      ? String(data.mp_money_release_date)
      : null,
    mp_status_detail: data.mp_status_detail ? String(data.mp_status_detail) : null,
    notes: String(data.notes ?? ""),
    created_at: String(data.created_at),
    items: (data.order_items ?? []).map((item: Record<string, unknown>) => ({
      id: String(item.id),
      product_id: item.product_id ? String(item.product_id) : null,
      product_name: String(item.product_name),
      variant_id: item.variant_id ? String(item.variant_id) : null,
      variant_label: item.variant_label ? String(item.variant_label) : null,
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity),
      image: item.image ? String(item.image) : null,
    })),
  };
}

export async function dbCreateOrder(order: Order): Promise<void> {
  if (useLocalWrites()) {
    await updateStore((store) => {
      // El stock se descuenta solo cuando el pago queda OK (paid)
      store.orders.unshift(order);
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
    mp_money_release_date: order.mp_money_release_date,
    mp_status_detail: order.mp_status_detail,
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
        variant_id: item.variant_id ?? null,
        variant_label: item.variant_label,
        unit_price: item.unit_price,
        quantity: item.quantity,
        image: item.image,
      })),
    );
    if (itemsError) throw itemsError;
  }
}

export async function dbUpdateOrderStatus(
  id: string,
  status: Order["status"],
): Promise<void> {
  if (useLocalWrites()) {
    await updateStore((store) => {
      const order = store.orders.find((o) => o.id === id);
      if (order) order.status = status;
    });
    return;
  }
  const sb = createServerDataClient();
  if (useRpcWrites()) {
    const { error } = await sb.rpc("admin_update_order_status", {
      p_token: getAdminWriteToken(),
      p_id: id,
      p_status: status,
    });
    if (error) throw error;
    return;
  }
  const { error } = await sb
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function dbDeleteOrder(id: string): Promise<void> {
  if (useLocalWrites()) {
    await updateStore((store) => {
      store.orders = store.orders.filter((o) => o.id !== id);
    });
    return;
  }
  const sb = createServerDataClient();
  if (useRpcWrites()) {
    const { error } = await sb.rpc("admin_delete_order", {
      p_token: getAdminWriteToken(),
      p_id: id,
    });
    if (error) throw error;
    return;
  }
  await sb.from("order_items").delete().eq("order_id", id);
  const { error } = await sb.from("orders").delete().eq("id", id);
  if (error) throw error;
}

export async function dbUpdateOrderPayment(
  orderId: string,
  paymentId: string,
  status: Order["status"],
  meta?: {
    moneyReleaseDate?: string | null;
    statusDetail?: string | null;
  },
): Promise<void> {
  if (useLocalWrites()) {
    await updateStore((store) => {
      const order = store.orders.find(
        (o) => o.id === orderId || o.order_number === orderId,
      );
      if (!order) return;
      order.mp_payment_id = paymentId;
      order.status = status;
      if (meta?.moneyReleaseDate !== undefined) {
        order.mp_money_release_date = meta.moneyReleaseDate;
      }
      if (meta?.statusDetail !== undefined) {
        order.mp_status_detail = meta.statusDetail;
      }
    });
    if (status === "paid") {
      await dbApplyOrderStockDecrement(orderId);
    }
    return;
  }

  const sb = createServerDataClient();
  const releasePatch: Record<string, unknown> = {};
  if (meta?.moneyReleaseDate) {
    releasePatch.mp_money_release_date = meta.moneyReleaseDate;
  }
  if (meta?.statusDetail != null) {
    releasePatch.mp_status_detail = meta.statusDetail;
  }

  if (status === "paid") {
    // Preferir UUID del pedido (external_reference de MP)
    const { data: byId } = await sb
      .from("orders")
      .select("id")
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)
      .maybeSingle();

    if (byId?.id) {
      const { error } = await sb.rpc("mp_mark_order_paid", {
        p_order_id: byId.id,
        p_payment_id: paymentId,
      });
      if (error) throw error;
      if (Object.keys(releasePatch).length) {
        await sb.from("orders").update(releasePatch).eq("id", byId.id);
      }
      return;
    }
  }

  await sb
    .from("orders")
    .update({
      mp_payment_id: paymentId,
      status,
      updated_at: new Date().toISOString(),
      ...releasePatch,
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
  if (!useSupabaseData()) {
    throw new Error("UPLOAD_LOCAL");
  }
  const sb = hasServiceRole() ? createServiceClient() : createServerDataClient();
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
