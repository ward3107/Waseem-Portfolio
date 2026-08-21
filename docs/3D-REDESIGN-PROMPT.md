# Prompt — Rebuild the portfolio as a 3D scroll-driven storytelling experience

> Paste everything inside the `====` block into your AI coding agent (Claude Code, Cursor, etc.)
> from the repo root. It is self-contained: it describes the existing codebase, the target
> experience, the libraries to add, a chapter-by-chapter storyboard, and the hard constraints
> that must survive the redesign.

=======================================================================================

## ROLE

You are a senior creative front-end engineer who specializes in WebGL / real-time 3D and
scroll-driven "scrollytelling" websites (think Awwwards Site of the Day). You write production
React + TypeScript, care about 60fps, accessibility, and shipping — not tech demos that only
run on your laptop.

## MISSION

Transform this existing portfolio from a conventional stacked-sections layout into a **single,
continuous, cinematic 3D scroll experience** where scrolling drives a camera through a 3D world
and each section of my content is a "chapter" of a story. It must feel highly interactive
(mouse parallax, hover, draggable/physics objects, custom cursor) and premium — but it must NOT
sacrifice the accessibility, performance, multilingual/RTL, and SEO qualities the current site
already has. This is a redesign of a real, live business site, not a throwaway.

## THE EXISTING CODEBASE (ground truth — do not break these)

- **Framework:** React 18 + TypeScript + Vite 7. Tailwind CSS 3.4 (dark mode via `class`).
- **Already installed:** `three` (0.170) + `@types/three`, `framer-motion` (11), `react-router-dom` (7),
  `@supabase/supabase-js`, `lucide-react`, `sonner`, `@dnd-kit/*`. Fonts: Inter + Space Grotesk
  (Latin), Heebo (Hebrew), Cairo (Arabic) via `@fontsource`.
- **Architecture:** feature-folder pattern. `src/features/<feature>/` (component + hook + data),
  `src/pages/` (route entries), `src/shared/` (layout, widgets, ui, three, hooks),
  `src/contexts/` (`LanguageContext`, `ThemeContext`, `AdminAuthContext`, `WidgetContext`),
  `src/lib/` (Supabase client, content helpers), `src/translations/` (`en.ts`, `he.ts`, `ar.ts`).
  Import alias `@/` → `src/`.
- **Homepage composition** (`src/pages/HomePage.tsx`), in order:
  `Hero → Services → AISection → VibeCoding → FeaturedProjects → Reviews → HomeCTA`.
- **Other routes:** `/about`, `/projects`, `/services`, `/contact`, `/accessibility`, `/privacy`,
  `+ /admin/*` (Supabase-backed CMS). These must keep working.
- **Who it's for:** Waseem — a trilingual (English / Hebrew / Arabic) web designer & developer
  serving small businesses in northern Israel. The **primary CTA is a one-tap WhatsApp deep link**
  (`+972 53 426 0632`); a "Start a project" wizard is secondary.
- **Real content to weave into the story:**
  - **Projects** (title · category · tech · live link · screenshot in `/public/assets/`):
    1. *Souvlaki* — Greek restaurant · Next.js/Tailwind/Vercel · `souvlaki.webp`
    2. *SeatAi* — AI product · React/Three.js/Stripe · `seatai.webp`
    3. *Law Office Template* — React/Vite/Tailwind · `law-office.webp`
    4. *Shokha Barbershop* — React/Node/MongoDB · `barbershop.webp`
    5. *Vocaband* — TypeScript/React/Vite · `vocaband.webp`
  - **Assets:** `/public/assets/waseem-profile.webp`, `/public/assets/waseem-profile-video.mp4`,
    certifications in `/public/certifications/`.
  - **Service areas** (for a "map" beat): Kfar Yasif, Acre, Karmiel, Nahariya, Haifa, Judeide-Maker,
    Abu Snan, Yanuh.
- **Brand tokens** (already in `tailwind.config.js`): purple `#483AA0`, purpleLight `#7965C1`,
  purpleLighter `#A78BFA`, gold `#d4af37`, cyan `#00E5FF`, blue `#3B82F6`, green `#10B981`.
  Headings use Space Grotesk. Keep this palette as the mood of the 3D world.
- **The codebase is performance- and a11y-obsessed** (rAF-throttled pointer handlers,
  IntersectionObserver-gated animations, lazy 3D chunks gated to desktop, `prefers-reduced-motion`
  respected everywhere, WCAG AA contrast enforced, full RTL). **Match that bar.**

## TARGET EXPERIENCE

A persistent full-viewport `<Canvas>` behind the content. As the visitor scrolls, a virtual
**camera travels through one continuous 3D scene** divided into chapters. Scroll position is the
timeline scrubber: it drives camera keyframes, object animations, and content reveals. Momentum
is smoothed. The DOM text sits in HTML overlays synced to the 3D world, so it stays real,
selectable, translatable, and crawlable.

