-- Extends the existing portfolio database. The established is_owner() function
-- is shared with the projects editor. Existing projects, films and URLs stay valid.
create table public.portfolio_works (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('website', 'album', 'video')),
  title text not null default '' check (length(title) <= 180),
  website_url text check (website_url ~ '^https?://[^/[:space:]]+'),
  photos text[] not null default '{}' check (cardinality(photos) <= 100),
  video_path text,
  project_slug text check (length(project_slug) between 1 and 180),
  parent_id uuid references public.portfolio_works(id) on delete restrict,
  listed boolean not null default true,
  featured boolean not null default false,
  published boolean not null default false,
  updated_at timestamptz not null default clock_timestamp(),
  check (num_nonnulls(project_slug, parent_id) <= 1),
  check (parent_id is distinct from id),
  check (listed or project_slug is not null or parent_id is not null),
  check (kind <> 'website' or (parent_id is null and project_slug is null)),
  check (not published or (length(trim(title)) > 0 and case kind
    when 'website' then website_url is not null
    when 'album' then cardinality(photos) > 0
    when 'video' then video_path is not null end))
);

create index portfolio_works_feed on public.portfolio_works (kind, updated_at desc, id) where published and listed;
create index portfolio_works_featured on public.portfolio_works (updated_at desc, id) where published and featured;
create index portfolio_works_project on public.portfolio_works (project_slug, updated_at desc, id) where published;
create index portfolio_works_parent on public.portfolio_works (parent_id, updated_at desc, id);

create function public.validate_portfolio_work() returns trigger
language plpgsql set search_path = '' as $$
declare asset text;
begin
  if tg_op = 'UPDATE' and new.id <> old.id then
    raise exception 'Work IDs cannot change';
  end if;
  if new.parent_id is not null then
    perform 1 from public.portfolio_works
      where id = new.parent_id and kind = 'website' and (not new.published or published)
      for share;
    if not found then raise exception 'Choose a published website for this work'; end if;
  end if;
  if tg_op = 'UPDATE' and (not new.published or new.kind <> 'website') and exists (
    select 1 from public.portfolio_works where parent_id = new.id and (published or new.kind <> 'website')
  ) then raise exception 'Unpublish or move the attached works first'; end if;
  foreach asset in array (new.photos || array_remove(array[new.video_path], null)) loop
    if asset is null or asset like '%..%' or not (
      asset ~ ('^' || new.id::text || '/[a-zA-Z0-9._-]+$') or
      asset ~ '^/assets/video-ads/[a-zA-Z0-9/._-]+$' or
      (asset = new.video_path and asset ~ '^stream:[0-9a-f]{32}$')
    ) then raise exception 'Invalid portfolio media path'; end if;
  end loop;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.validate_portfolio_work() from public, anon, authenticated;
create trigger portfolio_work_validate before insert or update on public.portfolio_works
  for each row execute function public.validate_portfolio_work();

alter table public.portfolio_works enable row level security;
grant select on public.portfolio_works to anon, authenticated;
grant insert, update, delete on public.portfolio_works to authenticated;
create policy "published portfolio works" on public.portfolio_works
  for select to anon, authenticated using (published);
create policy "owner manages portfolio works" on public.portfolio_works
  for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values
  ('portfolio-media', 'portfolio-media', false, 52428800, array['image/webp','image/jpeg','video/mp4','video/webm']);

-- A private object is readable publicly only while referenced by a published
-- work. Other photos in the same folder can still be private draft edits.
create index portfolio_works_media_root on public.portfolio_works ((id::text)) where published;
create policy "published portfolio media" on storage.objects for select to anon, authenticated using (
  bucket_id = 'portfolio-media' and exists (
    select 1 from public.portfolio_works w where w.published
    and w.id::text = split_part(storage.objects.name, '/', 1)
    and (storage.objects.name = any(w.photos) or storage.objects.name = w.video_path
      or (w.photos[1] like '%.jpg' and storage.objects.name = regexp_replace(w.photos[1], '\.jpg$', '-thumb.jpg')))
  )
);
create policy "owner manages portfolio media" on storage.objects for all to authenticated
  using (bucket_id = 'portfolio-media' and (select public.is_owner()))
  with check (bucket_id = 'portfolio-media' and (select public.is_owner()));
