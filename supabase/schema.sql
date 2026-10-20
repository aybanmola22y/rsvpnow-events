-- =============================================================================
-- RSVPNow · ONE-SHOT SUPABASE SETUP
-- =============================================================================
-- HOW TO USE
-- 1. Open Supabase → SQL Editor → New query
-- 2. Paste this entire file → Run
-- 3. Project Settings → API → copy URL + anon key + service_role into .env
-- 4. In .env set: NEXT_PUBLIC_USE_SUPABASE=true
-- 5. Restart npm run dev
--
-- TABLES CREATED
--   clients, venues, services, packages, inquiries, contact_messages,
--   proposals, bookings, payments, staff_profiles, website_settings, activity_logs
--
-- AFTER THIS (optional staff login)
--   Auth → Users → Add user (email/password)
--   Then run the staff insert at the bottom with that user's UUID
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create sequence if not exists public.document_seq;

create or replace function public.next_document_number(prefix text)
returns text
language plpgsql
as $$
declare
  n bigint;
begin
  n := nextval('public.document_seq');
  return prefix || '-' || to_char(timezone('utc', now()), 'YYYY') || '-' || lpad(n::text, 5, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null default '',
  email text not null,
  phone text not null default '',
  status text not null default 'Lead',
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists clients_email_lower_idx on public.clients (lower(email));

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  images text[] not null default '{}',
  short_description text not null default '',
  description text not null default '',
  location text not null default '',
  starting_price numeric(12, 2) not null default 0,
  min_capacity int not null default 0,
  max_capacity int not null default 0,
  amenities text[] not null default '{}',
  facilities text[] not null default '{}',
  event_types text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image text not null default '',
  price numeric(12, 2) not null default 0,
  pricing_type text not null default 'Fixed',
  category text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image text not null default '',
  price numeric(12, 2) not null default 0,
  sale_price numeric(12, 2),
  guest_capacity int not null default 0,
  inclusions text[] not null default '{}',
  exclusions text[] not null default '{}',
  venue_ids uuid[] not null default '{}',
  service_ids uuid[] not null default '{}',
  event_type text not null default '',
  featured boolean not null default false,
  published boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default '',
  full_name text not null,
  company text not null default '',
  email text not null,
  phone text not null default '',
  event_type text not null default '',
  event_date date,
  start_time text,
  end_time text,
  guest_count int not null default 0,
  venue_preference text not null default '',
  venue_name text not null default '',
  venue_address text not null default '',
  package_id text,
  service_ids text[] not null default '{}',
  budget numeric(12, 2) not null default 0,
  theme text not null default '',
  special_requests text not null default '',
  status text not null default 'NEW',
  assigned_staff text not null default '',
  source text not null default 'website',
  client_id uuid references public.clients (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  subject text not null default '',
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default '',
  inquiry_id uuid references public.inquiries (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  status text not null default 'DRAFT',
  items jsonb not null default '[]'::jsonb,
  notes text not null default '',
  valid_until date,
  deposit_percent numeric(5, 2) not null default 30,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists proposals_set_updated_at on public.proposals;
create trigger proposals_set_updated_at
before update on public.proposals
for each row execute function public.set_updated_at();

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default '',
  client_id uuid references public.clients (id) on delete set null,
  proposal_id uuid references public.proposals (id) on delete set null,
  inquiry_id uuid references public.inquiries (id) on delete set null,
  event_name text not null,
  event_type text not null default '',
  venue_id uuid references public.venues (id) on delete set null,
  venue_name text not null default '',
  event_date date,
  start_time text,
  end_time text,
  guest_count int not null default 0,
  total numeric(12, 2) not null default 0,
  paid numeric(12, 2) not null default 0,
  payment_status text not null default 'Unpaid',
  status text not null default 'Tentative',
  service_ids text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default '',
  booking_id uuid not null references public.bookings (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  amount numeric(12, 2) not null,
  method text not null default 'Bank Transfer',
  reference text not null default '',
  date date not null default (timezone('utc', now()))::date,
  notes text not null default '',
  status text not null default 'Completed',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.staff_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'Staff',
  status text not null default 'Active',
  created_at timestamptz not null default timezone('utc', now())
);

-- Must be created AFTER staff_profiles (SQL functions resolve tables at create time)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff_profiles sp
    where sp.id = auth.uid()
      and sp.status = 'Active'
  );
$$;

create table if not exists public.website_settings (
  id int primary key default 1 check (id = 1),
  company_name text not null default 'RSVPNow',
  company_description text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  facebook text not null default '',
  instagram text not null default '',
  tiktok text not null default '',
  youtube text not null default '',
  website text not null default '',
  business_hours text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.website_settings (id, company_name)
values (1, 'RSVPNow')
on conflict (id) do nothing;

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor text not null default 'System',
  entity_type text,
  entity_id text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Auto-number inquiries (INQ-2026-00001, …)
create or replace function public.inquiries_set_number()
returns trigger
language plpgsql
as $$
begin
  if new.number is null or new.number = '' then
    new.number := public.next_document_number('INQ');
  end if;
  return new;
end;
$$;

drop trigger if exists inquiries_set_number on public.inquiries;
create trigger inquiries_set_number
before insert on public.inquiries
for each row execute function public.inquiries_set_number();

-- Auto-number bookings / payments / proposals when left blank
-- Trigger args must use TG_ARGV (Postgres forbids declared args on trigger fns)
drop trigger if exists bookings_set_number on public.bookings;
drop trigger if exists payments_set_number on public.payments;
drop trigger if exists proposals_set_number on public.proposals;
drop function if exists public.set_document_number(text);
drop function if exists public.set_document_number();

create or replace function public.set_document_number()
returns trigger
language plpgsql
as $$
begin
  if new.number is null or new.number = '' then
    new.number := public.next_document_number(TG_ARGV[0]);
  end if;
  return new;
end;
$$;

create trigger bookings_set_number
before insert on public.bookings
for each row execute function public.set_document_number('BK');

create trigger payments_set_number
before insert on public.payments
for each row execute function public.set_document_number('PAY');

create trigger proposals_set_number
before insert on public.proposals
for each row execute function public.set_document_number('PRP');

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.clients enable row level security;
alter table public.venues enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.inquiries enable row level security;
alter table public.contact_messages enable row level security;
alter table public.proposals enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.website_settings enable row level security;
alter table public.activity_logs enable row level security;

-- Drop old policies so this script can be re-run safely
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'clients','venues','services','packages','inquiries','contact_messages',
        'proposals','bookings','payments','staff_profiles','website_settings','activity_logs'
      )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

create policy "Public can read published venues"
  on public.venues for select
  using (published = true or public.is_staff());

create policy "Public can read active services"
  on public.services for select
  using (active = true or public.is_staff());

create policy "Public can read published packages"
  on public.packages for select
  using ((published = true and archived = false) or public.is_staff());

create policy "Public can read website settings"
  on public.website_settings for select
  using (true);

create policy "Anyone can create inquiries"
  on public.inquiries for insert
  with check (true);

create policy "Anyone can create contact messages"
  on public.contact_messages for insert
  with check (true);

create policy "Staff manage clients" on public.clients for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage venues" on public.venues for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage services" on public.services for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage packages" on public.packages for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff read inquiries" on public.inquiries for select using (public.is_staff());
create policy "Staff update inquiries" on public.inquiries for update using (public.is_staff()) with check (public.is_staff());
create policy "Staff read contact messages" on public.contact_messages for select using (public.is_staff());
create policy "Staff manage proposals" on public.proposals for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage bookings" on public.bookings for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage payments" on public.payments for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage settings" on public.website_settings for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff read activity" on public.activity_logs for select using (public.is_staff());
create policy "Staff insert activity" on public.activity_logs for insert with check (public.is_staff());
create policy "Staff read own profile" on public.staff_profiles for select using (auth.uid() = id or public.is_staff());
create policy "Staff manage staff profiles" on public.staff_profiles for all using (public.is_staff()) with check (public.is_staff());

-- Privileges for Supabase roles (required for REST / PostgREST)
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant select, insert on public.inquiries to anon, authenticated;
grant select, insert on public.contact_messages to anon, authenticated;
grant select on public.venues, public.services, public.packages, public.website_settings to anon, authenticated;

-- =============================================================================
-- OPTIONAL · after you create a user in Authentication → Users
-- Replace the UUID / email / name, then run this block alone:
-- =============================================================================
-- insert into public.staff_profiles (id, name, email, role, status)
-- values (
--   'PASTE_AUTH_USER_UUID_HERE',
--   'Ava Mendoza',
--   'admin@eventdemo.com',
--   'Administrator',
--   'Active'
-- )
-- on conflict (id) do update
-- set name = excluded.name,
--     email = excluded.email,
--     role = excluded.role,
--     status = excluded.status;
