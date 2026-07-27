# Admin Panel (Supabase + Vercel) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a password-protected `/admin` area that lets the owner manage projects, certificates, reviews, and images from any device, with changes auto-publishing to the live site through Supabase (no code edits, no rebuild).

**Architecture:** The existing static React/Vite site keeps rendering as-is, but content components read from Supabase at runtime (with the current hardcoded arrays as an offline fallback). A new `/admin` route, guarded by Supabase Auth, provides CRUD forms and image upload to Supabase Storage. Public read is open; all writes require the logged-in owner (enforced by Row Level Security).

**Tech Stack:** React 18, Vite 7, TypeScript, Tailwind, React Router 7, `@supabase/supabase-js` v2, Vitest (new, for logic unit tests), Vercel hosting.

## Global Constraints

- Package manager: `npm`. Node/Vite already configured; do not change build tooling beyond adding Vitest.
- Languages: content text stored as a JSON map `{ en, he, ar }`. **`en` is required; `he` and `ar` are optional** and fall back to `en` when empty. App languages come from `types.ts` `Language = 'en' | 'he' | 'ar'`.
- Never place the Supabase `service_role` key in frontend code, `.env.example`, or the repo. Frontend uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- RLS: `SELECT` allowed for `anon`; `INSERT/UPDATE/DELETE` and Storage writes allowed only for `authenticated`.
- No public sign-up; a single owner account is created manually.
- Follow existing code style: functional components, `React.FC`, Tailwind classes, `useLanguage()` for i18n, path imports relative (no path aliases exist).
- Commit after every task. Use Conventional Commit messages.
- Working directory for all paths below: the site root that contains `App.tsx` and `package.json`.

---

## File Structure

**New files**
- `lib/supabaseClient.ts` — single Supabase browser client.
- `lib/localized.ts` — `localized()` multilingual fallback helper.
- `lib/github.ts` — parse repo URL + fetch public repo metadata.
- `lib/content/mappers.ts` — DB row ⇆ app model mapping.
- `lib/content/projects.ts` — projects data access (list/create/update/remove).
- `lib/content/certifications.ts` — certifications data access.
- `lib/content/reviews.ts` — reviews data access.
- `lib/content/storage.ts` — image upload/delete helpers.
- `hooks/useProjects.ts`, `hooks/useCertifications.ts`, `hooks/useReviews.ts` — public read hooks with fallback.
- `contexts/AdminAuthContext.tsx` — auth state + login/logout.
- `components/admin/RequireAuth.tsx` — route guard.
- `components/admin/AdminLayout.tsx` — admin shell + tab nav.
- `components/admin/ImageUpload.tsx` — reusable upload field.
- `components/admin/ProjectsManager.tsx`, `CertificationsManager.tsx`, `ReviewsManager.tsx` — CRUD screens.
- `pages/admin/LoginPage.tsx`, `pages/admin/AdminDashboard.tsx` — admin pages.
- `scripts/seed-supabase.mjs` — one-time seed from current data.
- `supabase/schema.sql` — tables, RLS, storage policies (run once against the provided project).
- `vercel.json` — SPA rewrite.
- Test files under `**/__tests__/` alongside the units they test.
- `vitest.config.ts`, `vitest.setup.ts` — test runner config.

**Modified files**
- `types.ts` — add `LocalizedText` and DB-row/content types.
- `App.tsx` — add `/admin` routes + `AdminAuthProvider`.
- `components/Certifications.tsx`, `components/FeaturedProjects.tsx`, `components/Projects.tsx`, `components/Reviews.tsx` — read from hooks instead of static imports.
- `data/projects.ts`, `data/certifications.ts`, `data/reviews.ts` — keep as fallback exports (unchanged logic, still valid).
- `.env.example` — add Supabase vars.
- `package.json` — add deps + `test` script.

---

## Task 1: Install dependencies and add Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Test: `lib/__tests__/smoke.test.ts`

**Interfaces:**
- Produces: an `npm test` script running Vitest; global `expect`/`describe`/`it`.

- [ ] **Step 1: Install packages**

Run:
```bash
npm install @supabase/supabase-js
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```
Expected: packages added, no errors.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Add the `test` script to `package.json`**

In the `"scripts"` object add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a smoke test at `lib/__tests__/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('vitest', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts lib/__tests__/smoke.test.ts
git commit -m "chore: add supabase-js and vitest test runner"
```

---

## Task 2: Supabase schema, RLS, and storage

**Files:**
- Create: `supabase/schema.sql`

**Interfaces:**
- Produces: tables `projects`, `certifications`, `reviews`; public Storage bucket `assets`; RLS policies. Column names are consumed by `lib/content/mappers.ts` (Task 5).

> This SQL is executed **once** against the Supabase project the owner provides (via the Supabase SQL editor, or by Claude using the connected Supabase tools at execution time). It is version-controlled here so the schema is reproducible.

- [ ] **Step 1: Create `supabase/schema.sql`**

```sql
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
```

- [ ] **Step 2: Apply it to the provided Supabase project**

Once the owner provides the project: run this SQL in the Supabase SQL editor (or via the connected Supabase tools). Then, in Authentication → Providers, **disable public sign-ups**, and create the single owner user (email + password) in Authentication → Users.

Verify: `select * from public.projects;` returns 0 rows without error; the `assets` bucket exists.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add supabase schema, RLS, and storage policies"
```

---

## Task 3: Supabase client + env

**Files:**
- Create: `lib/supabaseClient.ts`
- Modify: `.env.example`
- Modify: `vite-env.d.ts` (add typed env vars)

**Interfaces:**
- Produces: `export const supabase` (a `SupabaseClient`). Consumed by all `lib/content/*` and auth.

- [ ] **Step 1: Add env vars to `.env.example`**

Append:
```
# ==========================================
# Supabase (admin panel + content)
# ==========================================
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

- [ ] **Step 2: Type the env in `vite-env.d.ts`**

Add inside the existing `ImageMetaEnv`/`ImportMetaEnv` interface (create the block if absent):
```ts
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```
(If the file already declares `ImportMetaEnv`, merge these two fields into it rather than redeclaring.)

- [ ] **Step 3: Create `lib/supabaseClient.ts`**

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when both env vars are present. The site still renders (with fallback
 *  content) when Supabase is not configured, so we never throw at import time. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient = createClient(
  url ?? 'http://localhost:54321',
  anonKey ?? 'public-anon-key-placeholder'
);
```

- [ ] **Step 4: Create `.env.local` for development**

Run (fill values when the owner provides them):
```bash
printf 'VITE_SUPABASE_URL=%s\nVITE_SUPABASE_ANON_KEY=%s\n' "$SUPABASE_URL" "$SUPABASE_ANON_KEY" >> .env.local
```
`.env.local` is already gitignored — verify it is **not** staged.

- [ ] **Step 5: Commit (no secrets)**

```bash
git add .env.example vite-env.d.ts lib/supabaseClient.ts
git commit -m "feat: add supabase client and env config"
```

---

## Task 4: Content types

**Files:**
- Modify: `types.ts`

**Interfaces:**
- Produces: `LocalizedText`, `ProjectRow`, `CertificationRow`, `ReviewRow`. `Project`, `Certification`, `Review` already exist and stay the app-facing shapes.

- [ ] **Step 1: Append types to `types.ts`**

```ts
/** Multilingual text. `en` required; `he`/`ar` optional (fall back to en). */
export interface LocalizedText {
  en: string;
  he?: string;
  ar?: string;
}

