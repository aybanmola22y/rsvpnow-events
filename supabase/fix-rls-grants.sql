-- Run this once in Supabase SQL Editor if public form inserts fail with RLS 42501.
-- Grants + ensure public INSERT policies exist for anon/authenticated.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to service_role;
grant select, insert on public.inquiries to anon, authenticated;
grant select, insert on public.contact_messages to anon, authenticated;
grant select on public.venues to anon, authenticated;
grant select on public.services to anon, authenticated;
grant select on public.packages to anon, authenticated;
grant select on public.website_settings to anon, authenticated;

alter table public.inquiries enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can create inquiries" on public.inquiries;
create policy "Anyone can create inquiries"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Anyone can create contact messages" on public.contact_messages;
create policy "Anyone can create contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);
