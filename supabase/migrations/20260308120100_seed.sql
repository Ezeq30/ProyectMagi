-- Seed data for Accesorios Tortugas Online (sin productos de prueba)
insert into public.site_settings default values
on conflict (id) do nothing;

insert into public.categories (id, name, slug, sort_order) values
  ('11111111-1111-1111-1111-111111111101', 'Carteras', 'carteras', 1),
  ('11111111-1111-1111-1111-111111111102', 'Bolsos', 'bolsos', 2),
  ('11111111-1111-1111-1111-111111111103', 'Mochilas', 'mochilas', 3),
  ('11111111-1111-1111-1111-111111111104', 'Bijou', 'bijou', 4),
  ('11111111-1111-1111-1111-111111111105', 'Vasos', 'vasos', 5),
  ('11111111-1111-1111-1111-111111111106', 'Bandoleras', 'bandoleras', 6),
  ('11111111-1111-1111-1111-111111111107', 'Rebajas', 'rebajas', 7)
on conflict (slug) do nothing;

insert into public.coupons (code, percent_off, amount_off, active, min_subtotal) values
  ('TORTUGA15', 15, null, true, 0)
on conflict (code) do nothing;
