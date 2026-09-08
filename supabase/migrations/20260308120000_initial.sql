-- AccesoriosMagi initial schema
create extension if not exists "pgcrypto";

-- Admin check via app_metadata.role = 'admin'
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  compare_at numeric(12,2),
  stock int not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  category_id uuid references public.categories(id) on delete set null,
  featured boolean not null default false,
  bestseller boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  value text not null,
  stock int not null default 0 check (stock >= 0),
  created_at timestamptz not null default now()
);

create type public.order_status as enum (
  'pending',
  'paid',
  'shipped',
  'cancelled',
  'refunded'
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status public.order_status not null default 'pending',
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null default '',
  shipping_address text not null default '',
  shipping_city text not null default '',
  shipping_postal text not null default '',
  shipping_cost numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  coupon_code text,
  mp_preference_id text,
  mp_payment_id text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  variant_label text,
  unit_price numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  image text
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent_off numeric(5,2),
  amount_off numeric(12,2),
  active boolean not null default true,
  min_subtotal numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  check (
    (percent_off is not null and amount_off is null)
    or (percent_off is null and amount_off is not null)
  )
);

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  free_shipping_from numeric(12,2) not null default 40000,
  flat_shipping_cost numeric(12,2) not null default 4500,
  whatsapp text not null default '5491135787669',
  promo_banner text not null default 'ENVÍO GRATIS superando $40.000 | Consultanos por WhatsApp',
  about_title text not null default 'Accesorios con estilo',
  about_text text not null default 'Somos AccesoriosMagi: accesorios, bijou y regalos pensados para acompañarte todos los días.',
  hero_headline text not null default 'Tu estilo, en cada detalle',
  hero_sub text not null default 'Bijou, carteras y accesorios seleccionados para vos.',
  updated_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.site_settings enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Public read
create policy "categories_public_read" on public.categories for select using (true);
create policy "products_public_read" on public.products for select using (active = true or public.is_admin());
create policy "variants_public_read" on public.product_variants for select using (true);
create policy "settings_public_read" on public.site_settings for select using (true);
create policy "coupons_public_read" on public.coupons for select using (active = true or public.is_admin());

-- Admin write
create policy "categories_admin_all" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_all" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "variants_admin_all" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy "orders_admin_all" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "order_items_admin_all" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "coupons_admin_all" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
create policy "settings_admin_all" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "newsletter_admin_read" on public.newsletter_subscribers for select using (public.is_admin());

-- Newsletter insert for anyone
create policy "newsletter_public_insert" on public.newsletter_subscribers for insert with check (true);

-- Storage bucket for product images (run in dashboard or via storage API)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "product_images_admin_insert"
on storage.objects for insert
with check (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_update"
on storage.objects for update
using (bucket_id = 'product-images' and public.is_admin());

create policy "product_images_admin_delete"
on storage.objects for delete
using (bucket_id = 'product-images' and public.is_admin());
