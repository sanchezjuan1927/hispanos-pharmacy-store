-- Orders now arrive only through the store (WhatsApp removed), and the pharmacy
-- reads them in /admin. This migration:
--   1. adds the fields the owner needs to fulfil a delivery
--   2. routes store inserts through a validated function instead of a raw insert
--   3. restricts reading/updating orders to named staff, not any signed-in user

-- 1. New order fields ---------------------------------------------------------
alter table "Hisp Pharmacy Order taker"
  add column if not exists notes          text        not null default '',
  add column if not exists payment_method text        not null default 'cash',
  add column if not exists lang           text        not null default 'es',
  add column if not exists updated_at     timestamptz not null default now();

do $$ begin
  alter table "Hisp Pharmacy Order taker"
    add constraint orders_status_check
    check (status in ('pending','preparing','delivering','delivered','cancelled'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table "Hisp Pharmacy Order taker"
    add constraint orders_payment_check check (payment_method in ('cash','card'));
exception when duplicate_object then null; end $$;

-- 2. Store places orders through this function -----------------------------
-- security definer so anon can create an order without being able to read any.
-- The total is recomputed here rather than trusted from the browser.
create or replace function public.place_order(
  p_full_name      text,
  p_phone          text,
  p_address        text,
  p_items          jsonb,
  p_notes          text default '',
  p_payment_method text default 'cash',
  p_lang           text default 'es'
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id    bigint;
  v_total numeric;
begin
  if length(trim(coalesce(p_full_name, ''))) < 2 then
    raise exception 'invalid_name';
  end if;
  if length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) not between 10 and 11 then
    raise exception 'invalid_phone';
  end if;
  if length(trim(coalesce(p_address, ''))) < 5 then
    raise exception 'invalid_address';
  end if;
  if jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 60 then
    raise exception 'invalid_items';
  end if;
  if p_payment_method not in ('cash', 'card') then
    raise exception 'invalid_payment';
  end if;

  select coalesce(sum((i->>'qty')::int * (i->>'price')::numeric), 0)
    into v_total
    from jsonb_array_elements(p_items) i
   where (i->>'qty')::int between 1 and 99;

  insert into "Hisp Pharmacy Order taker"
    (full_name, phone, address, items, total, status, notes, payment_method, lang)
  values
    (left(trim(p_full_name), 120), left(trim(p_phone), 30), left(trim(p_address), 300),
     p_items, round(v_total, 2), 'pending', left(trim(coalesce(p_notes, '')), 500),
     p_payment_method, case when p_lang = 'en' then 'en' else 'es' end)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.place_order(text, text, text, jsonb, text, text, text) from public;
grant execute on function public.place_order(text, text, text, jsonb, text, text, text) to anon, authenticated;

-- Raw inserts from the browser are no longer needed.
drop policy if exists "store can insert orders" on "Hisp Pharmacy Order taker";

-- 3. Staff-only access ---------------------------------------------------------
create table if not exists public.pharmacy_staff (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.pharmacy_staff enable row level security;

drop policy if exists "staff can see own row" on public.pharmacy_staff;
create policy "staff can see own row" on public.pharmacy_staff
  for select to authenticated using (user_id = auth.uid());

create or replace function public.is_pharmacy_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.pharmacy_staff where user_id = auth.uid());
$$;

-- Previously ANY signed-in user could read every order.
drop policy if exists "authenticated can view orders" on "Hisp Pharmacy Order taker";

drop policy if exists "staff read orders" on "Hisp Pharmacy Order taker";
create policy "staff read orders" on "Hisp Pharmacy Order taker"
  for select to authenticated using (public.is_pharmacy_staff());

drop policy if exists "staff update orders" on "Hisp Pharmacy Order taker";
create policy "staff update orders" on "Hisp Pharmacy Order taker"
  for update to authenticated
  using (public.is_pharmacy_staff())
  with check (public.is_pharmacy_staff());
