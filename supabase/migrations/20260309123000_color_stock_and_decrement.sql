-- Stock por color + descuento al marcar pedido pagado

alter table public.order_items
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null;

alter table public.orders
  add column if not exists stock_decremented boolean not null default false;

drop function if exists public.admin_set_product_colors(text, uuid, text[], integer);

-- Colores con stock individual: [{"value":"Rojo","stock":3}, ...]
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
    return;
  end if;

  for v_item in select * from jsonb_array_elements(p_colors)
  loop
    v_value := trim(coalesce(v_item->>'value', ''));
    v_stock := greatest(coalesce((v_item->>'stock')::int, 0), 0);
    if v_value <> '' then
      insert into public.product_variants (product_id, name, value, stock)
      values (p_product_id, 'Color', v_value, v_stock);
      v_total := v_total + v_stock;
    end if;
  end loop;

  -- El stock del producto refleja la suma de colores
  update public.products
  set stock = v_total,
      updated_at = now()
  where id = p_product_id;
end;
$$;

-- Compatibilidad: firma vieja text[] ya no se usa desde la app; se reemplaza abajo.

create or replace function public.apply_order_stock_decrement(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_order public.orders%rowtype;
  r record;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found then
    return false;
  end if;

  if v_order.status is distinct from 'paid'::public.order_status then
    return false;
  end if;

  if v_order.stock_decremented then
    return true;
  end if;

  for r in
    select product_id, variant_id, quantity
    from public.order_items
    where order_id = v_order.id
  loop
    if r.variant_id is not null then
      update public.product_variants
      set stock = greatest(0, stock - r.quantity)
      where id = r.variant_id;
    end if;

    if r.product_id is not null then
      update public.products
      set stock = greatest(0, stock - r.quantity),
          updated_at = now()
      where id = r.product_id;
    end if;
  end loop;

  update public.orders
  set stock_decremented = true,
      updated_at = now()
  where id = v_order.id;

  return true;
end;
$$;

create or replace function public.mp_mark_order_paid(
  p_order_id uuid,
  p_payment_id text default null
)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  update public.orders
  set status = 'paid'::public.order_status,
      mp_payment_id = coalesce(nullif(trim(p_payment_id), ''), mp_payment_id),
      updated_at = now()
  where id = p_order_id;

  if not found then
    return false;
  end if;

  perform public.apply_order_stock_decrement(p_order_id);
  return true;
end;
$$;

create or replace function public.admin_update_order_status(
  p_token text,
  p_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path to 'public', 'private'
as $$
begin
  perform private.assert_admin_token(p_token);
  if p_status not in ('pending', 'paid', 'shipped', 'cancelled', 'refunded') then
    raise exception 'Estado inválido';
  end if;
  update public.orders
  set status = p_status::public.order_status,
      updated_at = now()
  where id = p_id;
  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  if p_status = 'paid' then
    perform public.apply_order_stock_decrement(p_id);
  end if;
end;
$$;

grant execute on function public.admin_set_product_colors(text, uuid, jsonb) to anon, authenticated, service_role;
grant execute on function public.apply_order_stock_decrement(uuid) to anon, authenticated, service_role;
grant execute on function public.mp_mark_order_paid(uuid, text) to anon, authenticated, service_role;
grant execute on function public.admin_update_order_status(text, uuid, text) to anon, authenticated, service_role;
