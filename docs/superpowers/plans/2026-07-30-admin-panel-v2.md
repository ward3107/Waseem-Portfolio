# Admin Panel v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current utilitarian `/admin` panel with a Notion/Linear-style workspace covering an Overview dashboard, richer editors, drag-reorder, an image gallery, a media library, and a site-settings page.

**Architecture:** Nested React Router routes under `/admin/*` mounted inside a new `AdminShell` (sidebar + topbar). New primitives (`Toast`, `ConfirmDialog`, `Skeleton`, `ChipInput`, `MarkdownEditor`, `DragList`, `ImageGallery`) live in `components/admin/primitives/`. Screen components in `components/admin/pages/`. Data layer extends with `lib/content/settings.ts` + `lib/content/media.ts`. New `site_settings` and `updated_at` columns in Supabase.

**Tech Stack:** existing React 18 + Vite + TS + Tailwind + Supabase, plus `@dnd-kit/core`, `@dnd-kit/sortable`, `sonner`, `react-markdown`, `remark-gfm` — all admin-only.

## Global Constraints

- No changes to the public site's rendered pages beyond what a new `useSiteSettings()` hook enables; the public bundle must not grow.
- All admin routes live under `/admin/*` and continue to render inside the admin-only shell (no site nav bleed).
- Owner-only writes (existing RLS). Any new table gets the same `owner write` / `public read` split.
- Sidebar on `md+`, bottom nav under `md`. All actions reachable with keyboard.
- Toast for every write result. Never a browser `alert()`/`confirm()` in admin code.
- Follow existing file/import conventions (no path aliases; functional components; Tailwind utilities).
- Commit at each task's end with Conventional Commits.
- Working dir: the site root that contains `App.tsx` and `package.json`.

---

## File structure summary

**New** — `components/admin/layout/{Sidebar,Topbar,MobileNav,AdminShell}.tsx`, `components/admin/primitives/{Toast,ConfirmDialog,Skeleton,ChipInput,MarkdownEditor,DragList,ImageGallery}.tsx`, `components/admin/pages/{Overview,ProjectsList,ProjectEditor,CertsList,CertEditor,ReviewsList,ReviewEditor,Media,Settings}.tsx`, `components/admin/preview/ProjectPreviewCard.tsx`, `lib/content/{settings,media}.ts`, `hooks/useSiteSettings.ts`, `supabase/schema-v2.sql`.

**Modified** — `App.tsx` (nested `/admin/*` routes), `pages/admin/AdminDashboard.tsx` (becomes route host), `components/admin/RequireAuth.tsx` (unchanged interface), `types.ts` (settings types + updated_at), `package.json`.

**Removed** — `components/admin/{AdminLayout,ProjectsManager,CertificationsManager,ReviewsManager,ImageUpload,LocalizedTextInput}.tsx` (replaced by the new pages/primitives).

---

## Task 1 — Install deps + wire Toaster + Skeleton primitive

**Files:**
- Modify: `package.json`
- Create: `components/admin/primitives/Skeleton.tsx`
- Modify: `pages/admin/AdminDashboard.tsx` (mount `<Toaster />` from `sonner`)

**Interfaces:**
- Produces: `Skeleton` component, `sonner`'s `toast` global, dnd-kit + react-markdown available for later tasks.

- [ ] Install: `npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities sonner react-markdown remark-gfm`
- [ ] Create `Skeleton` — a `<div>` with `animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded` and pass-through className.
- [ ] Mount `<Toaster position="bottom-right" richColors closeButton />` inside `AdminDashboard` (temporarily; moves into `AdminShell` in Task 2).
- [ ] Typecheck + commit `chore(admin): add dnd-kit, sonner, react-markdown; add Skeleton`.

---

## Task 2 — Sidebar shell + Topbar + MobileNav + AdminShell + route restructure

**Files:**
- Create: `components/admin/layout/{Sidebar,Topbar,MobileNav,AdminShell}.tsx`
- Modify: `App.tsx` — nest admin routes under `/admin/*`
- Modify: `pages/admin/AdminDashboard.tsx` — becomes the route host (`<AdminShell><Outlet/></AdminShell>`)

**Interfaces:**
- Consumes: `RequireAuth` (unchanged), `useAdminAuth` (existing).
- Produces: `<AdminShell>` renders sidebar/topbar/main and slots `<Outlet />`; `Topbar` accepts `title` + `actions` props sourced from a `useAdminPage()` context or per-page prop.

**Design:**
- Sidebar 240 px on `md+`, six nav links with Lucide icons: LayoutDashboard, FolderOpen, GraduationCap, MessageSquareText, ImageIcon, Settings2. Active link uses zinc-100 dark:zinc-800 background + brand-purple left accent.
- Mobile: sidebar hidden, replaced by a fixed bottom nav with the same 6 icons.
- Topbar: page title (left), actions slot (right — e.g. "+ Add").

