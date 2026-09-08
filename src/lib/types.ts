export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  value: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at: number | null;
  stock: number;
  images: string[];
  category_id: string | null;
  featured: boolean;
  bestseller: boolean;
  active: boolean;
  variants?: ProductVariant[];
};

export type SiteSettings = {
  free_shipping_from: number;
  flat_shipping_cost: number;
  whatsapp: string;
  promo_banner: string;
  about_title: string;
  about_text: string;
  hero_headline: string;
  hero_sub: string;
};

export type Coupon = {
  id: string;
  code: string;
  percent_off: number | null;
  amount_off: number | null;
  active: boolean;
  min_subtotal: number;
};

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled" | "refunded";

export type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  image: string | null;
};

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal: string;
  shipping_cost: number;
  subtotal: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  notes: string;
  created_at: string;
  items: OrderItem[];
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  maxStock: number;
};