/** Rows exactly as stored in Supabase. */
export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  category: 'Web' | 'AI' | 'Mobile';
  description: LocalizedText;
  image_url: string | null;
  tech: string[];
  link: string | null;
  github: string | null;
  screenshots: string[];
  sort_order: number;
  created_at: string;
}

export interface CertificationRow {
  id: string;
  slug: string;
  title: LocalizedText;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_url: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  author: string;
  rating: number;
  text: LocalizedText;
  location: string | null;
  date: string | null;
  sort_order: number;
  created_at: string;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```bash
git add types.ts
git commit -m "feat: add content and DB row types"
```

---

## Task 5: Localized text helper (TDD)

**Files:**
- Create: `lib/localized.ts`
- Test: `lib/__tests__/localized.test.ts`

**Interfaces:**
- Produces: `localized(text: LocalizedText, lang: Language): string`. Consumed by mappers and hooks.

- [ ] **Step 1: Write the failing test `lib/__tests__/localized.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { localized } from '../localized';

describe('localized', () => {
  it('returns the requested language when present', () => {
    expect(localized({ en: 'Hello', he: 'שלום', ar: 'مرحبا' }, 'he')).toBe('שלום');
  });

  it('falls back to en when the requested language is empty', () => {
    expect(localized({ en: 'Hello', he: '' }, 'he')).toBe('Hello');
  });

  it('falls back to en when the requested language is missing', () => {
    expect(localized({ en: 'Hello' }, 'ar')).toBe('Hello');
  });

  it('returns empty string when given empty input', () => {
    expect(localized({ en: '' }, 'en')).toBe('');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- localized`
Expected: FAIL ("Cannot find module '../localized'").

- [ ] **Step 3: Implement `lib/localized.ts`**

```ts
import type { Language, LocalizedText } from '../types';

/** Return text in `lang`, falling back to English when empty/missing. */
export function localized(text: LocalizedText, lang: Language): string {
  const value = text[lang];
  if (value && value.trim().length > 0) return value;
  return text.en ?? '';
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- localized`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/localized.ts lib/__tests__/localized.test.ts
git commit -m "feat: add localized text fallback helper"
```

---

## Task 6: Row⇆model mappers (TDD)

**Files:**
- Create: `lib/content/mappers.ts`
- Test: `lib/content/__tests__/mappers.test.ts`

**Interfaces:**
- Consumes: `localized` (Task 5); types (Task 4).
- Produces:
  - `projectRowToModel(row: ProjectRow, lang: Language): Project`
  - `certRowToModel(row: CertificationRow, lang: Language): Certification`
  - `reviewRowToModel(row: ReviewRow, lang: Language): Review`

- [ ] **Step 1: Write the failing test `lib/content/__tests__/mappers.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { projectRowToModel, certRowToModel, reviewRowToModel } from '../mappers';
import type { ProjectRow, CertificationRow, ReviewRow } from '../../../types';

const projectRow: ProjectRow = {
  id: '1', slug: 'souvlaki', title: 'Souvlaki', category: 'Web',
  description: { en: 'Greek', he: 'יווני' }, image_url: '/x.png',
  tech: ['Next.js'], link: 'https://x', github: null, screenshots: [],
  sort_order: 0, created_at: '2026-01-01',
};

describe('mappers', () => {
  it('maps a project row to the app Project model (localized he)', () => {
    const p = projectRowToModel(projectRow, 'he');
    expect(p).toMatchObject({
      id: 'souvlaki', title: 'Souvlaki', category: 'Web',
      description: 'יווני', image: '/x.png', tech: ['Next.js'], link: 'https://x',
    });
    expect(p.github).toBeUndefined();
  });

  it('uses en fallback when locale missing on a cert title', () => {
    const row: CertificationRow = {
      id: '2', slug: 'ga', title: { en: 'Google Ads' }, issuer: 'Google',
      issue_date: '2026-07-16', expiry_date: '2027-07-16',
      credential_url: 'https://c', image_url: null, sort_order: 0, created_at: '2026-01-01',
    };
    expect(certRowToModel(row, 'ar').title).toBe('Google Ads');
  });

  it('maps a review row with localized text', () => {
    const row: ReviewRow = {
      id: '3', author: 'Dana', rating: 5, text: { en: 'Great', he: 'מעולה' },
      location: 'עכו', date: '2026-07-01', sort_order: 0, created_at: '2026-01-01',
    };
    expect(reviewRowToModel(row, 'he')).toMatchObject({
      author: 'Dana', rating: 5, text: 'מעולה', location: 'עכו', date: '2026-07-01',
    });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- mappers`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/content/mappers.ts`**

```ts
import type {
  Language, Project, Certification, Review,
  ProjectRow, CertificationRow, ReviewRow,
} from '../../types';
import { localized } from '../localized';

export function projectRowToModel(row: ProjectRow, lang: Language): Project {
  return {
    id: row.slug,
    title: row.title,
    category: row.category,
    description: localized(row.description, lang),
    image: row.image_url ?? '',
    tech: row.tech,
    link: row.link ?? undefined,
    github: row.github ?? undefined,
    screenshots: row.screenshots.length ? row.screenshots : undefined,
  };
}

export function certRowToModel(row: CertificationRow, lang: Language): Certification {
  return {
    id: row.slug,
    title: localized(row.title, lang),
    issuer: row.issuer,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date ?? '',
    credentialUrl: row.credential_url,
  };
}

export function reviewRowToModel(row: ReviewRow, lang: Language): Review {
  return {
    author: row.author,
    rating: row.rating,
    text: localized(row.text, lang),
    location: row.location ?? undefined,
    date: row.date ?? undefined,
  };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- mappers`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/content/mappers.ts lib/content/__tests__/mappers.test.ts
git commit -m "feat: add row-to-model mappers with locale fallback"
```

---

## Task 7: GitHub auto-fill helper (TDD)

**Files:**
- Create: `lib/github.ts`
- Test: `lib/__tests__/github.test.ts`

**Interfaces:**
- Produces:
  - `parseRepoUrl(url: string): { owner: string; repo: string } | null`
  - `fetchRepoMeta(url: string): Promise<{ title: string; description: string; tech: string[]; github: string } | null>`
  Consumed by `ProjectsManager` (Task 13).

- [ ] **Step 1: Write the failing test `lib/__tests__/github.test.ts`**

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseRepoUrl, fetchRepoMeta } from '../github';

describe('parseRepoUrl', () => {
  it('parses a standard repo URL', () => {
    expect(parseRepoUrl('https://github.com/ward3107/Souvlaki')).toEqual({
      owner: 'ward3107', repo: 'Souvlaki',
    });
  });
  it('parses a URL with trailing .git and slash', () => {
    expect(parseRepoUrl('https://github.com/ward3107/Vocaband.git/')).toEqual({
      owner: 'ward3107', repo: 'Vocaband',
    });
  });
  it('returns null for a non-github URL', () => {
    expect(parseRepoUrl('https://example.com/x/y')).toBeNull();
  });
});

describe('fetchRepoMeta', () => {
  afterEach(() => vi.restoreAllMocks());

  it('maps the GitHub API response to form fields', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.endsWith('/languages')) {
        return { ok: true, json: async () => ({ TypeScript: 100, CSS: 20 }) } as Response;
      }
      return {
        ok: true,
        json: async () => ({ name: 'Souvlaki', description: 'A Greek site' }),
      } as Response;
    }));

    const meta = await fetchRepoMeta('https://github.com/ward3107/Souvlaki');
    expect(meta).toEqual({
      title: 'Souvlaki',
      description: 'A Greek site',
      tech: ['TypeScript', 'CSS'],
      github: 'https://github.com/ward3107/Souvlaki',
    });
  });

  it('returns null on a bad URL', async () => {
    expect(await fetchRepoMeta('not a url')).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- github`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/github.ts`**

```ts
export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname !== 'github.com' && u.hostname !== 'www.github.com') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');
    if (!owner || !repo) return null;
    return { owner, repo };
  } catch {
    return null;
  }
}

export async function fetchRepoMeta(
  url: string
): Promise<{ title: string; description: string; tech: string[]; github: string } | null> {
  const parsed = parseRepoUrl(url);
  if (!parsed) return null;
  const { owner, repo } = parsed;
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  try {
    const [repoRes, langRes] = await Promise.all([
      fetch(base),
      fetch(`${base}/languages`),
    ]);
    if (!repoRes.ok) return null;
    const info = await repoRes.json();
    const langs = langRes.ok ? await langRes.json() : {};
    return {
      title: info.name ?? repo,
      description: info.description ?? '',
      tech: Object.keys(langs),
      github: `https://github.com/${owner}/${repo}`,
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- github`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/github.ts lib/__tests__/github.test.ts
git commit -m "feat: add github repo auto-fill helper"
```

---

## Task 8: Data-access layer (projects, certifications, reviews)

**Files:**
- Create: `lib/content/projects.ts`
- Create: `lib/content/certifications.ts`
- Create: `lib/content/reviews.ts`
- Test: `lib/content/__tests__/projects.test.ts`

**Interfaces:**
- Consumes: `supabase` (Task 3), mappers (Task 6).
- Produces (each module):
  - `listProjectRows(): Promise<ProjectRow[]>` (and `listCertRows`, `listReviewRows`)
  - `createProject(input): Promise<void>`, `updateProject(id, input): Promise<void>`, `deleteProject(id): Promise<void>` (and cert/review equivalents)
  - Input types `ProjectInput`, `CertificationInput`, `ReviewInput` (all row columns except `id`/`created_at`).

- [ ] **Step 1: Create `lib/content/projects.ts`**

```ts
import { supabase } from '../supabaseClient';
import type { ProjectRow } from '../../types';

export type ProjectInput = Omit<ProjectRow, 'id' | 'created_at'>;

export async function listProjectRows(): Promise<ProjectRow[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}

export async function createProject(input: ProjectInput): Promise<void> {
  const { error } = await supabase.from('projects').insert(input);
  if (error) throw error;
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<void> {
  const { error } = await supabase.from('projects').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 2: Create `lib/content/certifications.ts`**

```ts
import { supabase } from '../supabaseClient';
import type { CertificationRow } from '../../types';

export type CertificationInput = Omit<CertificationRow, 'id' | 'created_at'>;

export async function listCertRows(): Promise<CertificationRow[]> {
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CertificationRow[];
}

export async function createCert(input: CertificationInput): Promise<void> {
  const { error } = await supabase.from('certifications').insert(input);
  if (error) throw error;
}

export async function updateCert(id: string, input: Partial<CertificationInput>): Promise<void> {
  const { error } = await supabase.from('certifications').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteCert(id: string): Promise<void> {
  const { error } = await supabase.from('certifications').delete().eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 3: Create `lib/content/reviews.ts`**

```ts
import { supabase } from '../supabaseClient';
import type { ReviewRow } from '../../types';

export type ReviewInput = Omit<ReviewRow, 'id' | 'created_at'>;

export async function listReviewRows(): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ReviewRow[];
}

export async function createReview(input: ReviewInput): Promise<void> {
  const { error } = await supabase.from('reviews').insert(input);
  if (error) throw error;
}

export async function updateReview(id: string, input: Partial<ReviewInput>): Promise<void> {
  const { error } = await supabase.from('reviews').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}
```

- [ ] **Step 4: Write the test `lib/content/__tests__/projects.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client module before importing the unit under test.
const order = vi.fn();
const select = vi.fn(() => ({ order }));
const insert = vi.fn(async () => ({ error: null }));
const from = vi.fn(() => ({ select, insert }));

vi.mock('../../supabaseClient', () => ({
  supabase: { from },
}));

import { listProjectRows, createProject } from '../projects';

describe('projects data access', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists rows ordered by sort_order', async () => {
    order.mockResolvedValueOnce({ data: [{ slug: 'a' }], error: null });
    const rows = await listProjectRows();
    expect(from).toHaveBeenCalledWith('projects');
    expect(order).toHaveBeenCalledWith('sort_order', { ascending: true });
    expect(rows).toEqual([{ slug: 'a' }]);
  });

  it('throws when supabase returns an error', async () => {
    order.mockResolvedValueOnce({ data: null, error: new Error('boom') });
    await expect(listProjectRows()).rejects.toThrow('boom');
  });

  it('inserts on create', async () => {
    await createProject({
      slug: 'x', title: 'X', category: 'Web', description: { en: 'x' },
      image_url: null, tech: [], link: null, github: null, screenshots: [], sort_order: 0,
    });
    expect(insert).toHaveBeenCalled();
  });
});
```

- [ ] **Step 5: Run tests**

Run: `npm test -- projects`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add lib/content/projects.ts lib/content/certifications.ts lib/content/reviews.ts lib/content/__tests__/projects.test.ts
git commit -m "feat: add supabase data-access layer for content"
```

---

## Task 9: Image storage helper

**Files:**
- Create: `lib/content/storage.ts`

**Interfaces:**
- Consumes: `supabase` (Task 3).
- Produces:
  - `uploadImage(file: File, folder: string): Promise<string>` → public URL
  - `deleteImageByUrl(url: string): Promise<void>`

- [ ] **Step 1: Create `lib/content/storage.ts`**

```ts
import { supabase } from '../supabaseClient';

const BUCKET = 'assets';

/** Upload a file under `folder/` and return its public URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '-');
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Best-effort delete of an uploaded image given its public URL. */
export async function deleteImageByUrl(url: string): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
```

> Note: `Math.random()`/`Date.now()` are fine in application runtime code; the workflow-script restriction does not apply here.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/content/storage.ts
git commit -m "feat: add supabase storage upload helper"
```

---

## Task 10: Public read hooks with fallback

**Files:**
- Create: `hooks/useProjects.ts`
- Create: `hooks/useCertifications.ts`
- Create: `hooks/useReviews.ts`

**Interfaces:**
- Consumes: data-access lists (Task 8), mappers (Task 6), `isSupabaseConfigured` (Task 3), `useLanguage` (existing), fallback data (`data/*.ts`).
- Produces:
  - `useProjects(): { projects: Project[]; loading: boolean }`
  - `useCertifications(): { certifications: Certification[]; loading: boolean }`
  - `useReviews(): { reviews: Review[]; loading: boolean }`

- [ ] **Step 1: Create `hooks/useProjects.ts`**

```ts
import { useEffect, useState } from 'react';
import type { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { listProjectRows } from '../lib/content/projects';
import { projectRowToModel } from '../lib/content/mappers';
import { getLocalizedProjects } from '../data/projects';

export function useProjects(): { projects: Project[]; loading: boolean } {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>(() => getLocalizedProjects(t));
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    listProjectRows()
      .then((rows) => {
        if (active && rows.length) setProjects(rows.map((r) => projectRowToModel(r, language)));
      })
      .catch(() => {/* keep fallback */})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [language]);

  return { projects, loading };
}
```

- [ ] **Step 2: Create `hooks/useCertifications.ts`**

```ts
import { useEffect, useState } from 'react';
import type { Certification } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { listCertRows } from '../lib/content/certifications';
import { certRowToModel } from '../lib/content/mappers';
import { CERTIFICATIONS } from '../data/certifications';

export function useCertifications(): { certifications: Certification[]; loading: boolean } {
  const { language } = useLanguage();
  const [certifications, setCertifications] = useState<Certification[]>(CERTIFICATIONS);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    listCertRows()
      .then((rows) => {
        if (active && rows.length) setCertifications(rows.map((r) => certRowToModel(r, language)));
      })
      .catch(() => {/* keep fallback */})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [language]);

  return { certifications, loading };
}
```

- [ ] **Step 3: Create `hooks/useReviews.ts`**

```ts
import { useEffect, useState } from 'react';
import type { Review } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { listReviewRows } from '../lib/content/reviews';
import { reviewRowToModel } from '../lib/content/mappers';
import { REVIEWS } from '../data/reviews';

export function useReviews(): { reviews: Review[]; loading: boolean } {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    listReviewRows()
      .then((rows) => {
        if (active) setReviews(rows.map((r) => reviewRowToModel(r, language)));
      })
      .catch(() => {/* keep fallback */})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [language]);

  return { reviews, loading };
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add hooks/useProjects.ts hooks/useCertifications.ts hooks/useReviews.ts
git commit -m "feat: add public content hooks with offline fallback"
```

---

## Task 11: Wire public components to the hooks

**Files:**
- Modify: `components/FeaturedProjects.tsx:7,15`
- Modify: `components/Projects.tsx:7,33`
- Modify: `components/Certifications.tsx:6,69`
- Modify: `components/Reviews.tsx:4,46-104`

**Interfaces:**
- Consumes: hooks from Task 10.

- [ ] **Step 1: `FeaturedProjects.tsx`** — replace the static import + call.

Remove `import { getLocalizedProjects } from '../data/projects';` and add `import { useProjects } from '../hooks/useProjects';`. Replace:
```tsx
const projects = getLocalizedProjects(t).slice(0, FEATURED_COUNT);
```
with:
```tsx
const { projects: all } = useProjects();
const projects = all.slice(0, FEATURED_COUNT);
```

- [ ] **Step 2: `Projects.tsx`** — same swap.

Remove the `getLocalizedProjects` import; add `import { useProjects } from '../hooks/useProjects';`. Replace:
```tsx
const localizedProjects = getLocalizedProjects(t);
```
with:
```tsx
const { projects: localizedProjects } = useProjects();
```

- [ ] **Step 3: `Certifications.tsx`** — use the hook.

Remove `import { CERTIFICATIONS } from '../data/certifications';`; add `import { useCertifications } from '../hooks/useCertifications';`. Inside the component, add:
```tsx
const { certifications } = useCertifications();
```
and change `{CERTIFICATIONS.map((cert, index) => (` to `{certifications.map((cert, index) => (`.

- [ ] **Step 4: `Reviews.tsx`** — use the hook.

Remove `import { REVIEWS, averageRating } from '../data/reviews';`; add:
```tsx
import { averageRating } from '../data/reviews';
import { useReviews } from '../hooks/useReviews';
```
At the top of the component body add `const { reviews: REVIEWS } = useReviews();` (keeps the rest of the file, which references `REVIEWS`, unchanged). The early return `if (REVIEWS.length === 0) return null;` must run *after* the hook call — move it below the hook so hooks are not called conditionally.

- [ ] **Step 5: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS (build completes).

- [ ] **Step 6: Manual check with fallback (no Supabase env)**

Run: `npm run dev`, open the site. Expected: projects, certifications, and reviews render exactly as before (fallback path, since `.env.local` may be empty).

- [ ] **Step 7: Commit**

```bash
git add components/FeaturedProjects.tsx components/Projects.tsx components/Certifications.tsx components/Reviews.tsx
git commit -m "feat: read public content from supabase hooks with fallback"
```

---

## Task 12: Admin auth context + route guard + login page

**Files:**
- Create: `contexts/AdminAuthContext.tsx`
- Create: `components/admin/RequireAuth.tsx`
- Create: `pages/admin/LoginPage.tsx`

**Interfaces:**
- Consumes: `supabase` (Task 3).
- Produces:
  - `AdminAuthProvider` + `useAdminAuth(): { user: User | null; loading: boolean; signIn(email,password): Promise<{error?: string}>; signOut(): Promise<void> }`
  - `RequireAuth` wrapper.

- [ ] **Step 1: Create `contexts/AdminAuthContext.tsx`**

```tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AdminAuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
```

- [ ] **Step 2: Create `components/admin/RequireAuth.tsx`**

```tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAdminAuth();
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

export default RequireAuth;
```

- [ ] **Step 3: Create `pages/admin/LoginPage.tsx`**

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const LoginPage: React.FC = () => {
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await signIn(email, password);
    setBusy(false);
    if (res.error) setError(res.error);
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-gray-900 p-6 rounded-2xl">
        <h1 className="text-xl font-bold">Admin login</h1>
        <input
          type="email" required placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 outline-none"
        />
        <input
          type="password" required placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 outline-none"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit" disabled={busy}
          className="w-full py-2 rounded-lg bg-brand-purple font-bold disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add contexts/AdminAuthContext.tsx components/admin/RequireAuth.tsx pages/admin/LoginPage.tsx
git commit -m "feat: add admin auth context, route guard, and login page"
```

---

## Task 13: Admin layout + dashboard + routes

**Files:**
- Create: `components/admin/AdminLayout.tsx`
- Create: `pages/admin/AdminDashboard.tsx`
- Modify: `App.tsx` (wrap with `AdminAuthProvider`, add `/admin` routes)

**Interfaces:**
- Consumes: `RequireAuth` (Task 12), managers (Tasks 14–16, referenced now but created next; use placeholder tab bodies that render "Coming soon" until those tasks land).
- Produces: `AdminLayout` with tab state `'projects' | 'certifications' | 'reviews'`.

- [ ] **Step 1: Create `components/admin/AdminLayout.tsx`**

```tsx
import React from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export type AdminTab = 'projects' | 'certifications' | 'reviews';

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Certificates' },
  { key: 'reviews', label: 'Reviews' },
];

const AdminLayout: React.FC<{
  tab: AdminTab;
  onTab: (t: AdminTab) => void;
  children: React.ReactNode;
}> = ({ tab, onTab, children }) => {
  const { signOut } = useAdminAuth();
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="font-bold">Portfolio Admin</h1>
        <button onClick={signOut} className="text-sm text-gray-400 hover:text-white">
          Sign out
        </button>
      </header>
      <nav className="flex gap-2 px-6 py-3 border-b border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm ${
              tab === t.key ? 'bg-brand-purple font-bold' : 'bg-gray-800 text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="p-6 max-w-4xl mx-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
```

- [ ] **Step 2: Create `pages/admin/AdminDashboard.tsx`** (placeholder bodies until Tasks 14–16)

```tsx
import React, { useState } from 'react';
import AdminLayout, { type AdminTab } from '../../components/admin/AdminLayout';

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<AdminTab>('projects');
  return (
    <AdminLayout tab={tab} onTab={setTab}>
      {tab === 'projects' && <p>Projects manager — coming in Task 14.</p>}
      {tab === 'certifications' && <p>Certificates manager — coming in Task 15.</p>}
      {tab === 'reviews' && <p>Reviews manager — coming in Task 16.</p>}
    </AdminLayout>
  );
};

export default AdminDashboard;
```

- [ ] **Step 3: Modify `App.tsx`** — add provider + lazy admin routes.

Add near the other `lazy(...)` imports:
```tsx
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
```
Add imports at top:
```tsx
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import RequireAuth from './components/admin/RequireAuth';
```
Inside `<Routes>` add:
```tsx
<Route path="/admin/login" element={<LoginPage />} />
<Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
```
Wrap the app tree: change the provider nesting in `App` so `AdminAuthProvider` wraps `BrowserRouter` (place it just inside `WidgetProvider`):
```tsx
<WidgetProvider>
  <AdminAuthProvider>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </AdminAuthProvider>
</WidgetProvider>
```

- [ ] **Step 4: Typecheck + dev check**

Run: `npm run typecheck`
Expected: PASS.
Then `npm run dev`, visit `/admin` → redirected to `/admin/login`. (Sign-in requires Supabase env; verify the redirect works even without it.)

- [ ] **Step 5: Commit**

```bash
git add App.tsx components/admin/AdminLayout.tsx pages/admin/AdminDashboard.tsx
git commit -m "feat: add admin layout, dashboard shell, and protected routes"
```

---

## Task 14: Reusable form pieces + Projects manager

**Files:**
- Create: `components/admin/ImageUpload.tsx`
- Create: `components/admin/LocalizedTextInput.tsx`
- Create: `components/admin/ProjectsManager.tsx`
- Modify: `pages/admin/AdminDashboard.tsx` (render `ProjectsManager`)

**Interfaces:**
- Consumes: data-access (Task 8), storage (Task 9), github helper (Task 7), types (Task 4).
- Produces: `ImageUpload`, `LocalizedTextInput`, `ProjectsManager` (self-contained CRUD screen).

- [ ] **Step 1: Create `components/admin/ImageUpload.tsx`**

```tsx
import React, { useState } from 'react';
import { uploadImage } from '../../lib/content/storage';

const ImageUpload: React.FC<{
  value: string | null;
  folder: string;
  onChange: (url: string) => void;
}> = ({ value, folder, onChange }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      {value && <img src={value} alt="" className="h-24 rounded-lg object-cover" />}
      <input type="file" accept="image/*,application/pdf" onChange={onFile} disabled={busy} />
      {busy && <p className="text-sm text-gray-400">Uploading…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default ImageUpload;
```

- [ ] **Step 2: Create `components/admin/LocalizedTextInput.tsx`**

```tsx
import React from 'react';
import type { LocalizedText } from '../../types';

const LocalizedTextInput: React.FC<{
  label: string;
  value: LocalizedText;
  multiline?: boolean;
  onChange: (v: LocalizedText) => void;
}> = ({ label, value, multiline, onChange }) => {
  const set = (lang: keyof LocalizedText, v: string) => onChange({ ...value, [lang]: v });
  const Field = multiline ? 'textarea' : 'input';
  const langs: { key: keyof LocalizedText; hint: string; required?: boolean }[] = [
    { key: 'en', hint: 'English', required: true },
    { key: 'he', hint: 'עברית (optional)' },
    { key: 'ar', hint: 'العربية (optional)' },
  ];
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{label}</legend>
      {langs.map((l) => (
        <Field
          key={l.key}
          // @ts-expect-error textarea/input share these props
          required={l.required}
          placeholder={l.hint}
          value={value[l.key] ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            set(l.key, e.target.value)
          }
          className="w-full px-3 py-2 rounded-lg bg-gray-800 outline-none"
        />
      ))}
    </fieldset>
  );
};

export default LocalizedTextInput;
```

- [ ] **Step 3: Create `components/admin/ProjectsManager.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import type { ProjectRow, LocalizedText } from '../../types';
import {
  listProjectRows, createProject, updateProject, deleteProject, type ProjectInput,
} from '../../lib/content/projects';
import { fetchRepoMeta } from '../../lib/github';
import ImageUpload from './ImageUpload';
import LocalizedTextInput from './LocalizedTextInput';

const EMPTY: ProjectInput = {
  slug: '', title: '', category: 'Web', description: { en: '' } as LocalizedText,
  image_url: null, tech: [], link: null, github: null, screenshots: [], sort_order: 0,
};

const ProjectsManager: React.FC = () => {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [editing, setEditing] = useState<ProjectInput & { id?: string }>({ ...EMPTY });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = () => listProjectRows().then(setRows).catch((e) => setError(e.message));
  useEffect(() => { reload(); }, []);

  const edit = (r: ProjectRow) => setEditing({ ...r });
  const reset = () => setEditing({ ...EMPTY });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { id, ...input } = editing;
      if (id) await updateProject(id, input);
      else await createProject(input);
      reset();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await deleteProject(id);
    await reload();
  };

  const autofill = async () => {
    if (!editing.github) return;
    const meta = await fetchRepoMeta(editing.github);
    if (!meta) { setError('Could not read that GitHub repo'); return; }
    setEditing((p) => ({
      ...p,
      title: p.title || meta.title,
      description: { ...p.description, en: p.description.en || meta.description },
      tech: p.tech.length ? p.tech : meta.tech,
      github: meta.github,
    }));
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-4 bg-gray-900 p-4 rounded-xl">
        <h2 className="font-bold">{editing.id ? 'Edit project' : 'Add project'}</h2>
        <input required placeholder="Slug (e.g. souvlaki)" value={editing.slug}
          onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <input required placeholder="Title" value={editing.title}
          onChange={(e) => setEditing({ ...editing, title: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <select value={editing.category}
          onChange={(e) => setEditing({ ...editing, category: e.target.value as ProjectInput['category'] })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800">
          <option>Web</option><option>AI</option><option>Mobile</option>
        </select>
        <LocalizedTextInput label="Description" multiline value={editing.description}
          onChange={(description) => setEditing({ ...editing, description })} />
        <input placeholder="Live link" value={editing.link ?? ''}
          onChange={(e) => setEditing({ ...editing, link: e.target.value || null })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <div className="flex gap-2">
          <input placeholder="GitHub URL" value={editing.github ?? ''}
            onChange={(e) => setEditing({ ...editing, github: e.target.value || null })}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800" />
          <button type="button" onClick={autofill}
            className="px-3 py-2 rounded-lg bg-gray-700 text-sm">Auto-fill</button>
        </div>
        <input placeholder="Tech (comma separated)" value={editing.tech.join(', ')}
          onChange={(e) => setEditing({ ...editing, tech: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <ImageUpload value={editing.image_url} folder={`projects/${editing.slug || 'misc'}`}
          onChange={(url) => setEditing({ ...editing, image_url: url })} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-brand-purple font-bold disabled:opacity-50">
            {editing.id ? 'Update' : 'Add'}
          </button>
          {editing.id && <button type="button" onClick={reset} className="px-4 py-2 rounded-lg bg-gray-700">Cancel</button>}
        </div>
      </form>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between bg-gray-900 px-4 py-3 rounded-lg">
            <span>{r.title} <span className="text-gray-500 text-sm">({r.category})</span></span>
            <span className="flex gap-3 text-sm">
              <button onClick={() => edit(r)} className="text-blue-400">Edit</button>
              <button onClick={() => remove(r.id)} className="text-red-400">Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsManager;
```

- [ ] **Step 4: Render it in `AdminDashboard.tsx`**

Replace the projects placeholder line with:
```tsx
{tab === 'projects' && <ProjectsManager />}
```
and add `import ProjectsManager from '../../components/admin/ProjectsManager';`.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/admin/ImageUpload.tsx components/admin/LocalizedTextInput.tsx components/admin/ProjectsManager.tsx pages/admin/AdminDashboard.tsx
git commit -m "feat: add projects admin manager with image upload and github autofill"
```

---

## Task 15: Certifications manager

**Files:**
- Create: `components/admin/CertificationsManager.tsx`
- Modify: `pages/admin/AdminDashboard.tsx`

**Interfaces:**
- Consumes: cert data-access (Task 8), `ImageUpload`, `LocalizedTextInput` (Task 14).

- [ ] **Step 1: Create `components/admin/CertificationsManager.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import type { CertificationRow, LocalizedText } from '../../types';
import {
  listCertRows, createCert, updateCert, deleteCert, type CertificationInput,
} from '../../lib/content/certifications';
import ImageUpload from './ImageUpload';
import LocalizedTextInput from './LocalizedTextInput';

const EMPTY: CertificationInput = {
  slug: '', title: { en: '' } as LocalizedText, issuer: '', issue_date: '',
  expiry_date: null, credential_url: '', image_url: null, sort_order: 0,
};

const CertificationsManager: React.FC = () => {
  const [rows, setRows] = useState<CertificationRow[]>([]);
  const [editing, setEditing] = useState<CertificationInput & { id?: string }>({ ...EMPTY });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = () => listCertRows().then(setRows).catch((e) => setError(e.message));
  useEffect(() => { reload(); }, []);
  const reset = () => setEditing({ ...EMPTY });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { id, ...input } = editing;
      if (id) await updateCert(id, input);
      else await createCert(input);
      reset();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this certificate?')) return;
    await deleteCert(id);
    await reload();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-4 bg-gray-900 p-4 rounded-xl">
        <h2 className="font-bold">{editing.id ? 'Edit certificate' : 'Add certificate'}</h2>
        <input required placeholder="Slug (e.g. google-ads-search)" value={editing.slug}
          onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <LocalizedTextInput label="Title" value={editing.title}
          onChange={(title) => setEditing({ ...editing, title })} />
        <input required placeholder="Issuer" value={editing.issuer}
          onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <label className="block text-sm">Issue date
          <input required type="date" value={editing.issue_date}
            onChange={(e) => setEditing({ ...editing, issue_date: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        </label>
        <label className="block text-sm">Expiry date (optional)
          <input type="date" value={editing.expiry_date ?? ''}
            onChange={(e) => setEditing({ ...editing, expiry_date: e.target.value || null })}
            className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        </label>
        <input required placeholder="Credential URL" value={editing.credential_url}
          onChange={(e) => setEditing({ ...editing, credential_url: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <ImageUpload value={editing.image_url} folder={`certifications/${editing.slug || 'misc'}`}
          onChange={(url) => setEditing({ ...editing, image_url: url })} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-brand-purple font-bold disabled:opacity-50">
            {editing.id ? 'Update' : 'Add'}
          </button>
          {editing.id && <button type="button" onClick={reset} className="px-4 py-2 rounded-lg bg-gray-700">Cancel</button>}
        </div>
      </form>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between bg-gray-900 px-4 py-3 rounded-lg">
            <span>{r.title.en} <span className="text-gray-500 text-sm">({r.issuer})</span></span>
            <span className="flex gap-3 text-sm">
              <button onClick={() => setEditing({ ...r })} className="text-blue-400">Edit</button>
              <button onClick={() => remove(r.id)} className="text-red-400">Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CertificationsManager;
```

- [ ] **Step 2: Render in `AdminDashboard.tsx`**

Replace the certifications placeholder with `{tab === 'certifications' && <CertificationsManager />}` and add the import.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/admin/CertificationsManager.tsx pages/admin/AdminDashboard.tsx
git commit -m "feat: add certifications admin manager"
```

---

## Task 16: Reviews manager

**Files:**
- Create: `components/admin/ReviewsManager.tsx`
- Modify: `pages/admin/AdminDashboard.tsx`

**Interfaces:**
- Consumes: review data-access (Task 8), `LocalizedTextInput` (Task 14).

- [ ] **Step 1: Create `components/admin/ReviewsManager.tsx`**

```tsx
import React, { useEffect, useState } from 'react';
import type { ReviewRow, LocalizedText } from '../../types';
import {
  listReviewRows, createReview, updateReview, deleteReview, type ReviewInput,
} from '../../lib/content/reviews';
import LocalizedTextInput from './LocalizedTextInput';

const EMPTY: ReviewInput = {
  author: '', rating: 5, text: { en: '' } as LocalizedText,
  location: null, date: null, sort_order: 0,
};

const ReviewsManager: React.FC = () => {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [editing, setEditing] = useState<ReviewInput & { id?: string }>({ ...EMPTY });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = () => listReviewRows().then(setRows).catch((e) => setError(e.message));
  useEffect(() => { reload(); }, []);
  const reset = () => setEditing({ ...EMPTY });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { id, ...input } = editing;
      if (id) await updateReview(id, input);
      else await createReview(input);
      reset();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await deleteReview(id);
    await reload();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-4 bg-gray-900 p-4 rounded-xl">
        <h2 className="font-bold">{editing.id ? 'Edit review' : 'Add review'}</h2>
        <input required placeholder="Author" value={editing.author}
          onChange={(e) => setEditing({ ...editing, author: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <label className="block text-sm">Rating
          <select value={editing.rating}
            onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg bg-gray-800">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <LocalizedTextInput label="Review text" multiline value={editing.text}
          onChange={(text) => setEditing({ ...editing, text })} />
        <input placeholder="Location (optional)" value={editing.location ?? ''}
          onChange={(e) => setEditing({ ...editing, location: e.target.value || null })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <label className="block text-sm">Date (optional)
          <input type="date" value={editing.date ?? ''}
            onChange={(e) => setEditing({ ...editing, date: e.target.value || null })}
            className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        </label>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-brand-purple font-bold disabled:opacity-50">
            {editing.id ? 'Update' : 'Add'}
          </button>
          {editing.id && <button type="button" onClick={reset} className="px-4 py-2 rounded-lg bg-gray-700">Cancel</button>}
        </div>
      </form>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between bg-gray-900 px-4 py-3 rounded-lg">
            <span>{r.author} — {'★'.repeat(r.rating)}</span>
            <span className="flex gap-3 text-sm">
              <button onClick={() => setEditing({ ...r })} className="text-blue-400">Edit</button>
              <button onClick={() => remove(r.id)} className="text-red-400">Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewsManager;
```

- [ ] **Step 2: Render in `AdminDashboard.tsx`**

Replace the reviews placeholder with `{tab === 'reviews' && <ReviewsManager />}` and add the import.

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/admin/ReviewsManager.tsx pages/admin/AdminDashboard.tsx
git commit -m "feat: add reviews admin manager"
```

---

## Task 17: Seed script (migrate current content into Supabase)

**Files:**
- Create: `scripts/seed-supabase.mjs`

**Interfaces:**
- Consumes: Supabase project (service role key provided via env at run time, **not** committed).
- Produces: rows in `projects`, `certifications` matching current site content. (Reviews array is currently empty — nothing to seed.)

- [ ] **Step 1: Create `scripts/seed-supabase.mjs`**

```js
// One-time seed of current portfolio content into Supabase.
// Usage (do NOT commit the key):
//   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/seed-supabase.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.');
  process.exit(1);
}
const supabase = createClient(url, key);

const projects = [
  { slug: 'souvlaki', title: 'Authentic Greek Restaurant', category: 'Web',
    description: { en: 'A modern site for an authentic Greek restaurant.' },
    image_url: '/assets/souvlaki.png', tech: ['Next.js', 'Tailwind CSS', 'Vercel'],
    link: 'https://souvlaki-kfaryasif.vercel.app/', github: 'https://github.com/ward3107/Souvlaki',
    screenshots: [], sort_order: 1 },
  { slug: 'seatai', title: 'SeatAi', category: 'AI',
    description: { en: 'An AI-powered seating application.' },
    image_url: '/assets/seatai.png', tech: ['React', 'Three.js', 'Stripe'],
    link: 'https://seatai1-web.vercel.app/', github: 'https://github.com/ward3107/seatai1',
    screenshots: [], sort_order: 2 },
  { slug: 'law-office', title: 'Law Office Template', category: 'Web',
    description: { en: 'A professional template for a law office.' },
    image_url: '/assets/law-office.png', tech: ['React', 'Vite', 'Tailwind CSS'],
    link: 'https://lawofice.netlify.app/', github: null, screenshots: [], sort_order: 3 },
  { slug: 'shokha', title: 'Shokha Barbershop', category: 'Web',
    description: { en: 'A booking-ready site for a barbershop.' },
    image_url: '/assets/barbershop.png', tech: ['React', 'Node.js', 'MongoDB'],
    link: 'https://shokha1.netlify.app/', github: null, screenshots: [], sort_order: 4 },
  { slug: 'vocaband', title: 'Vocaband', category: 'Web',
    description: { en: 'A site for the Vocaband project.' },
    image_url: '/assets/vocaband.png', tech: ['TypeScript', 'React', 'Vite'],
    link: 'https://www.vocaband.com/', github: 'https://github.com/ward3107/Vocaband',
    screenshots: [], sort_order: 5 },
  { slug: 'christmas-sale', title: 'Christmas Sale Landing', category: 'Web',
    description: { en: 'A festive sale landing page.' },
    image_url: '/assets/christmas-sale.png', tech: ['TypeScript', 'React', 'Netlify'],
    link: 'https://salewebsite.netlify.app/', github: 'https://github.com/ward3107/christmas-sale-landing',
    screenshots: [], sort_order: 6 },
];

const certifications = [
  { slug: 'ai-performance-ads-1', title: { en: 'AI-Powered Performance Ads Certification' },
    issuer: 'Google Skillshop', issue_date: '2026-07-16', expiry_date: '2027-07-16',
    credential_url: 'https://www.credential.net/8fe73bad-d0b7-4a10-aef1-efca931a3386', image_url: null, sort_order: 1 },
  { slug: 'ai-performance-ads-2', title: { en: 'AI-Powered Performance Ads Certification' },
    issuer: 'Google Skillshop', issue_date: '2026-07-16', expiry_date: '2027-07-16',
    credential_url: 'https://www.credential.net/6185076b-3c05-4916-abfd-3ae205c92cdb', image_url: null, sort_order: 2 },
  { slug: 'google-ads-search', title: { en: 'Google Ads Search Professional Certification (2026)' },
    issuer: 'Google Skillshop', issue_date: '2026-07-16', expiry_date: '2027-07-16',
    credential_url: 'https://www.credential.net/327a9f94-7605-44fe-8237-f9ae705f7ec8', image_url: null, sort_order: 3 },
  { slug: 'ai-shopping-ads', title: { en: 'AI-Powered Shopping Ads Certification' },
    issuer: 'Google Skillshop', issue_date: '2026-07-17', expiry_date: '2027-07-17',
    credential_url: 'https://www.credential.net/df4ab345-1a92-4f1d-9a32-de0ba8032d5a', image_url: null, sort_order: 4 },
];

const { error: pErr } = await supabase.from('projects').upsert(projects, { onConflict: 'slug' });
if (pErr) { console.error('projects:', pErr.message); process.exit(1); }
const { error: cErr } = await supabase.from('certifications').upsert(certifications, { onConflict: 'slug' });
if (cErr) { console.error('certifications:', cErr.message); process.exit(1); }
console.log(`Seeded ${projects.length} projects and ${certifications.length} certifications.`);
```

> The English descriptions above are plain-text stand-ins for the current i18n keys (`project_1_desc`…). After seeding, the owner can paste the real English/Hebrew/Arabic text through the admin UI.

- [ ] **Step 2: Run the seed once (with the provided service key, never committed)**

Run:
```bash
SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/seed-supabase.mjs
```
Expected: "Seeded 6 projects and 4 certifications."

- [ ] **Step 3: Commit the script only**

```bash
git add scripts/seed-supabase.mjs
git commit -m "feat: add one-time supabase seed script"
```

---

## Task 18: Vercel SPA config + end-to-end verification

**Files:**
- Create: `vercel.json`

**Interfaces:**
- Consumes: everything above. Final integration.

- [ ] **Step 1: Create `vercel.json`** (SPA rewrite so `/admin` resolves on refresh)

```json
{
  "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: Add env vars in Vercel**

In the Vercel project settings → Environment Variables, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the anon key only). Redeploy.

- [ ] **Step 3: Manual E2E checklist (against the deployed site or `npm run dev` with `.env.local` set)**

- [ ] Visit `/admin` → redirected to `/admin/login`.
- [ ] Log in with the owner account → dashboard loads.
- [ ] Projects tab: add a project (fill slug/title, paste a GitHub URL, click **Auto-fill**, upload an image) → it appears in the list.
- [ ] Open the public site (`/` and `/projects`) → the new project shows.
- [ ] Edit then delete the test project → list and public site update.
- [ ] Certificates tab: add/edit/delete one → verify on the About/Certifications section.
- [ ] Reviews tab: add one → verify the Reviews section now renders (it hides when empty).
- [ ] Switch site language he/ar → localized fields show, English falls back where translation is empty.
- [ ] Sign out → `/admin` redirects to login again.

- [ ] **Step 4: Retire Netlify config (optional, after Vercel verified)**

If Vercel is confirmed as the sole host, remove `netlify.toml`:
```bash
git rm netlify.toml
```

- [ ] **Step 5: Commit**

```bash
git add vercel.json
git commit -m "feat: add vercel SPA rewrite for client-side admin routes"
```

---

## Self-Review Notes (author checklist — completed)

- **Spec coverage:** projects/certs/reviews/images CRUD (Tasks 8–16), auth single-owner (Task 12), public read + fallback (Tasks 10–11), GitHub auto-fill (Tasks 7, 14), Storage images (Tasks 9, 14–15), RLS + schema (Task 2), migration/seed (Task 17), Vercel deploy (Task 18), trilingual `{en,he,ar}` with en fallback (Tasks 4–6, `LocalizedTextInput`). ✅
- **Type consistency:** `ProjectInput`/`CertificationInput`/`ReviewInput` defined in Task 8 are the exact shapes consumed in Tasks 14–16; `LocalizedText`/`*Row` from Task 4 used throughout; hook return shapes `{ projects, loading }` etc. match Task 11 usage. ✅
- **Testing:** TDD unit tests on pure logic (localized, mappers, github, projects data-access); UI verified via the manual E2E checklist (no RTL suite, to keep scope focused — noted intentionally). ✅
- **Placeholders:** the only "coming soon" strings are in Task 13's dashboard and are explicitly replaced in Tasks 14–16. ✅