- [ ] Build `Sidebar` with links `/admin`, `/admin/projects`, `/admin/certifications`, `/admin/reviews`, `/admin/media`, `/admin/settings` (use `NavLink` from react-router for active styling). Footer: user email, "View site" link, "Sign out" button.
- [ ] Build `Topbar` accepting `{ title, actions }` as children/props.
- [ ] Build `MobileNav` mirroring the six links as a fixed bottom bar (`md:hidden`).
- [ ] Build `AdminShell` composing all three around `<Outlet />`; move the `<Toaster />` here.
- [ ] Update `App.tsx`:
  ```tsx
  <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>}>
    <Route index element={<Overview />} />
    <Route path="projects" element={<ProjectsList />} />
    <Route path="projects/new" element={<ProjectEditor />} />
    <Route path="projects/:id" element={<ProjectEditor />} />
    …same for certifications, reviews…
    <Route path="media" element={<Media />} />
    <Route path="settings" element={<Settings />} />
  </Route>
  ```
- [ ] `pages/admin/AdminDashboard.tsx` renders `<AdminShell><Outlet /></AdminShell>` (Overview / lists / editors get rendered via nested routes).
- [ ] Placeholder screen components in `components/admin/pages/*` returning a `<Skeleton />` so routes compile.
- [ ] Typecheck + local browser check (`/admin`, `/admin/projects`, `/admin/settings` all render the shell without errors).
- [ ] Commit `feat(admin): sidebar shell, topbar, mobile nav, nested routes`.

---

## Task 3 — Toast + ConfirmDialog primitives + a `useConfirm()` hook

**Files:**
- Create: `components/admin/primitives/ConfirmDialog.tsx`
- Create: `hooks/useConfirm.ts`

**Interfaces:**
- Produces: `useConfirm()` returns `(opts: { title, body, danger?: boolean }) => Promise<boolean>` — a promise-based imperative API so any call site can `if (!(await confirm({...}))) return;`.
- Toast is used from `sonner` directly: `toast.success('Saved')` / `toast.error(msg)` / `toast.promise(p, {...})`. Adds an `undo` helper in `lib/adminToast.ts` for the "Undo" pattern.

- [ ] Create `ConfirmDialog` using a portal + focus-trap; two buttons (cancel / confirm), esc closes.
- [ ] Create `useConfirm()` — a context provider (`ConfirmProvider`) mounted in `AdminShell`, plus a hook that resolves a pending promise on button click.
- [ ] Wrap the `Outlet` in `AdminShell` with `<ConfirmProvider>` so any admin page can call the hook.
- [ ] Add `lib/adminToast.ts` with `toastSaved()`, `toastDeleted(onUndo)`, `toastError(err)` helpers so message copy is consistent.
- [ ] Commit `feat(admin): confirm dialog primitive + toast helpers`.

---

## Task 4 — Extend content data-access for lists sorted + updated_at + reorder

**Files:**
- Create: `supabase/schema-v2.sql`
- Modify: `types.ts` (`updated_at` on all rows; add `SiteSettings` types)
- Modify: `lib/content/{projects,certifications,reviews}.ts` (add `reorderRows(orderedIds: string[])`)

**Interfaces:**
- Produces: `updated_at: string` on every row model; `reorderProjects(ids: string[])`, `reorderCerts(ids: string[])`, `reorderReviews(ids: string[])`.
- SQL adds `updated_at timestamptz not null default now()`, triggers to auto-update on modify, and creates the `site_settings` table.

- [ ] Write `supabase/schema-v2.sql`:
  ```sql
  alter table public.projects       add column if not exists updated_at timestamptz not null default now();
  alter table public.certifications add column if not exists updated_at timestamptz not null default now();
  alter table public.reviews        add column if not exists updated_at timestamptz not null default now();

  create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
  begin new.updated_at = now(); return new; end $$;

  drop trigger if exists projects_touch on public.projects;
  create trigger projects_touch before update on public.projects
    for each row execute function public.touch_updated_at();
  -- same for certifications, reviews

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
  create policy "public read settings" on public.site_settings for select using (true);
  create policy "owner write settings" on public.site_settings for all to authenticated
    using (public.is_owner()) with check (public.is_owner());
  insert into public.site_settings (id) values (true) on conflict do nothing;
  create trigger settings_touch before update on public.site_settings
    for each row execute function public.touch_updated_at();
  ```
- [ ] Add `updated_at: string` to `ProjectRow`, `CertificationRow`, `ReviewRow`, and a new `SiteSettingsRow` in `types.ts`.
- [ ] Add `reorderRows` to each data-access module: `supabase.from(table).upsert(ids.map((id, i) => ({ id, sort_order: i })))`.
- [ ] Commit `feat(admin): schema v2 (updated_at, triggers, site_settings) + reorder helpers`.

