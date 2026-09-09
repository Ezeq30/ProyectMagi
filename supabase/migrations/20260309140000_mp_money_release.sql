-- Fecha de liberación de fondos y detalle de estado MP
alter table public.orders
  add column if not exists mp_money_release_date timestamptz,
  add column if not exists mp_status_detail text;
