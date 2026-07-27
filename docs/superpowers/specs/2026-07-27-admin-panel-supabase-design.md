# Admin Panel for Waseem Portfolio — Design Spec

**Date:** 2026-07-27
**Status:** Approved (design), pending spec review
**Author:** Waseem + Claude (brainstorming session)

## Goal

Give the site owner a password-protected admin area to manage portfolio content
— **projects, certificates, reviews, and images** — from anywhere (phone or any
computer), **without editing code**. Changes appear on the live site within
seconds (auto-publish), with **no rebuild** and **no per-request cold start**.

## Context

- Existing site: React 18 + Vite + TypeScript + Tailwind, single-page app with
  React Router. Currently a **static site**.
- Content today lives in code: `data/projects.ts`, `data/certifications.ts`,
  `data/reviews.ts`; images in `public/assets/`.
- Site is **trilingual**: English (`en`), Hebrew (`he`), Arabic (`ar`)
  (`translations/*.ts`, `contexts/LanguageContext.tsx`). Project descriptions
  currently use i18n translation keys (e.g. `t('project_1_desc')`).
- **Hosting decision:** deploy on **Vercel** (migrating away from Netlify;
  `netlify.toml` to be replaced with Vercel config).
- Contact form uses Web3Forms; optional Gemini AI features exist. Out of scope.

## Architecture

The public site stays static and fast. Instead of importing content from
hardcoded `.ts` files, it fetches from **Supabase** at page load. A new
protected `/admin` route provides the editing UI.

```
┌─────────────┐        reads (public, anon key)      ┌──────────────┐
│ Public site │ ───────────────────────────────────▶ │              │
│ (Vercel)    │                                       │   Supabase   │
├─────────────┤        writes (auth required)         │  Postgres DB │
│  /admin     │ ───────────────────────────────────▶ │  + Auth      │
│ (owner only)│        image uploads                  │  + Storage   │
└─────────────┘                                       └──────────────┘
```

**Why Supabase:** all-in-one Postgres DB + Auth + Storage, free tier with **no
credit card**, no per-request cold start (browser talks to an always-on API).
The only free-tier caveat — projects pause after 7 full days of *zero* traffic —
is a non-issue for a live portfolio; an optional free keep-alive ping can be
added if ever needed.

### Components / units (each independently testable)

1. **`lib/supabaseClient.ts`** — creates and exports the Supabase browser client
   from `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Single source of truth
   for the connection.
2. **Data-access layer** (`lib/content/`) — one small module per content type
   (`projects.ts`, `certifications.ts`, `reviews.ts`) exposing typed
   `list / create / update / remove` functions plus image-upload helpers. All
   Supabase queries live here; UI never calls Supabase directly.
3. **Public read hooks** (`hooks/useProjects.ts`, etc.) — fetch content for the
   public site, with the existing hardcoded arrays kept as an offline fallback
   until first successful fetch.
4. **Auth** (`contexts/AdminAuthContext.tsx` + `components/admin/RequireAuth`)
   — wraps Supabase Auth; guards the `/admin` routes.
5. **Admin UI** (`pages/admin/` + `components/admin/`) — login screen and a
   dashboard with tabs: **Projects · Certificates · Reviews · Images**. Each tab
   = list (add/edit/delete/reorder) + form.
6. **GitHub auto-fill helper** (`lib/github.ts`) — given a repo URL, fetches
   `https://api.github.com/repos/{owner}/{repo}` (public, unauthenticated) to
   pre-fill project name, description, and language tags.

## Data model (Supabase / Postgres)

Multilingual text is stored as a JSON map keyed by language, e.g.
`{"en": "...", "he": "...", "ar": "..."}`. **English is required; Hebrew and
Arabic are optional** and fall back to English when missing.

**`projects`**
| column | type | notes |
|---|---|---|
| id | uuid (pk) | default `gen_random_uuid()` |
| slug | text unique | e.g. `souvlaki` |
| title | text | not translated (proper noun) |
| category | text | `Web` \| `AI` \| `Mobile` |
| description | jsonb | `{en, he, ar}` |
| image_url | text | Supabase Storage public URL |
| tech | text[] | tech tags |
| link | text null | live demo URL |
| github | text null | repo URL |
| screenshots | text[] | extra gallery URLs |
| sort_order | int | manual ordering |
| created_at | timestamptz | default now() |