---

## Task 5 — Overview page (Task 6 needs it wired)

**Files:** `components/admin/pages/Overview.tsx`

**Interfaces:**
- Consumes: `listProjectRows`, `listCertRows`, `listReviewRows`, `useNavigate`.

- [ ] Fetch counts in parallel via `Promise.all`. Show four zinc-outlined cards.
- [ ] Fetch the top 5 rows ordered by `updated_at desc` from each table, merge, sort, render as an activity list (`• Edited "X"   2h ago`) using a small `relativeTime()` helper.
- [ ] Two prominent buttons: **+ Add project**, **+ Add certificate**. Plus a "Preview site ↗" link that opens `/` in a new tab.
- [ ] Skeleton while loading. Toast on fetch error.
- [ ] Commit `feat(admin): overview dashboard with counts + activity`.

---

## Task 6 — Projects list with drag-reorder, search, category filter

**Files:**
- Create: `components/admin/primitives/DragList.tsx` (dnd-kit `SortableContext` wrapper; children get a `dragHandleProps` render prop)
- Create: `components/admin/pages/ProjectsList.tsx`

**Interfaces:**
- Produces: `<DragList items={ids} onReorder={(newIds) => …} renderItem={(id, dragHandleProps) => …} />`.

- [ ] Build `DragList` on `@dnd-kit/core` + `@dnd-kit/sortable` + `useSortable`. Keyboard-accessible (arrow keys reorder), touch-friendly, restrict to Y-axis.
- [ ] `ProjectsList`: fetch rows, render a table (thumbnail 40×40 · title · category chip · link badge · updated · edit / delete).
- [ ] Search input (client-side filter on title). Category filter chips (All/Web/AI/Mobile) — filter is applied over the sorted array; drag is disabled when a filter is active (avoids partial-order surprises; shows a small hint).
- [ ] Header actions: "+ Add project" → `navigate('/admin/projects/new')`.
- [ ] Delete uses `useConfirm()` + `toastDeleted(undo)` (undo re-inserts within 5 s window).
- [ ] Optimistic reorder: local state updates instantly; `reorderProjects()` in background; revert + toast on error.
- [ ] Commit `feat(admin): projects list with drag-reorder, search, filter`.

---

## Task 7 — Rich primitives: ChipInput + MarkdownEditor + ImageGallery

**Files:**
- Create: `components/admin/primitives/ChipInput.tsx`
- Create: `components/admin/primitives/MarkdownEditor.tsx`
- Create: `components/admin/primitives/ImageGallery.tsx`

**Interfaces:**
- `ChipInput`: `{ value: string[]; onChange: (next: string[]) => void; placeholder?: string }` — Enter/Comma commits a chip, Backspace on empty deletes last, click × on chip removes.
- `MarkdownEditor`: `{ value: string; onChange: (v: string) => void; label?: string }` — tabs "Write" and "Preview". Preview uses `react-markdown` + `remark-gfm`. Tabs styled with underline.
- `ImageGallery`: `{ value: string[]; folder: string; onChange: (urls: string[]) => void }` — grid + drop zone. First image = Cover badge. Drag to reorder (reuse `DragList`), × on hover removes, dropzone accepts multiple files.

- [ ] Build all three; the Image gallery uses the existing `uploadImage()` helper (Task 9 in v1 plan, i.e. `lib/content/storage.ts`).
- [ ] Commit `feat(admin): chip input, markdown editor, image gallery primitives`.

---

## Task 8 — Project editor with split-pane live preview

**Files:**
- Create: `components/admin/pages/ProjectEditor.tsx`
- Create: `components/admin/preview/ProjectPreviewCard.tsx` (renders the exact `FeaturedProjects` card look given a `Project` model)

**Interfaces:**
- Consumes: primitives from Task 7, `useConfirm`, `toastSaved`/`toastError`, `create/updateProject`, `fetchRepoMeta`.

- [ ] Route reads `:id`; if present, `select * from projects where id = :id`. Otherwise starts blank.
- [ ] Two-column layout on `xl+`: form left, `ProjectPreviewCard` right (sticky). Below `xl` the preview collapses to a toggle button.
- [ ] Form sections (visually grouped `<fieldset>`s):
  - Basics — slug (auto-generated from EN title on blur if empty), title, category (radio pill), link, github (+ Auto-fill button using `fetchRepoMeta`).
  - Description — three tabs (EN/HE/AR), each a `MarkdownEditor` bound to `description.{lang}`.
  - Tech — `ChipInput` for `tech`.
  - Images — `ImageGallery` bound to `screenshots` (first image doubles as `image_url`).
