import React, { Suspense, lazy, useState } from 'react';
import { useLenisScroll } from './useLenisScroll';
import { CHAPTERS } from './storyboard';
import { useQualityTier } from './useQualityTier';
import ScrollProgress from './components/ScrollProgress';
import HeroOverlay from './chapters/HeroOverlay';
import ServicesOverlay from './chapters/ServicesOverlay';
import AIOverlay from './chapters/AIOverlay';
import ProjectsOverlay from './chapters/ProjectsOverlay';
import TrustOverlay from './chapters/TrustOverlay';
import ContactOverlay from './chapters/ContactOverlay';

// Maps a storyboard chapter id to its DOM overlay. Handled separately: chapter
// 1 (hero) owns the page's single <h1>; projects takes the quality tier (it
// swaps the DOM card grid for a lean index when the 3D gallery is present).
const OVERLAY_BY_ID: Record<string, React.FC<{ index: number; total: number }>> = {
  services: ServicesOverlay,
  ai: AIOverlay,
  trust: TrustOverlay,
  contact: ContactOverlay,
};

// The WebGL bundle (fiber + drei + three) is isolated behind this lazy import.
// Classic-site visitors never reach this line, so they never download it.
const ExperienceCanvas = lazy(() => import('./ExperienceCanvas'));

/**
 * The 3D scroll-storytelling experience.
 *
 * Architecture:
 *   - A persistent, fixed, full-viewport WebGL backdrop (lazy-loaded) whose
 *     camera is driven by scroll via the shared scrollStore.
 *   - Lenis smooth/inertial scrolling over native scroll.
 *   - A real, semantic DOM content layer: one <section> per storyboard chapter,
 *     so headings, focus order, and crawlable text exist independent of WebGL.
 *   - A graceful fallback: if the WebGL context is lost, the canvas is dropped
 *     and the DOM layer keeps working — never a blank screen.
 *
 * Chapter status: Chapter 1 (Hero) ships real content — the glass monogram
 * (3D, in Scene) plus the translated headline/CTAs (DOM, HeroOverlay). The
 * remaining chapters are labelled scaffolds until Phases 3–4 fill them in.
 *
 * Only renders on a capable desktop that opted in (see useExperienceMode);
 * everyone else gets the classic site.
 */
const Experience: React.FC = () => {
  const [canvasFailed, setCanvasFailed] = useState(false);
  const tier = useQualityTier();

  // Smooth scrolling + progress publishing, live for as long as we're mounted.
  useLenisScroll(true);

  return (
    <div className="relative bg-slate-950 text-white">
      {/* Fixed 3D backdrop. Sits behind the content (z-0). Pointer events stay
          on the canvas so it can track the cursor for parallax; the content
          layer above is pointer-events-none except for real interactive
          elements, so clicks still reach links/buttons. */}
      <div className="fixed inset-0 z-0">
        {!canvasFailed && (
          <Suspense fallback={null}>
            <ExperienceCanvas tier={tier} onContextLost={() => setCanvasFailed(true)} />
          </Suspense>
        )}
        {/* Subtle vignette to seat the DOM text over the 3D scene. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/70" />
      </div>

      <ScrollProgress />

      {/* Content layer. pointer-events-none lets cursor moves reach the canvas;
          interactive children opt back in with pointer-events-auto. */}
      <div className="pointer-events-none relative z-10">
        {CHAPTERS.map((chapter, i) => {
          const Overlay = OVERLAY_BY_ID[chapter.id];
          // Use the chapter's nav anchor as the section id so existing in-page
          // links (e.g. /#what-i-do, /#ai-automation) resolve to the right
          // chapter in the experience too.
          const sectionId = chapter.anchor ? chapter.anchor.replace(/^#/, '') : chapter.id;
          return (
            <section
              key={chapter.id}
              id={sectionId}
              aria-label={chapter.label}
              className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center"
            >
              {i === 0 ? (
                // Chapter 1 — real hero content (its own single <h1>).
                <HeroOverlay />
              ) : chapter.id === 'projects' ? (
                // Projects — 3D gallery (high) + lean index, or DOM cards (low).
                <ProjectsOverlay index={i} total={CHAPTERS.length} tier={tier} />
              ) : Overlay ? (
                <Overlay index={i} total={CHAPTERS.length} />
              ) : null}
            </section>
          );
        })}
      </div>

      {/* Unobtrusive escape hatch back to the classic site (the experience is
          still opt-in / in progress). Fixed so it's reachable from any chapter. */}
      <a
        href="?classic=1"
        className="fixed bottom-4 start-4 z-40 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/80 backdrop-blur transition-colors hover:border-brand-cyan/40 hover:bg-white/10 hover:text-white"
      >
        Classic site
      </a>
    </div>
  );
};

export default Experience;
