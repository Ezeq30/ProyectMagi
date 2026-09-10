-- Foto opcional por color (el admin elige qué imagen va con cada color)

alter table public.product_variants
  add column if not exists image_url text;

create or replace function public.admin_set_product_colors(
  p_token text,
  p_product_id uuid,
  p_colors jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer
set search_path to 'public', 'private'
as $$
declare
  v_item jsonb;
  v_value text;
  v_stock int;
  v_image text;
  v_total int := 0;
begin
  perform private.assert_admin_token(p_token);

  if p_product_id is null then
    raise exception 'Producto requerido';
  end if;

  if not exists (select 1 from public.products where id = p_product_id) then
    raise exception 'No encontrado';
  end if;

  delete from public.product_variants
  where product_id = p_product_id
    and lower(name) = 'color';

  if p_colors is null or jsonb_typeof(p_colors) <> 'array' then
    update public.products
    set stock = 0, updated_at = now()
    where id = p_product_id;
    return;
  end if;

  for v_item in select * from jsonb_array_elements(p_colors)
  loop
    v_value := trim(coalesce(v_item->>'value', ''));
    v_stock := greatest(coalesce((v_item->>'stock')::int, 0), 0);
    v_image := nullif(trim(coalesce(v_item->>'image', v_item->>'image_url', '')), '');
    if v_value <> '' then
      insert into public.product_variants (product_id, name, value, stock, image_url)
      values (p_product_id, 'Color', v_value, v_stock, v_image);
      v_total := v_total + v_stock;
    end if;
  end loop;

  update public.products
  set stock = v_total,
      updated_at = now()
  where id = p_product_id;
end;
$$;
