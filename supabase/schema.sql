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
  created_at timestamptz not null default now()
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
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  rating int not null check (rating between 1 and 5),
  text jsonb not null default '{}'::jsonb,           -- { en, he, ar }
  location text,
  date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
alter table public.projects enable row level security;
alter table public.certifications enable row level security;
alter table public.reviews enable row level security;

-- Public read
create policy "public read projects"       on public.projects       for select using (true);
create policy "public read certifications" on public.certifications for select using (true);
create policy "public read reviews"        on public.reviews        for select using (true);

-- Owner (any authenticated user) write
create policy "auth write projects"        on public.projects       for all to authenticated using (true) with check (true);
create policy "auth write certifications"  on public.certifications for all to authenticated using (true) with check (true);
create policy "auth write reviews"         on public.reviews        for all to authenticated using (true) with check (true);

-- ---------- Storage ----------
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

create policy "public read assets"
  on storage.objects for select using (bucket_id = 'assets');

create policy "auth write assets"
  on storage.objects for insert to authenticated with check (bucket_id = 'assets');

create policy "auth update assets"
  on storage.objects for update to authenticated using (bucket_id = 'assets');

create policy "auth delete assets"
  on storage.objects for delete to authenticated using (bucket_id = 'assets');