### Libraries to add
- `@react-three/fiber` — React renderer for Three.js (reuse the installed `three`).
- `@react-three/drei` — `ScrollControls`, `useScroll`, `Scroll`, `Html`, `Environment`, `Float`,
  `MeshTransmissionMaterial`, `Text`, `Image`, `useTexture`, `AdaptiveDpr`, `Preload`, `Loader`.
- `@react-three/postprocessing` — Bloom, Depth of Field, Vignette, Chromatic Aberration, Noise.
- `lenis` — smooth/inertial scroll, wired to the R3F frame loop.
- (Optional, one chapter only) `@react-three/rapier` — physics for draggable/tossable objects.
- (Dev only) `leva` — live-tune camera keyframes and materials; remove or tree-shake for prod.
- Keep **Framer Motion** for all DOM/HTML overlay animation and page transitions.

### Storyboard — map my sections to chapters
Design ONE continuous journey. For each chapter define: camera move, 3D elements, scroll-linked
reveal, and the interaction. Suggested arc (refine as you see fit, keep my content):

0. **Boot / Loader** — brand "W" monogram assembling from particles while assets stream in;
   `<Loader>` progress. Resolves into Chapter 1.
1. **Hero — "The Craftsman."** Camera in a dark volumetric studio; a glass/refractive 3D "W"
   or monogram floats center (use `MeshTransmissionMaterial` + bloom). Headline, subtitle, and
   the **WhatsApp** + **Start a project** CTAs live in an `<Html>`/overlay layer. Camera does
   subtle mouse-parallax. The profile video can texture a floating "screen."
2. **Services — "What I build."** Scroll pushes the camera forward into a slowly-rotating
   constellation of floating cards / 3D glyphs (web design, AI automation, SEO). Each hovers,
   glows on raycast hover, and expands its label.
3. **AI & Automation.** A flowing particle/GPGPU field or neural graph; scroll morphs the
   particle formation and lights up data streams in cyan/purple. Pointer disturbs the field.
4. **Projects — "The Work" (the showpiece).** Camera flies along a curved path through a gallery
   where each of the 5 projects is a floating device/screen with its `webp` screenshot as a
   texture. As each enters frame it tilts to face the camera and reveals title, tech chips, and
   a "Visit live ↗" link (real anchor). Hover tilts/parallaxes the screen; click opens the live
   site. This chapter should feel like the centerpiece.
5. **Trust — Reviews & reach.** Testimonials float in as glass panels with star ratings; a
   stylized low-poly globe or map pins the northern-Israel service areas.
6. **Contact — the finale.** The world converges; particles gather toward a glowing CTA. Big
   headline + the WhatsApp CTA resolve in the DOM overlay. Camera settles. Footer (legal links,
   theme toggle) remains real DOM below the canvas.

### Interactivity requirements
- Scroll-linked camera + animation via `useScroll` offset/range; smoothed by Lenis inertia.
- Camera mouse-parallax (rAF-throttled, reuse the existing pointer pattern from `src/features/hero`).
- Raycast hover states on 3D objects (scale / emissive / glow).
- At least one chapter with **draggable or physics-tossable** objects.
- A custom cursor that reacts to interactive targets (grows/labels on hover), with a normal-cursor
  fallback.
- A slim scroll-progress / chapter indicator; anchor nav (`/#what-i-do`, `/#ai-automation`, etc.)
  must still deep-link to the right chapter (scroll the timeline to that offset).

## HARD CONSTRAINTS — MUST survive the redesign (treat as acceptance criteria)

1. **Accessibility & reduced motion.** If `prefers-reduced-motion: reduce`, **do not mount the
   WebGL journey** — render a clean, animation-light DOM version of the same content (the current
   sections are a fine fallback). All copy must live in real, semantic, focusable DOM (via `<Html>`
   overlays or a parallel content layer) — never trapped inside the canvas. Preserve ARIA, heading
   order, keyboard navigation, visible focus, skip-to-content, and the existing accessibility
   toolbar. Keep WCAG AA contrast on all text.
2. **Performance.** Lazy-load the entire 3D bundle behind `React.lazy`/dynamic import and a
   `<Suspense>` boundary; never ship it to reduced-motion or no-WebGL users. Target a steady 60fps
   on a mid laptop and a usable experience on phones. Use: instancing for repeated meshes, clamped
   DPR (`AdaptiveDpr` / `dpr={[1, 1.5]}`), compressed textures (KTX2/Basis or sized WebP), frustum
   culling, `frameloop="demand"` where possible, pause rendering when the tab/section is hidden,
   `<Preload all />`. Keep the initial (pre-canvas) HTML paint fast. Budget: Lighthouse
   Performance ≥ 85 desktop, Accessibility ≥ 95, no CLS from the canvas mount.
3. **Mobile.** Provide a lighter path on small screens / low-power devices (fewer particles, no
   heavy postprocessing, simpler camera, or the DOM fallback). Detect capability; degrade, don't
   crash. Touch must scroll normally.
