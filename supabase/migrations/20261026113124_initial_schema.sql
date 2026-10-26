-- M1: initial schema. Tables from docs/spec.md "Data model", all with RLS.

create type public.cycle_unit as enum ('day', 'week', 'month', 'year');
create type public.payment_method as enum ('mpesa', 'card', 'carrier_billing', 'bank');
create type public.subscription_status as enum ('active', 'paused', 'cancelled');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles: one row per auth user, created by trigger on sign-up.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  base_currency char(3) not null default 'KES',
  default_reminder_days smallint not null default 3 check (default_reminder_days in (0, 1, 3, 7)),
  timezone text not null default 'Africa/Nairobi',
  expo_push_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- services: shared presets, read-only to users (seeded in M2).
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  logo_url text,
  default_currency char(3) not null default 'KES',
  cancel_url text
);

-- subscriptions: user-owned. Quarterly = month x 3, custom = day x N.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  name text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  currency char(3) not null default 'KES',
  cycle_unit public.cycle_unit not null default 'month',
  cycle_count smallint not null default 1 check (cycle_count > 0),
  start_date date not null default current_date,
  next_billing_date date not null,
  payment_method public.payment_method,
  category text,
  is_trial boolean not null default false,
  trial_ends_at date,
  trial_price numeric(12, 2) check (trial_price >= 0),
  reminder_days smallint check (reminder_days in (0, 1, 3, 7)), -- null = profile default
  status public.subscription_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trial_needs_end_date check (not is_trial or trial_ends_at is not null)
);

create index subscriptions_user_next_billing_idx on public.subscriptions (user_id, next_billing_date);
create index subscriptions_service_id_idx on public.subscriptions (service_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- fx_rates: daily rates, written by the FX job (M3) with the service role.
create table public.fx_rates (
  date date not null,
  base char(3) not null default 'KES',
  currency char(3) not null,
  rate numeric(18, 8) not null check (rate > 0),
  primary key (date, base, currency)
);

comment on column public.fx_rates.rate is 'Units of currency per 1 base (KES). amount_kes = amount / rate.';

-- Row-level security
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.subscriptions enable row level security;
alter table public.fx_rates enable row level security;

create policy "Users read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Users update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Signed-in users read services" on public.services
  for select to authenticated using (true);

create policy "Users read own subscriptions" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users insert own subscriptions" on public.subscriptions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users update own subscriptions" on public.subscriptions
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Users delete own subscriptions" on public.subscriptions
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "Signed-in users read fx rates" on public.fx_rates
  for select to authenticated using (true);

-- Create a profile row for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
