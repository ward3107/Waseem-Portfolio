-- ===========================================================================
-- Admin v2 schema additions.
--
-- Idempotent — safe to re-run. Assumes v1 (supabase/schema.sql) is already
-- applied, i.e. the projects/certifications/reviews tables + is_owner() +
-- app_owner all exist.
--
-- Run in the Supabase SQL editor after the v1 file, then confirm:
--   select updated_at from public.projects limit 1;
--   select * from public.site_settings;
-- ===========================================================================

-- ---------- updated_at columns + touch trigger ----------
alter table public.projects       add column if not exists updated_at timestamptz not null default now();
alter table public.certifications add column if not exists updated_at timestamptz not null default now();
alter table public.reviews        add column if not exists updated_at timestamptz not null default now();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists projects_touch       on public.projects;
drop trigger if exists certifications_touch on public.certifications;
drop trigger if exists reviews_touch        on public.reviews;

create trigger projects_touch       before update on public.projects
  for each row execute function public.touch_updated_at();
create trigger certifications_touch before update on public.certifications
  for each row execute function public.touch_updated_at();
create trigger reviews_touch        before update on public.reviews
  for each row execute function public.touch_updated_at();

-- ---------- site_settings (single row) ----------
create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  contact_email text,
  whatsapp text,
  github_url text,
  linkedin_url text,
  twitter_url text,
  hero_badge jsonb not null default '{}'::jsonb,          -- { en, he, ar }
  hero_headline jsonb not null default '{}'::jsonb,       -- { en, he, ar }
  hero_subtitle jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "public read settings"  on public.site_settings;
drop policy if exists "owner write settings"  on public.site_settings;

create policy "public read settings" on public.site_settings for select using (true);
create policy "owner write settings" on public.site_settings for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

insert into public.site_settings (id) values (true) on conflict do nothing;

drop trigger if exists settings_touch on public.site_settings;
create trigger settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();
