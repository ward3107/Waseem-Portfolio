import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useLenisScroll } from './useLenisScroll';
import { CHAPTERS } from './storyboard';
import { useQualityTier } from './useQualityTier';
import ScrollProgress from './components/ScrollProgress';
import AudioTour from './components/AudioTour';
import HeroBackdrop from './chapters/HeroBackdrop';
import HeroOverlay from './chapters/HeroOverlay';
import AboutOverlay from './chapters/AboutOverlay';
import ServicesOverlay from './chapters/ServicesOverlay';
import AIOverlay from './chapters/AIOverlay';
import ProjectsOverlay from './chapters/ProjectsOverlay';
import TrustOverlay from './chapters/TrustOverlay';
import VideosOverlay from './chapters/VideosOverlay';
import ContactOverlay from './chapters/ContactOverlay';
import SocialMediaSection from '@/features/social-media/SocialMediaSection';
import { scrollStore } from './scrollStore';
import InlineQuoteSection from '@/features/quote/InlineQuoteSection';

// Maps a storyboard chapter id to its DOM overlay. Handled separately: chapter
// 1 (hero) owns the page's single <h1>; projects takes the quality tier (it
// swaps the DOM card grid for a lean index when the 3D gallery is present).
const OVERLAY_BY_ID: Record<string, React.FC<{ index: number; total: number }>> = {
  about: AboutOverlay,
  services: ServicesOverlay,
  ai: AIOverlay,
  videos: VideosOverlay,
  trust: TrustOverlay,
  contact: ContactOverlay,
};

// The WebGL bundle (fiber + drei + three) is isolated behind this lazy import.
// Classic-site visitors never reach this line, so they never download it.
const ExperienceCanvas = lazy(() => import('./ExperienceCanvas'));

// The lip-syncing assistant face is its own small WebGL surface — lazy too, so
// it shares the fiber/drei chunk and never weighs on the classic site. It only
// shows a small looping video avatar once the audio tour is active (see the
// TalkingHead gate); no WebGL, so its chunk stays tiny.
const TalkingHead = lazy(() => import('./components/TalkingHead'));

// The live voice agent (ElevenLabs Conversational AI). Lazy so its SDK is a
// separate chunk, loaded only for experience visitors; it drives the same face.
const ConversationAgent = lazy(() => import('./components/ConversationAgent'));

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
 * Runs by default on capable desktops and phones (see useExperienceMode).
 * Phones retain the same scenes with a smaller GPU rendering budget.
 */
const Experience: React.FC = () => {
  const [canvasFailed, setCanvasFailed] = useState(false);
  const [canvasStarted, setCanvasStarted] = useState(() => scrollStore.get().journey > 0.002);
  const tier = useQualityTier();

  // Smooth scrolling + progress publishing, live for as long as we're mounted.
  useLenisScroll(true);

  // The static hero art and all real DOM content render immediately. Start
  // WebGL only when the visitor moves into the scroll story; otherwise its
  // large Three.js bundle and render loop compete with first paint and input.
  useEffect(() => {
    if (canvasStarted) return;
    const startOnJourney = () => {
      if (scrollStore.get().journey > 0.002) setCanvasStarted(true);
    };
    const unsubscribe = scrollStore.subscribe(startOnJourney);
    startOnJourney();
    return unsubscribe;
  }, [canvasStarted]);

  return (
    // overflow-x-clip: decorative layers (text scrims, CTA glows) bleed past
    // the content edge by design; on narrow viewports that bleed poked past
    // the page edge and made the whole site pannable left-right. clip (not
    // hidden) trims it without creating a scroll container, and fixed
    // children (canvas, progress, pill) are unaffected since this element has
    // no transform/filter.
    <div className="relative overflow-x-clip bg-slate-950 text-white">
      {/* Fixed 3D backdrop. Sits behind the content (z-0). Pointer events stay
          on the canvas so it can track the cursor for parallax; the content
          layer above is pointer-events-none except for real interactive
          elements, so clicks still reach links/buttons. */}
      <div className="fixed inset-0 z-0">
        {/* The V backdrop follows the opening scroll, then gives way to the
            live 3D V. The old film had a baked-in W and is never requested. */}
        {tier === 'high' && <HeroBackdrop />}
        {tier !== 'high' && (
          <img
            src="/assets/forge-hero-v.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {canvasStarted && !canvasFailed && (
          <Suspense fallback={null}>
            <ExperienceCanvas tier={tier} onContextLost={() => setCanvasFailed(true)} />
          </Suspense>
        )}
        {/* Subtle vignette to seat the DOM text over the 3D scene. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/70" />
      </div>

      <ScrollProgress />

      {/* Narrated audio tour — auto-starts muted and unmutes on the first
          gesture, reading a short line for each chapter (English/Hebrew/Arabic). */}
      <AudioTour />

      {/* The glassy assistant face that lip-syncs to the tour. Renders its own
          tiny canvas only while the tour is active; null otherwise. */}
      <Suspense fallback={null}>
        <TalkingHead />
      </Suspense>

      {/* Live voice agent — "Talk to Waseem". Visitors speak to the face and it
          answers; while connected it drives the same face and pauses narration. */}
      <Suspense fallback={null}>
        <ConversationAgent />
      </Suspense>

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
            <React.Fragment key={chapter.id}>
            {chapter.id === 'contact' && <InlineQuoteSection />}
            <section
              id={sectionId}
              aria-label={chapter.label}
              className="flex min-h-[100svh] flex-col items-center justify-center px-5 py-24 text-center sm:px-6"
            >
              {i === 0 ? (
                // Chapter 1 — real hero content (its own single <h1>).
                <HeroOverlay />
              ) : chapter.id === 'social' ? (
                <div className="w-full max-w-5xl">
                  <SocialMediaSection embedded />
                </div>
              ) : chapter.id === 'projects' ? (
                // Projects — 3D fly-through gallery (in the canvas) is the
                // visual; this overlay is the accessible heading + link index.
                <ProjectsOverlay index={i} total={CHAPTERS.length} />
              ) : Overlay ? (
                <Overlay index={i} total={CHAPTERS.length} />
              ) : null}
            </section>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Experience;
