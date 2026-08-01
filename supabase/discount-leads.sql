-- Discount-game lead capture. Run once via the Supabase SQL editor.
--
-- The public site inserts a row every time a visitor claims a discount
-- from the tech-stack game. Admin reads them from the admin dashboard
-- (any authenticated user with the existing admin role). Anon users can
-- INSERT but cannot SELECT / UPDATE / DELETE — writes only.

create table if not exists public.discount_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  contact text not null,          -- WhatsApp number or email (normalized manually)
  percent numeric(4,1) not null,  -- 2, 2.5, 3, ... 10
  code text not null,             -- VIBE02 ... VIBE10 (matches src/features/tech-stack/config.ts)
  language text,                  -- 'en' | 'he' | 'ar' — helpful for follow-up copy
  contacted boolean not null default false,
  notes text
);

comment on table public.discount_leads is
  'Leads captured from the tech-stack discount game. Anon inserts only.';

create index if not exists discount_leads_created_at_idx
  on public.discount_leads (created_at desc);

-- RLS: anon can INSERT, only authenticated can SELECT/UPDATE/DELETE.
alter table public.discount_leads enable row level security;

drop policy if exists "anon can insert leads" on public.discount_leads;
create policy "anon can insert leads"
  on public.discount_leads
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "authenticated can read leads" on public.discount_leads;
create policy "authenticated can read leads"
  on public.discount_leads
  for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update leads" on public.discount_leads;
create policy "authenticated can update leads"
  on public.discount_leads
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete leads" on public.discount_leads;
create policy "authenticated can delete leads"
  on public.discount_leads
  for delete
  to authenticated
  using (true);
