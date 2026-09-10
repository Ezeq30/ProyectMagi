-- CRUD cupones vía RPC (cuando no hay service_role)

create or replace function public.admin_list_coupons(p_token text)
returns setof public.coupons
language plpgsql
security definer
set search_path to 'public', 'private'
as $$
begin
  perform private.assert_admin_token(p_token);
  return query select * from public.coupons order by code;
end;
$$;

create or replace function public.admin_upsert_coupon(
  p_token text,
  p_id uuid default null,
  p_code text default null,
  p_percent_off numeric default null,
  p_amount_off numeric default null,
  p_active boolean default true,
  p_min_subtotal numeric default 0
)
returns public.coupons
language plpgsql
security definer
set search_path to 'public', 'private'
as $$
declare
  v_row public.coupons;
  v_code text;
  v_percent numeric;
  v_amount numeric;
begin
  perform private.assert_admin_token(p_token);

  v_code := upper(trim(coalesce(p_code, '')));
  if v_code = '' then
    raise exception 'Falta código';
  end if;

  v_percent := case when p_percent_off is not null and p_percent_off > 0 then p_percent_off else null end;
  v_amount := case
    when v_percent is null and p_amount_off is not null and p_amount_off > 0 then p_amount_off
    else null
  end;

  if v_percent is null and v_amount is null then
    raise exception 'Indicá %% o monto de descuento';
  end if;

  if p_id is not null then
    update public.coupons
    set code = v_code,
        percent_off = v_percent,
        amount_off = v_amount,
        active = coalesce(p_active, true),
        min_subtotal = greatest(coalesce(p_min_subtotal, 0), 0)
    where id = p_id
    returning * into v_row;
    if not found then
      raise exception 'Cupón no encontrado';
    end if;
    return v_row;
  end if;

  insert into public.coupons (code, percent_off, amount_off, active, min_subtotal)
  values (
    v_code,
    v_percent,
    v_amount,
    coalesce(p_active, true),
    greatest(coalesce(p_min_subtotal, 0), 0)
  )
  on conflict (code) do update
  set percent_off = excluded.percent_off,
      amount_off = excluded.amount_off,
      active = excluded.active,
      min_subtotal = excluded.min_subtotal
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.admin_delete_coupon(
  p_token text,
  p_id uuid
)
returns void
language plpgsql
security definer
set search_path to 'public', 'private'
as $$
begin
  perform private.assert_admin_token(p_token);
  delete from public.coupons where id = p_id;
end;
$$;

grant execute on function public.admin_list_coupons(text) to anon, authenticated;
grant execute on function public.admin_upsert_coupon(text, uuid, text, numeric, numeric, boolean, numeric) to anon, authenticated;
grant execute on function public.admin_delete_coupon(text, uuid) to anon, authenticated;
