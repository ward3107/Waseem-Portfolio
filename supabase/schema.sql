-- ===========================================================================
-- Portfolio admin schema — tables, owner-scoped RLS, storage.
--
-- RUN ORDER (once, in the Supabase SQL editor):
--   1. Authentication → Users → "Add user"  (create YOUR admin account first)
--   2. Authentication → Sign In / Providers → Email →
--        turn OFF "Allow new users to sign up"
--   3. Run this whole file
--   4. Run the OWNER STEP at the very bottom (paste your user id)
--
-- Until step 4 is done, is_owner() returns false and NOBODY can write. That is
-- deliberate: this file fails closed, so a half-finished setup is locked, not
-- wide open.
-- ===========================================================================

-- ---------- Tables ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null check (category in ('Web','AI','Mobile')),
  description jsonb not null default '{}'::jsonb,   -- { en, he, ar }
  image_url text,
  tech text[] not null default '{}',
  link text,
  github text,
  screenshots text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  -- Content sanity. These also hold against a compromised client, because the
  -- database enforces them regardless of which API the write came through.
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_title_len   check (char_length(title) between 1 and 200),
  constraint projects_link_scheme check (link   is null or link   ~ '^https?://'),
  constraint projects_gh_scheme   check (github is null or github ~ '^https?://')
);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title jsonb not null default '{}'::jsonb,          -- { en, he, ar }
  issuer text not null,
  issue_date date not null,
  expiry_date date,
  credential_url text not null,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint certs_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint certs_issuer_len  check (char_length(issuer) between 1 and 200),
  constraint certs_cred_scheme check (credential_url ~ '^https?://')
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  rating int not null check (rating between 1 and 5),
  text jsonb not null default '{}'::jsonb,           -- { en, he, ar }
  location text,
  date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint reviews_author_len check (char_length(author) between 1 and 120)
);

-- ---------- Who is allowed to write ----------
-- Single source of truth for "is the caller the site owner". Reads a uid stored
-- in a private table, so rotating the owner never means editing policies.
create table if not exists public.app_owner (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null references auth.users(id) on delete cascade
);
alter table public.app_owner enable row level security;
-- No policies on app_owner => no client can read or change it through the API.
-- Only the SQL editor / service_role (which bypasses RLS) can touch it.

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.app_owner
     where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_owner() from public, anon;
grant  execute on function public.is_owner() to authenticated;

-- ---------- Row Level Security ----------
alter table public.projects       enable row level security;
alter table public.certifications enable row level security;
alter table public.reviews        enable row level security;

-- Drop any earlier permissive versions so re-running this file is safe.
drop policy if exists "auth write projects"        on public.projects;
drop policy if exists "auth write certifications"  on public.certifications;
drop policy if exists "auth write reviews"         on public.reviews;
drop policy if exists "public read projects"       on public.projects;
drop policy if exists "public read certifications" on public.certifications;
drop policy if exists "public read reviews"        on public.reviews;

-- Public read: the site is public, this is intended.
create policy "public read projects"       on public.projects       for select using (true);
create policy "public read certifications" on public.certifications for select using (true);
create policy "public read reviews"        on public.reviews        for select using (true);

-- Write: the owner only. NOT "any authenticated user" — anyone who can register
-- an account would otherwise be able to rewrite or delete the whole portfolio.
create policy "owner write projects" on public.projects
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner write certifications" on public.certifications
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner write reviews" on public.reviews
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- ---------- Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assets', 'assets', true,
  5242880,  -- 5 MB ceiling, enforced server-side
  array['image/png','image/jpeg','image/webp','image/avif','application/pdf']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
-- image/svg+xml is deliberately excluded: SVG is an active-content format and
-- this bucket is publicly served.

drop policy if exists "public read assets" on storage.objects;
drop policy if exists "auth write assets"  on storage.objects;
drop policy if exists "auth update assets" on storage.objects;
drop policy if exists "auth delete assets" on storage.objects;
drop policy if exists "owner write assets"  on storage.objects;
drop policy if exists "owner update assets" on storage.objects;
drop policy if exists "owner delete assets" on storage.objects;

create policy "public read assets" on storage.objects
  for select using (bucket_id = 'assets');

create policy "owner write assets" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'assets' and public.is_owner());

create policy "owner update assets" on storage.objects
  for update to authenticated
  using      (bucket_id = 'assets' and public.is_owner())
  with check (bucket_id = 'assets' and public.is_owner());

create policy "owner delete assets" on storage.objects
  for delete to authenticated
  using (bucket_id = 'assets' and public.is_owner());

-- ===========================================================================
-- OWNER STEP — run this after creating your admin user.
--
--   1. Find your id:      select id, email from auth.users;
--   2. Paste it below and run the insert.
--
-- insert into public.app_owner (singleton, user_id)
-- values (true, 'PASTE-YOUR-USER-UUID-HERE')
-- on conflict (singleton) do update set user_id = excluded.user_id;
--
-- Verify it took:         select public.is_owner();   -- must be true for you
-- ===========================================================================
