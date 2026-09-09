-- Escrituras de admin sin service_role: RPC security definer + token
-- (aplicada en remoto; archivo local para el repo)

create schema if not exists private;

create table if not exists private.admin_write_secret (
  id int primary key default 1 check (id = 1),
  token text not null
);

revoke all on schema private from public;
revoke all on private.admin_write_secret from public, anon, authenticated;

insert into private.admin_write_secret (id, token)
values (1, 'Maitena1')
on conflict (id) do update set token = excluded.token;