- [ ] Save button sticky top-right; keyboard `Cmd/Ctrl+S`. `beforeunload` warning when dirty.
- [ ] After save: `toastSaved()`, stay on page (or navigate to `/admin/projects/:newId` if it was a create).
- [ ] Delete button (only on edit) uses confirm + undo toast.
- [ ] Commit `feat(admin): project editor with live preview, markdown, chips, gallery`.

---

## Task 9 — Certs + Reviews list + editor (mirror pattern)

**Files:**
- Create: `components/admin/pages/{CertsList,CertEditor,ReviewsList,ReviewEditor}.tsx`

**Interfaces:** same shape as Projects (list + editor). CertEditor uses `MarkdownEditor` for the title-jsonb (single-line, so plain input actually), `ChipInput` not needed; the credential URL, dates, image gallery (single image for the certificate). ReviewEditor: author, star-picker (custom 1–5 with hover states), `MarkdownEditor` for `text` per language, location, date.

- [ ] Build both list pages using `DragList` + search + Add button.
- [ ] Build both editors with the same layout as Project editor (form left, small preview card right).
- [ ] Use `useConfirm` for deletes, `toastSaved`/`toastError` for feedback.
- [ ] Commit `feat(admin): certs + reviews lists and editors`.

---

## Task 10 — Media library

**Files:**
- Create: `lib/content/media.ts` — `listAssets()`, `deleteAsset(path)`, `getAssetUsage(url): { rows: { table, id, title }[] }` (queries all three content tables for the URL in `image_url` / `screenshots`).
- Create: `components/admin/pages/Media.tsx`

**Interfaces:** grid of assets with hover metadata. Copy-URL button, replace (upload w/ same path), delete (with usage warning).

- [ ] `listAssets()` uses `supabase.storage.from('assets').list('', { limit: 1000, sortBy: { column: 'updated_at', order: 'desc' } })` and recursively walks folders.
- [ ] `getAssetUsage(url)` runs three parallel selects; renders a "Used in: Souvlaki (project)" tag on the card, or "Unused" if 0 references.
- [ ] Bulk-select for delete (confirm dialog lists targets).
- [ ] Drag-and-drop-anywhere upload zone.
- [ ] Commit `feat(admin): media library with usage detection`.

---

## Task 11 — Settings page + wire public site to read it

**Files:**
- Create: `lib/content/settings.ts` — `getSettings()`, `updateSettings(patch)`
- Create: `hooks/useSiteSettings.ts` — hook that fetches + caches in localStorage
- Create: `components/admin/pages/Settings.tsx`
- Modify: `constants.ts` — export a `getContact()` helper that prefers settings, falls back to the current hardcoded values
- Modify: `components/Hero/index.tsx`, `components/Footer.tsx`, `components/Contact.tsx` — read from `useSiteSettings()` where currently reading from `constants.CONTACT` / translation keys for the hero copy

**Interfaces:** admin sees one form with the sections listed in the spec (Contact, Social, Hero — 3 langs, SEO).

- [ ] Build the data-access + hook (following the pattern of `useProjects` — fallback to hardcoded defaults if Supabase unreachable).
- [ ] Build the Settings page: grouped fieldsets, same MarkdownEditor tabs for the hero fields.
- [ ] Wire the three public consumers to prefer settings, fall back to constants/translations, so nothing breaks if the settings row is empty.
- [ ] Danger zone: `Export as JSON` (downloads a `.json` snapshot of projects+certs+reviews+settings). Cache clear = `localStorage.clear()`.
- [ ] Commit `feat(admin): site settings page + public consumers wired to the new source`.

---

## Task 12 — Retire the old admin files + final polish + build/test/push

**Files:**
- Delete: `components/admin/{AdminLayout,ProjectsManager,CertificationsManager,ReviewsManager,ImageUpload,LocalizedTextInput}.tsx`
- Verify: nothing imports them (`grep`)

- [ ] Delete the six replaced files; run `npm run typecheck && npm test && npm run build`.
- [ ] Manual E2E checklist against local dev server, then commit `chore(admin): remove v1 admin components`.
- [ ] Final push.

---

## Self-review notes (author checklist — completed)

- Every section from the spec has a task (Overview → 5; drag-reorder + search → 6; markdown/chips/gallery → 7; live preview → 8; certs/reviews mirror → 9; media → 10; settings → 11).
- The three "open decisions" in the spec are resolved per owner sign-off: mobile bottom nav (Task 2), simple markdown editor with Write/Preview tabs (Task 7 — no `@uiw` dep), command palette skipped.
- Old files are only deleted in the final task, after everything new is proven working (Task 12).
- The public site's bundle stays lean: every new admin dep is imported only under `components/admin/**`; existing lazy admin route means visitors never fetch this code.
