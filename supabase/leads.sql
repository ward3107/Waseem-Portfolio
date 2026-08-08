-- Contact-form leads (Part 1 of the GBP conversion system). Run once via the
-- Supabase SQL editor.
--
-- The public site inserts a row every time a visitor completes the project
-- wizard on /contact. The wizard also captures the visitor's UTM attribution
-- (utm_source/medium/campaign) so leads from the GBP profile can be counted
-- separately from organic-search or direct visits — critical for measuring
-- whether the GBP work is actually converting.
--
-- Anon: INSERT only. Authenticated (owner via RLS): full CRUD.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Visitor-entered fields (wizard).
  name text not null,
  email text not null,
  project_type text,          -- 'web' | 'app' | 'ai' | 'ecommerce'
  vibe text,                  -- 'minimal' | 'bold' | 'corporate' | 'future'
  budget text,                -- 'small' | 'medium' | 'large' | 'enterprise'
  details text,               -- free-text project description

  -- Context useful for follow-up copy and analytics.
  language text,              -- 'en' | 'he' | 'ar'
  utm_source text,            -- 'gbp' when routed through /from-gbp
  utm_medium text,            -- 'profile' from /from-gbp; may be 'cpc'/'email' elsewhere
  utm_campaign text,          -- destination-page slug for /from-gbp
  referrer text,              -- document.referrer at submit (empty on direct/typed)
  landing_path text,          -- pathname the visitor first arrived on

  -- Admin workflow.
  contacted boolean not null default false,
  notes text,

  -- Sanity: reject obviously invalid input at the DB layer, not just the UI.
  constraint leads_name_len check (char_length(name) between 1 and 200),
  constraint leads_email_len check (char_length(email) between 5 and 320),
  constraint leads_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint leads_details_len check (details is null or char_length(details) <= 5000),
  constraint leads_language_ck check (language is null or language in ('en', 'he', 'ar'))
);

comment on table public.leads is
  'Contact-form leads from the /contact project wizard, with UTM attribution ' ||
  'so GBP-sourced conversions are trackable. Anon inserts only.';

create index if not exists leads_created_at_idx  on public.leads (created_at desc);
create index if not exists leads_utm_source_idx  on public.leads (utm_source);
create index if not exists leads_contacted_idx   on public.leads (contacted) where contacted = false;

-- RLS: anon INSERTs, authenticated does the rest. The is_owner() function in
-- schema.sql is already the gate the admin panel uses, but leads are simpler —
-- any authenticated session is the owner in practice (there's only one).
alter table public.leads enable row level security;

drop policy if exists "anon can insert leads" on public.leads;
create policy "anon can insert leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "authenticated can read leads" on public.leads;
create policy "authenticated can read leads"
  on public.leads
  for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update leads" on public.leads;
create policy "authenticated can update leads"
  on public.leads
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete leads" on public.leads;
create policy "authenticated can delete leads"
  on public.leads
  for delete
  to authenticated
  using (true);
