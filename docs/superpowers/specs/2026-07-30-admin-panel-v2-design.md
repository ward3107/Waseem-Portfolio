# Admin Panel v2 — Design Spec

**Date:** 2026-07-30
**Status:** Proposed, pending owner approval
**Scope:** Replace the current utilitarian `/admin` panel with a Notion/Linear-style workspace.

## Goal

Turn the current admin from a "developer-tool-with-forms" into an interface you'd be happy using every day: obvious hierarchy, delightful feedback, and enough features that you never need to open the code to change site content again.

---

## 1 · Shape of the new admin

### Layout — sidebar workspace

```
┌────────────────┬──────────────────────────────────────────────┐
│  Waseem Admin  │  Page Title                       [ Actions ]│
│  wasya92@…     │  ────────────────────────────────────────────│
│                │                                              │
│  🏠 Overview   │                                              │
│  📁 Projects   │           Main content area                  │
│  🎓 Certs      │           (dashboard / list / editor)        │
│  ⭐ Reviews    │                                              │
│  🖼  Media     │                                              │
│  ⚙  Settings   │                                              │
│                │                                              │
│  ──────────    │                                              │
│  🔗 View site  │                                              │
│  🚪 Sign out   │                                              │
└────────────────┴──────────────────────────────────────────────┘
```

- **240 px sidebar** collapses to a bottom nav on mobile (`< md`), so the layout is fully responsive.
- **Neutral zinc palette** with a single accent color (your brand purple) — the way Notion/Linear look. No gradients, no glow effects, no dark-purple background from the current admin.
- **System-friendly**: matches the site's light/dark theme toggle (you'll add one to the sidebar).

### Six sections in the sidebar

| Section | What it does |
|---|---|
| 🏠 **Overview** | Landing page after login. Counts, recent activity, quick-add buttons, publish status. |
| 📁 **Projects** | List + drag-reorder + editor. Rich form, image gallery per project, markdown description, tech chips. |
| 🎓 **Certificates** | Same pattern as Projects. Image upload for the certificate PDF/image. |
| ⭐ **Reviews** | Same pattern. Star picker, quote editor. |
| 🖼 **Media** | Browse everything uploaded to Supabase Storage. Delete unused, copy URL, replace file. |
| ⚙ **Settings** | Contact email, WhatsApp, social URLs, hero tagline text (currently hardcoded in `constants.ts` / translations). |

---

## 2 · Overview page (the new dashboard)

**Above the fold — one screen, four cards + two action buttons:**

```
┌────────────┬────────────┬────────────┬────────────┐
│ Projects   │ Certs      │ Reviews    │ Media      │
│ 6          │ 4          │ 0          │ 12 files   │
│ +2 this mo │            │ Add first  │ 3.2 MB     │
└────────────┴────────────┴────────────┴────────────┘

┌────────────────────────────────────────────────────┐
│  Recent activity                                   │
│  • Edited "Souvlaki"                    2h ago    │
│  • Added cert "Google Ads Search"      yesterday  │
│  • Uploaded 2 images                   3 days ago │
└────────────────────────────────────────────────────┘

[+ Add project]   [+ Add certificate]   [Preview site ↗]
```

