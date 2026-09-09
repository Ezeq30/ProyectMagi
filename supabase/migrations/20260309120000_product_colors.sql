-- Colores disponibles por producto (variantes name = 'Color')
create or replace function public.admin_set_product_colors(
  p_token text,
  p_product_id uuid,
  p_colors text[] default '{}'::text[],
  p_stock integer default 0
)
returns void
language plpgsql
security definer
set search_path to 'public', 'private'
as $$
declare
  v_color text;
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

  if p_colors is null then
    return;
  end if;

  foreach v_color in array p_colors loop
    v_color := trim(v_color);
    if v_color <> '' then
      insert into public.product_variants (product_id, name, value, stock)
      values (p_product_id, 'Color', v_color, greatest(coalesce(p_stock, 0), 0));
    end if;
  end loop;
end;
$$;

grant execute on function public.admin_set_product_colors(text, uuid, text[], integer) to anon, authenticated, service_role;
