-- Quotation chat threads (run in Supabase SQL Editor if schema was already applied).
-- Safe to re-run.

create table if not exists public.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  sender text not null check (sender in ('customer', 'staff')),
  sender_name text not null default '',
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists inquiry_messages_inquiry_id_created_at_idx
  on public.inquiry_messages (inquiry_id, created_at);

alter table public.inquiry_messages enable row level security;

drop policy if exists "Staff read inquiry messages" on public.inquiry_messages;
drop policy if exists "Staff insert inquiry messages" on public.inquiry_messages;

-- Staff can read/write via authenticated staff profiles; public access goes through service-role API.
create policy "Staff read inquiry messages"
  on public.inquiry_messages for select
  using (public.is_staff());

create policy "Staff insert inquiry messages"
  on public.inquiry_messages for insert
  with check (public.is_staff());

grant select, insert on public.inquiry_messages to authenticated;
grant all on public.inquiry_messages to service_role;
