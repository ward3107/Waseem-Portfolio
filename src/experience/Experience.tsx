import React, { Suspense, lazy, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLenisScroll } from './useLenisScroll';
import { CHAPTERS } from './storyboard';
import ScrollProgress from './components/ScrollProgress';

// The WebGL bundle (fiber + drei + three) is isolated behind this lazy import.
// Classic-site visitors never reach this line, so they never download it.
const ExperienceCanvas = lazy(() => import('./ExperienceCanvas'));

/**
 * Phase 1 foundation of the 3D scroll-storytelling experience.
 *
 * What ships in this phase:
 *   - A persistent, fixed, full-viewport WebGL backdrop (lazy-loaded) whose
 *     camera is driven by scroll via the shared scrollStore.
 *   - Lenis smooth/inertial scrolling over native scroll.
 *   - The real DOM content layer: one semantic <section> per storyboard chapter,
 *     so headings, focus order, and crawlable text already exist. Chapter COPY
 *     and per-chapter 3D content arrive in Phases 2–4; these are labelled
 *     scaffolds for now.
 *   - A graceful fallback: if WebGL context is lost, the canvas is dropped and
 *     the DOM layer keeps working — never a blank screen.
 *
 * This component only renders on a capable desktop that opted in (see
 * useExperienceMode). Everyone else gets the classic site.
 */
const Experience: React.FC = () => {
  const { t } = useLanguage();
  const [canvasFailed, setCanvasFailed] = useState(false);

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
            <ExperienceCanvas onContextLost={() => setCanvasFailed(true)} />
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
          // Exactly one <h1> per page (the hero chapter); the rest are <h2>.
          const Heading = i === 0 ? 'h1' : 'h2';
          return (
          <section
            key={chapter.id}
            id={chapter.id}
            aria-label={chapter.label}
            className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-brand-cyan">
              {String(i + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}
            </p>
            <Heading className="max-w-3xl font-heading text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
              {chapter.label}
            </Heading>
            {i === 0 && (
              <p className="mt-6 max-w-md text-sm text-slate-300">
                {/* Falls back to English if the i18n key isn't present yet. */}
                {t('exp_scaffold_note') === 'exp_scaffold_note'
                  ? 'Immersive preview — scroll to move the camera through the story. Full chapter content arrives in the next phases.'
                  : t('exp_scaffold_note')}
              </p>
            )}
            {i === 0 && (
              <a
                href="?classic=1"
                className="pointer-events-auto mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition-colors hover:border-brand-cyan/50 hover:bg-white/10"
              >
                View the classic site
              </a>
            )}
          </section>
          );
        })}
      </div>
    </div>
  );
};

export default Experience;
