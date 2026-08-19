-- Gentro shared catalog migration. Run once in the Supabase SQL Editor.
-- The storefront can read products; catalog changes require a signed-in admin.

alter table public.products
  add column if not exists stock integer not null default 0,
  add column if not exists sizes text[] not null default array['M', 'L']::text[],
  add column if not exists colors text[] not null default array['#000000']::text[],
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_bestseller boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'Moderator' check (role in ('Super Admin', 'Admin', 'Moderator')),
  created_at timestamptz not null default now()
);

alter table public.admin_users
  add column if not exists role text not null default 'Moderator' check (role in ('Super Admin', 'Admin', 'Moderator'));

-- The first existing catalog admin is the store owner. Change this role later
-- from Staff Control if you want another person to manage access.
update public.admin_users
set role = 'Super Admin'
where user_id = (select user_id from public.admin_users order by created_at asc limit 1);

alter table public.admin_users enable row level security;
alter table public.products enable row level security;

create or replace function public.is_catalog_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.is_store_manager()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and role in ('Super Admin', 'Admin')
  );
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop policy if exists "Public can view products" on public.products;
drop policy if exists "Catalog admins can manage products" on public.products;
create policy "Public can view products" on public.products
for select to anon, authenticated using (true);
create policy "Catalog admins can manage products" on public.products
for all to authenticated using (public.is_store_manager()) with check (public.is_store_manager());

-- After creating your admin in Dashboard > Authentication > Users, run:
-- insert into public.admin_users (user_id) values ('AUTH-USER-UUID-HERE');

do $$ begin
  alter publication supabase_realtime add table public.products;
exception when duplicate_object then null;
end $$;

-- Storefront orders. Customers may create an order without an account; only
-- catalog admins can read or update it in the admin panel.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  email text,
  phone text not null,
  address text not null,
  city text not null,
  area text,
  postal_code text,
  company text,
  order_note text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  shipping_fee numeric(12, 2) not null default 0 check (shipping_fee >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  total numeric(12, 2) not null check (total >= 0),
  payment_method text not null check (payment_method in ('cod', 'card', 'mobile')),
  payment_status text not null default 'Unpaid' check (payment_status in ('Paid', 'Unpaid')),
  status text not null default 'Pending' check (status in ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

drop policy if exists "Anyone can place an order" on public.orders;
drop policy if exists "Catalog admins can view orders" on public.orders;
drop policy if exists "Catalog admins can update orders" on public.orders;
create policy "Anyone can place an order" on public.orders
for insert to anon, authenticated with check (true);
create policy "Catalog admins can view orders" on public.orders
for select to authenticated using (public.is_catalog_admin());
create policy "Catalog admins can update orders" on public.orders
for update to authenticated using (public.is_catalog_admin()) with check (public.is_catalog_admin());

do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
end $$;

-- A customer directory maintained automatically whenever a checkout creates an order.
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text not null,
  email text,
  total_orders integer not null default 0,
  total_spent numeric(12, 2) not null default 0,
  first_order_at timestamptz not null default now(),
  last_order_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers enable row level security;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers
for each row execute function public.set_updated_at();

create or replace function public.sync_customer_from_order()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.customers (phone, name, email, total_orders, total_spent, first_order_at, last_order_at)
  values (new.phone, new.customer_name, new.email, 1, new.total, new.created_at, new.created_at)
  on conflict (phone) do update set
    name = excluded.name,
    email = coalesce(excluded.email, public.customers.email),
    total_orders = public.customers.total_orders + 1,
    total_spent = public.customers.total_spent + excluded.total_spent,
    last_order_at = excluded.last_order_at;
  return new;
end;
$$;

drop trigger if exists orders_sync_customer on public.orders;
create trigger orders_sync_customer after insert on public.orders
for each row execute function public.sync_customer_from_order();

-- Include orders that existed before this customer directory was introduced.
insert into public.customers (phone, name, email, total_orders, total_spent, first_order_at, last_order_at)
select phone, max(customer_name), max(email), count(*)::integer, sum(total), min(created_at), max(created_at)
from public.orders
group by phone
on conflict (phone) do update set
  name = excluded.name,
  email = coalesce(excluded.email, public.customers.email),
  total_orders = excluded.total_orders,
  total_spent = excluded.total_spent,
  first_order_at = excluded.first_order_at,
  last_order_at = excluded.last_order_at;

drop policy if exists "Catalog admins can view customers" on public.customers;
create policy "Catalog admins can view customers" on public.customers
for select to authenticated using (public.is_catalog_admin());

do $$ begin
  alter publication supabase_realtime add table public.customers;
exception when duplicate_object then null;
end $$;

-- Staff access management. Only a Super Admin can grant, change, or revoke roles.
create or replace function public.get_my_admin_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.admin_users where user_id = auth.uid();
$$;

create or replace function public.list_staff()
returns table (user_id uuid, name text, email text, role text, created_at timestamptz)
language plpgsql security definer set search_path = public, auth as $$
begin
  if not exists (select 1 from public.admin_users au where au.user_id = auth.uid() and au.role = 'Super Admin') then
    raise exception 'Only a Super Admin can view staff accounts';
  end if;
  return query
  select au.user_id, coalesce(u.raw_user_meta_data->>'name', u.email)::text, u.email::text, au.role::text, au.created_at
  from public.admin_users au join auth.users u on u.id = au.user_id
  order by au.created_at asc;
end;
$$;

create or replace function public.grant_staff_access(target_email text, target_role text)
returns void language plpgsql security definer set search_path = public, auth as $$
declare target_id uuid;
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'Super Admin') then
    raise exception 'Only a Super Admin can grant staff access';
  end if;
  if target_role not in ('Super Admin', 'Admin', 'Moderator') then
    raise exception 'Invalid staff role';
  end if;
  select id into target_id from auth.users where lower(email) = lower(trim(target_email));
  if target_id is null then
    raise exception 'No Supabase Authentication account exists for this email';
  end if;
  insert into public.admin_users (user_id, role) values (target_id, target_role)
  on conflict (user_id) do update set role = excluded.role;
end;
$$;

create or replace function public.revoke_staff_access(target_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'Super Admin') then
    raise exception 'Only a Super Admin can revoke staff access';
  end if;
  if target_user_id = auth.uid() then raise exception 'You cannot remove your own access'; end if;
  if (select role from public.admin_users where user_id = target_user_id) = 'Super Admin'
     and (select count(*) from public.admin_users where role = 'Super Admin') <= 1 then
    raise exception 'At least one Super Admin must remain';
  end if;
  delete from public.admin_users where user_id = target_user_id;
end;
$$;

grant execute on function public.get_my_admin_role() to authenticated;
grant execute on function public.list_staff() to authenticated;
grant execute on function public.grant_staff_access(text, text) to authenticated;
grant execute on function public.revoke_staff_access(uuid) to authenticated;
