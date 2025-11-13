create extension if not exists "pgcrypto";

begin;

-- Ensure we work in UTC everywhere without leaking session state
set local time zone 'UTC';

-- Utility function to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null default '',
  default_currency text not null default 'USD',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_currency_valid check (default_currency in ('USD','EUR','GBP','JPY','INR','CAD'))
);

-- Ensure legacy rows comply with new constraints
update public.profiles
set
  name = coalesce(name, ''),
  default_currency = upper(coalesce(default_currency, 'USD'))
where true;

alter table public.profiles
  alter column name set default '',
  alter column name set not null,
  alter column default_currency set default 'USD',
  alter column default_currency set not null,
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now());

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_currency_valid'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_currency_valid
      check (default_currency in ('USD','EUR','GBP','JPY','INR','CAD'));
  end if;
end $$;

-- Recreate trigger safely (idempotent)
do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'profiles_updated_at'
      and tgrelid = 'public.profiles'::regclass
  ) then
    drop trigger profiles_updated_at on public.profiles;
  end if;
  create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
end $$;

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  icon text,
  color text,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_name_length check (char_length(name) between 1 and 50),
  constraint categories_sort_order_nonnegative check (sort_order >= 0)
);

alter table public.categories
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now()),
  alter column sort_order set default 0,
  alter column is_default set default false,
  alter column is_active set default true;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'categories_updated_at'
      and tgrelid = 'public.categories'::regclass
  ) then
    drop trigger categories_updated_at on public.categories;
  end if;
  create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();
end $$;

create index if not exists categories_user_sort_idx on public.categories (user_id, sort_order);
create unique index if not exists categories_user_name_unique on public.categories (user_id, lower(name));

-- Budgets
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  amount_cents integer not null,
  currency text not null,
  period text not null,
  start_date timestamptz not null,
  end_date timestamptz,
  is_active boolean not null default true,
  alert_threshold integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint budgets_amount_positive check (amount_cents >= 0),
  constraint budgets_period_valid check (period in ('DAILY','WEEKLY','MONTHLY','YEARLY')),
  constraint budgets_alert_valid check (
    alert_threshold is null or (alert_threshold >= 0 and alert_threshold <= 100)
  ),
  constraint budgets_start_end check (
    end_date is null or end_date >= start_date
  ),
  constraint budgets_currency_valid check (currency in ('USD','EUR','GBP','JPY','INR','CAD'))
);

create index if not exists budgets_user_active_idx on public.budgets (user_id, is_active);

alter table public.budgets
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now()),
  alter column is_active set default true;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'budgets_updated_at'
      and tgrelid = 'public.budgets'::regclass
  ) then
    drop trigger budgets_updated_at on public.budgets;
  end if;
  create trigger budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();
end $$;

-- Transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  budget_id uuid references public.budgets(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  amount_cents integer not null,
  note text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint transactions_amount_not_zero check (amount_cents <> 0)
);

create index if not exists transactions_user_date_idx on public.transactions (user_id, occurred_at desc);
create index if not exists transactions_budget_date_idx on public.transactions (budget_id, occurred_at desc);

do $$
declare pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'transactions'
  loop
    execute format('drop policy %I on public.transactions', pol.policyname);
  end loop;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'transactions'
      and column_name = 'user_id'
      and data_type = 'text'
  ) then
    alter table public.transactions
      alter column id type uuid using id::uuid,
      alter column user_id type uuid using user_id::uuid,
      alter column budget_id type uuid using nullif(budget_id, '')::uuid,
      alter column category_id type uuid using nullif(category_id, '')::uuid;
  end if;
end $$;

alter table public.transactions
  alter column created_at set default timezone('utc', now()),
  alter column updated_at set default timezone('utc', now());

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'transactions_updated_at'
      and tgrelid = 'public.transactions'::regclass
  ) then
    drop trigger transactions_updated_at on public.transactions;
  end if;
  create trigger transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();
end $$;

-- RLS policies
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.budgets enable row level security;
alter table public.transactions enable row level security;

-- Policies redefined idempotently
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_select_self'
  ) then
    drop policy profiles_select_self on public.profiles;
  end if;
  create policy profiles_select_self on public.profiles
    for select using (auth.uid() = id);

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_upsert_self'
  ) then
    drop policy profiles_upsert_self on public.profiles;
  end if;
  create policy profiles_upsert_self on public.profiles
    for all using (auth.uid() = id)
    with check (auth.uid() = id);

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'categories_read_own'
  ) then
    drop policy categories_read_own on public.categories;
  end if;
  create policy categories_read_own on public.categories
    for select using (auth.uid() = user_id);

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'categories_write_own'
  ) then
    drop policy categories_write_own on public.categories;
  end if;
  create policy categories_write_own on public.categories
    for all using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'budgets'
      and policyname = 'budgets_read_own'
  ) then
    drop policy budgets_read_own on public.budgets;
  end if;
  create policy budgets_read_own on public.budgets
    for select using (auth.uid() = user_id);

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'budgets'
      and policyname = 'budgets_write_own'
  ) then
    drop policy budgets_write_own on public.budgets;
  end if;
  create policy budgets_write_own on public.budgets
    for all using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'transactions'
      and policyname = 'transactions_read_own'
  ) then
    drop policy transactions_read_own on public.transactions;
  end if;
  create policy transactions_read_own on public.transactions
    for select using (auth.uid() = user_id);

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'transactions'
      and policyname = 'transactions_write_own'
  ) then
    drop policy transactions_write_own on public.transactions;
  end if;
  create policy transactions_write_own on public.transactions
    for all using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
end $$;

-- Default categories seed (idempotent)
with default_categories as (
  select *
  from (
    values
      ('Groceries', 'Food and household supplies', '🛒', '#34d399', 1),
      ('Rent', 'Housing expenses', '🏠', '#60a5fa', 2),
      ('Utilities', 'Electricity, water, internet', '💡', '#fbbf24', 3),
      ('Transport', 'Public transit, fuel, rideshare', '🚌', '#f97316', 4),
      ('Health', 'Healthcare and wellness', '🩺', '#ef4444', 5),
      ('Entertainment', 'Streaming, events, hobbies', '🎮', '#a855f7', 6)
  ) as c(name, description, icon, color, sort_order)
)
insert into public.categories (id, user_id, name, description, icon, color, is_default, sort_order)
select
  coalesce(existing.id, gen_random_uuid()),
  p.id,
  c.name,
  c.description,
  c.icon,
  c.color,
  true,
  c.sort_order
from public.profiles p
cross join default_categories c
left join lateral (
  select id
  from public.categories
  where user_id = p.id
    and lower(name) = lower(c.name)
  limit 1
) existing on true
where existing.id is null;

commit;


