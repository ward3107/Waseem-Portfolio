-- ===========================================================================
-- Fix: "new row violates row-level security policy" on admin uploads.
--
-- The main schema.sql defines four policies on storage.objects for the
-- `assets` bucket, but on this deployment those policies were never applied
-- (only the table-level RLS was). This script re-applies just the storage
-- bits — the bucket row and the four policies — idempotently.
--
-- RUN:
--   Supabase Dashboard → SQL Editor → paste this file → Run.
--   The `is_owner()` gate must already be set up (public.app_owner row must
--   contain your user id) — if you can save projects in /admin/projects,
--   is_owner() is fine and only the storage policies are missing.
--
-- VERIFY afterwards:
--   1. select public.is_owner();  -- must be `true`
--   2. Go to /admin/certifications/new and drop an image — no RLS error.
-- ===========================================================================

-- Bucket (idempotent — same shape as schema.sql).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assets', 'assets', true,
  5242880,
  array['image/png','image/jpeg','image/webp','image/avif','application/pdf']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Drop any earlier / mis-named versions so re-running is safe.
drop policy if exists "public read assets"  on storage.objects;
drop policy if exists "auth write assets"   on storage.objects;
drop policy if exists "auth update assets"  on storage.objects;
drop policy if exists "auth delete assets"  on storage.objects;
drop policy if exists "owner write assets"  on storage.objects;
drop policy if exists "owner update assets" on storage.objects;
drop policy if exists "owner delete assets" on storage.objects;

-- Public read: anyone can fetch by URL (the bucket is public).
create policy "public read assets" on storage.objects
  for select using (bucket_id = 'assets');

-- Only the owner can insert / update / delete objects in the assets bucket.
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
