-- Seed data for AccesoriosMagi (run after initial migration)
insert into public.site_settings default values
on conflict (id) do nothing;

insert into public.categories (id, name, slug, sort_order) values
  ('11111111-1111-1111-1111-111111111101', 'Bijou', 'bijou', 1),
  ('11111111-1111-1111-1111-111111111102', 'Carteras y marroquinería', 'carteras-marroquineria', 2),
  ('11111111-1111-1111-1111-111111111103', 'Accesorios de moda', 'accesorios-de-moda', 3),
  ('11111111-1111-1111-1111-111111111104', 'Combos', 'combos', 4),
  ('11111111-1111-1111-1111-111111111105', 'Rebajas', 'rebajas', 5)
on conflict (slug) do nothing;

insert into public.coupons (code, percent_off, amount_off, active, min_subtotal) values
  ('MAGI15', 15, null, true, 0)
on conflict (code) do nothing;

insert into public.products (
  id, name, slug, description, price, compare_at, stock, images, category_id, featured, bestseller, active
) values
(
  '22222222-2222-2222-2222-222222222201',
  'Collar Luna Dorada',
  'collar-luna-dorada',
  'Collar delicado con dije de luna en baño dorado.',
  18500, null, 12,
  array['https://placehold.co/800x1000/c4a574/f7f0e8/png?text=Collar+Luna'],
  '11111111-1111-1111-1111-111111111101', true, true, true
),
(
  '22222222-2222-2222-2222-222222222202',
  'Bandolera Magi Nude',
  'bandolera-magi-nude',
  'Bandolera de cuero sintético premium.',
  52000, null, 6,
  array['https://placehold.co/800x1000/b08968/f7f0e8/png?text=Bandolera'],
  '11111111-1111-1111-1111-111111111102', true, true, true
)
on conflict (slug) do nothing;