Fresh data on each visit (`select count(*) from ...` per table, plus the 5 most recent `updated_at` rows across all tables union'd).

---

## 3 · Projects screen — the biggest quality-of-life upgrade

**List view** (default when you click "Projects" in the sidebar):

- Table of projects with thumbnail · title · category · live-URL badge · edit / delete
- Drag handle on the left of each row → **drag to reorder**; order persists to `sort_order` in Supabase
- Search input top-right (filters as you type)
- Category filter chips: All · Web · AI · Mobile
- **"+ Add project"** button in the header

**Editor view** (clicking a row or "+ Add"):

- Split-pane: **form on left, live preview on right** — as you type, the preview updates showing exactly how the project card will look on the public site.
- Form sections (each visually grouped):
  - **Basics**: slug (auto-generated from title), title, category (radio pill), live URL, GitHub URL (+ "Auto-fill from GitHub" button)
  - **Description**: markdown editor per language (en/he/ar tabs)
  - **Tech stack**: chip input — type a tech, press Enter, it becomes a removable chip
  - **Images**: gallery with drag-reorder. Big drop zone for new uploads. First image = card thumbnail (indicated with a "Cover" badge). Delete individual images from the gallery.
- **Save** button (top-right, sticky) with keyboard shortcut Cmd/Ctrl+S
- Unsaved-changes indicator with browser leave-warning
- Toast on success: "Project saved" (with an undo button for 5 seconds after delete)

Same pattern applied to Certificates and Reviews.

---

## 4 · Media library (new — makes storage manageable)

- Grid of every file in the Supabase `assets` bucket with thumbnails
- Metadata on hover: filename · dimensions · size · which project/cert uses it
- Actions: Copy URL · Replace file · Delete (with warning if still in use)
- Bulk-select for delete
- Drop new files anywhere on the page to upload

---

## 5 · Settings screen (new — pulls hardcoded text out of the code)

Simple form, one section per topic:

- **Contact**: email, WhatsApp number
- **Social links**: GitHub, LinkedIn, Twitter/X
- **Hero**: badge text ("Available for projects"), the three headline lines, subtitle — one input per language
- **SEO defaults**: site title override, meta description
- **Danger zone**: clear cache · export all content as JSON

Wired to a new Supabase table `site_settings` (single-row keyed on `id = true`, similar to `app_owner`). Public site reads it via a new `useSiteSettings()` hook with local-storage fallback.

---

## 6 · Feedback / interaction primitives

Replaces the current browser `confirm()` / silent errors:

- **Toasts** (bottom-right stack): success · error · loading. Auto-dismiss 4 s, error toasts stick until dismissed.
- **Confirmation modal** for destructive actions: title, body, danger/cancel buttons, focus-trapped.
- **Loading skeleton** on data screens (no more empty flash while queries run).
- **Undo** button in the success toast for 5 s after any delete.
- **Optimistic updates** on reorder (drag lands instantly, syncs to Supabase in background; reverts + toasts on failure).
- **Keyboard shortcuts**: `Cmd/Ctrl+K` opens a command palette (search across projects/certs/reviews/settings), `Cmd/Ctrl+S` saves the current form, `Esc` closes modals.

---

## 7 · What gets built / what changes

### New files

```
components/admin/
├─ layout/
│  ├─ Sidebar.tsx              (six links + user + View-site/Sign-out)
│  ├─ Topbar.tsx                (title + page actions slot)
│  ├─ MobileNav.tsx             (bottom bar for < md)
│  └─ AdminShell.tsx            (composes the three above)
├─ primitives/
│  ├─ Toast.tsx  + ToastProvider.tsx
│  ├─ ConfirmDialog.tsx
│  ├─ Skeleton.tsx
│  ├─ ChipInput.tsx             (tech-stack chip picker)
│  ├─ MarkdownEditor.tsx        (textarea + minimal toolbar + live preview)
│  ├─ DragList.tsx              (dnd-kit wrapper for reorderable lists)
│  ├─ ImageGallery.tsx          (grid + drag + drop-zone)
│  └─ CommandPalette.tsx
├─ pages/
│  ├─ Overview.tsx
│  ├─ ProjectsList.tsx + ProjectEditor.tsx
│  ├─ CertsList.tsx    + CertEditor.tsx
│  ├─ ReviewsList.tsx  + ReviewEditor.tsx
│  ├─ Media.tsx
│  └─ Settings.tsx
└─ preview/
   └─ ProjectPreviewCard.tsx    (renders the public card exactly)

lib/content/
├─ settings.ts                  (data-access for new site_settings table)
└─ media.ts                     (list / delete storage objects)

hooks/
└─ useSiteSettings.ts           (public read hook with fallback)
```

### Existing files removed / rewritten

- `components/admin/AdminLayout.tsx` → replaced by `AdminShell`
- `components/admin/ProjectsManager.tsx`, `CertificationsManager.tsx`, `ReviewsManager.tsx` → replaced by their new List + Editor pairs
- `components/admin/ImageUpload.tsx` → absorbed into `ImageGallery`
- `pages/admin/AdminDashboard.tsx` → becomes a router hosting the new pages via nested routes under `/admin/*`

### Route structure

```
/admin/login
/admin              → Overview
/admin/projects      → list
/admin/projects/new  → editor
/admin/projects/:id  → editor
/admin/certifications          + /new + /:id
/admin/reviews                 + /new + /:id
/admin/media
/admin/settings
```

### Database additions

- Add `updated_at timestamptz not null default now()` to `projects`/`certifications`/`reviews` for recent-activity feed (backfill from `created_at`).
- Add per-project `screenshots text[]` handling — already exists in schema, will be wired up in the gallery UI.
- New table `site_settings` (single-row) for the Settings screen.

### Dependencies to add

- `@dnd-kit/core` + `@dnd-kit/sortable` — the least-heavy drag-and-drop that actually works well (~15 kB gz)
- `sonner` — tiny toast library (~3 kB gz) that matches the Notion/Linear feel
- `react-markdown` + `remark-gfm` — markdown rendering for the description preview (~30 kB gz total; only loaded on admin routes so public visitors don't pay)

All admin-only imports; the public site's bundle is unaffected.

---

## 8 · Out of scope (v2)

- Multi-user accounts / roles (still single-owner)
- Version history / diff view for edits
- Scheduled publishing / drafts
- Analytics dashboard (Vercel/Plausible integrations)
- Blog post editor (blog is currently generated at build time from Markdown files — separate project)

These are natural v3 candidates if you want them later.

---

## 9 · Effort estimate

- Layout shell + sidebar + toast/dialog primitives: ~45 min
- Overview page + activity feed: ~30 min
- Projects list with drag-reorder + search + filter: ~30 min
- Projects editor with markdown + chip input + image gallery + live preview: ~60 min
- Same pattern for Certificates + Reviews (mostly reuse): ~30 min
- Media library: ~30 min
- Settings page + `site_settings` table wiring: ~30 min
- Route wiring + polish + testing pass: ~30 min

**Total: ~4.5 hours** of focused work. Shipped as one cohesive commit set at the end.

---

## 10 · Open decisions — for owner confirmation

1. **Sidebar-collapse behavior on mobile** — bottom nav (like Notion mobile) or slide-in drawer (like Linear mobile)? *Recommended: bottom nav — one thumb, no gesture.*
2. **Markdown editor**: use `@uiw/react-md-editor` (WYSIWYG-like, ~50 kB) or a simple textarea + preview toggle (~5 kB)? *Recommended: textarea + toggle — matches the minimal aesthetic and saves 45 kB.*
3. **Command palette** (Cmd/Ctrl+K): worth building? Adds ~10 kB + implementation time. *Recommended: skip in v2, add if you find yourself wanting it.*