**`certifications`**
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| slug | text unique | |
| title | jsonb | `{en, he, ar}` |
| issuer | text | |
| issue_date | date | |
| expiry_date | date null | |
| credential_url | text | |
| image_url | text null | uploaded certificate image/PDF |
| sort_order | int | |
| created_at | timestamptz | |

**`reviews`**
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| author | text | |
| rating | int | 1–5 (check constraint) |
| text | jsonb | `{en, he, ar}` |
| location | text null | |
| date | date null | |
| sort_order | int | |
| created_at | timestamptz | |

**Storage:** one public bucket `assets`. Uploads return a public URL saved to
the relevant `*_url` column. Path convention: `projects/<slug>/...`,
`certifications/<slug>/...`.

### Security (Row Level Security)

RLS enabled on all tables and the storage bucket:
- **SELECT (read):** allowed for everyone (`anon`) — the public site.
- **INSERT / UPDATE / DELETE (write) + Storage upload:** allowed only for
  `authenticated` users — i.e. the logged-in owner.

**Auth:** single admin account (the owner), email + password via Supabase Auth.
No public sign-up (disabled). The account is created once by the owner.

## Data flow

1. **Public visit:** page mounts → read hook calls data-access `list()` →
   Supabase returns rows → components render (localized via current language,
   falling back to `en`). Hardcoded arrays used only if the fetch hasn't
   resolved / fails.
2. **Admin edit:** owner logs in → edits in a form → data-access
   `create/update/remove()` writes to Supabase → next public read shows it. No
   deploy needed.
3. **Image upload:** admin selects a file → uploaded to Storage `assets` bucket
   → public URL returned → saved on the row.
4. **GitHub auto-fill:** owner pastes repo URL in the project form → clicks
   auto-fill → `lib/github.ts` fetches public repo metadata → form fields
   pre-filled (still editable).

## Migration / seeding

A one-time seed script (or SQL insert) loads the current
`projects`/`certifications`/`reviews` (and their existing translations, pulled
from `translations/*.ts` where available) into Supabase so the panel starts
pre-populated and the live site looks unchanged after cutover.

## Error handling

- **Read failures:** fall back to the bundled hardcoded arrays so the public
  site never shows an empty portfolio.
- **Write failures:** admin forms show an inline error and keep the user's input
  (no data loss); the action can be retried.
- **Auth expiry:** protected routes redirect to the login screen.
- **Image upload failures:** surfaced inline; the row can be saved without an
  image and the image added later.

## Testing

- **Data-access layer:** unit tests for `list/create/update/remove` and the
  multilingual fallback logic (mocked Supabase client).
- **GitHub helper:** unit test parsing owner/repo from various URL shapes and
  mapping the API response to form fields.
- **Auth guard:** test that unauthenticated access to `/admin` redirects to
  login.
- **Manual E2E checklist:** log in → add/edit/delete one item of each type →
  upload an image → confirm it appears on the public site.

## Environment variables (add to `.env.example` and Vercel)

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Deployment (Vercel)

The site is **already deployed on Vercel**. Remaining work:
- Ensure `vercel.json` has an SPA rewrite so client-side routes incl. `/admin`
  resolve on refresh/direct-load.
- Add the two Supabase env vars to the existing Vercel project.
- The **Supabase project will be provided by the owner** (URL + anon key);
  Claude sets up tables, RLS, storage bucket, and the single admin account.
- Retire `netlify.toml` once verified redundant.

## Out of scope (v1)

- Browsing/importing all GitHub repos via GitHub auth (v1 is paste-URL
  auto-fill only).
- Managing timeline, services, FAQ, tech stack, or translation strings.
- Multi-user roles / permissions (single owner only).
- Rich text / markdown editing (plain text fields).

## Open decisions — resolved

- **DB/backend:** Supabase. ✅
- **Hosting:** Vercel. ✅
- **Languages:** store `en` (required) + `he` + `ar` (optional) per text field. ✅
- **GitHub:** paste-URL auto-fill (public API). ✅
- **Auth:** single owner, email + password, no public sign-up. ✅