4. **Trilingual + RTL.** All strings come from `src/translations/{en,he,ar}.ts` via the existing
   `LanguageContext` — add new keys there, never hardcode. Prefer HTML-overlay text (which already
   handles Hebrew/Arabic webfonts + RTL) over text baked into 3D geometry; if you must render 3D
   text, ensure the font supports the glyphs and the layout mirrors correctly for `he`/`ar`.
5. **SEO.** Keep content server-crawlable and in the DOM; preserve existing `<title>`/meta,
   `sitemap.xml`, `robots.txt`, structured data, and internal links to the SEO landing pages.
   The canvas is an enhancement layer, not the source of content.
6. **Don't break the app.** Routes, the `/admin` Supabase CMS, theme toggle, contact/WhatsApp
   flow, cookie banner, and footer legal pages must all still work. Reuse existing hooks
   (`usePrefersReducedMotion`, `useMediaQuery`, `useInView`, `useSectionNavigate`) and contexts.
7. **Graceful degradation.** No WebGL / context-lost → automatic DOM fallback, no blank screen.

## ARCHITECTURE (suggested)

- New layer `src/experience/`:
  - `Experience.tsx` — the lazy-loaded `<Canvas>` + `<ScrollControls pages={N}>` root, wraps all
    chapters and the `<Scroll html>` overlay content.
  - `chapters/` — one component per chapter (`HeroChapter`, `ServicesChapter`, `AIChapter`,
    `ProjectsChapter`, `TrustChapter`, `ContactChapter`).
  - `storyboard.ts` — config-driven camera keyframes / scroll ranges per chapter (single source of
    truth so the journey is tunable).
  - `useScrollProgress.ts`, `useQualityTier.ts` (capability detection), `useReducedExperience.ts`.
  - `postprocessing/Effects.tsx`, `materials/`, `components/` (CustomCursor, ScrollProgress, etc.).
- `HomePage.tsx` decides: reduced-motion / no-WebGL / low-power → render the existing 2D sections;
  otherwise render `<Experience />` (Suspense-wrapped) with the DOM sections as the fallback and as
  the SEO/no-JS content. Optionally gate behind a `?classic` flag for easy A/B and debugging.
- Keep the existing feature components as the fallback content source — don't delete them.

## DESIGN LANGUAGE

Cinematic dark space; brand purple → cyan → gold accents; glassmorphism and refractive glass;
volumetric light and soft bloom; shallow depth of field on the focused subject; a whisper of film
grain and chromatic aberration at the edges. Space Grotesk for display type. Elegant and confident
— restraint over spectacle. Motion should feel weighty and smooth, never twitchy.

## DELIVERY — do this incrementally, verify each phase

- **Phase 1 — Foundation.** Add deps; scaffold `src/experience/` with a lazy `<Canvas>` +
  `ScrollControls` + Lenis + capability/reduced-motion gating and the DOM fallback wired up. Empty
  chapters, working scroll, no visual regressions. Prove the fallback path first.
- **Phase 2 — Hero chapter** (camera, glass monogram, overlay CTAs, mouse parallax).
- **Phase 3 — Projects chapter** (the showpiece: screenshot-textured screens on a scroll path,
  hover + real links).
- **Phase 4 — Services, AI, Trust, Contact chapters.**
- **Phase 5 — Postprocessing + custom cursor + scroll indicator + polish** (+ optional ambient
  sound with a mute default).
- **Phase 6 — Perf & a11y & QA:** measure fps and Lighthouse, tune DPR/instancing/textures, verify
  reduced-motion + no-WebGL + mobile fallbacks, verify en/he/ar + RTL, verify all routes and admin.

At the end of each phase, run `npm run typecheck`, `npm run lint`, `npm run build`, and briefly
report what changed, how it performs, and what's next. Ask me before making irreversible cuts to
existing components. Ship working software at every step.

## GUARDRAILS — do NOT

- Do not remove or bypass `prefers-reduced-motion` support, or trap content inside the canvas.
- Do not hardcode copy or break the en/he/ar + RTL system.
- Do not regress SEO (crawlable DOM content, meta, sitemap) or break `/admin`, routing, or the
  WhatsApp CTA.
- Do not ship janky 60fps-killers; measure before claiming "done."
- Do not force-push, rewrite history, or delete the existing 2D components (they are the fallback).

=======================================================================================

### Optional add-ons you can append to the prompt
- "Add subtle spatialized ambient audio with a persistent mute toggle, muted by default."
- "Add a `leva` dev panel (dev-only) to tune camera keyframes, then bake the values into `storyboard.ts`."
- "Generate a low-poly GLB monogram for the hero and load it with `useGLTF` + Draco compression."
- "Add an FPS/quality auto-downgrade: if frame time exceeds 20ms for 2s, drop to the low tier."
