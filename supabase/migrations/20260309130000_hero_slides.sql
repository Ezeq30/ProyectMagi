-- Slides del hero (carrusel de la home)
alter table public.site_settings
  add column if not exists hero_slides text[] not null default array[
    '/hero/oreiro-love.jpg',
    '/hero/chimola-mama.jpg',
    '/hero/tote-trendy.jpg'
  ]::text[];

update public.site_settings
set hero_slides = array[
  '/hero/oreiro-love.jpg',
  '/hero/chimola-mama.jpg',
  '/hero/tote-trendy.jpg'
]::text[]
where id = 1
  and (hero_slides is null or cardinality(hero_slides) = 0);

create or replace function public.admin_set_hero_slides(
  p_token text,
  p_slides text[] default '{}'::text[]
)
returns void
language plpgsql
security definer
set search_path to 'public', 'private'
as $$
declare
  v_slides text[];
begin
  perform private.assert_admin_token(p_token);

  select coalesce(
    array_agg(trim(s)),
    '{}'::text[]
  )
  into v_slides
  from unnest(coalesce(p_slides, '{}'::text[])) as s
  where trim(s) <> '';

  -- máximo 8
  if cardinality(v_slides) > 8 then
    v_slides := v_slides[1:8];
  end if;

  insert into public.site_settings (id, hero_slides, updated_at)
  values (1, coalesce(v_slides, '{}'::text[]), now())
  on conflict (id) do update set
    hero_slides = excluded.hero_slides,
    updated_at = now();
end;
$$;

grant execute on function public.admin_set_hero_slides(text, text[]) to anon, authenticated, service_role;
