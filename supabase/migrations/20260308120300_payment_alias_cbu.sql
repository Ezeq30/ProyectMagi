-- payment fields (alias / cbu / titular) for Mercado Pago transfer checkout
alter table public.site_settings
  add column if not exists payment_alias text not null default '',
  add column if not exists payment_cbu text not null default '',
  add column if not exists payment_holder text not null default '';
