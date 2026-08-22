import React, { lazy, Suspense } from 'react';
import Hero from '@/features/hero';
import AboutTimeline from '@/features/about/AboutTimeline';
import Certifications from '@/features/certifications/Certifications';
import Services from '@/features/services';
import Process from '@/features/home/Process';
import AISection from '@/features/ai/AISection';
import VibeCoding from '@/features/ai/VibeCoding';
import Projects from '@/features/projects/Projects';
import Reviews from '@/features/reviews/Reviews';
import Contact from '@/features/contact/Contact';
import FAQ from '@/features/home/FAQ';
import ScrollJourney from '@/features/journey/ScrollJourney';
import Act from '@/features/journey/Act';
import { JOURNEY_ACTS } from '@/features/journey/journeyConfig';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useExperienceMode } from '@/experience';

// Acts, in scroll order, mapping the existing sections onto the five-colour
// journey: Identity (purple) → Services (blue) → AI (cyan) → Work (gold) →
// Contact (emerald). Grouping only — each section's own markup is untouched.
const [ACT_IDENTITY, ACT_SERVICES, ACT_AI, ACT_WORK, ACT_CONTACT] = JOURNEY_ACTS;

// These sections were lazy, but each one rendered unconditionally on mount —
// there was no scroll gate — so React requested all six chunks immediately
// anyway. The split bought no deferred work; it only added a round trip in
// front of every section and a half-screen pulsing skeleton in the meantime.
//
// Measured on a throttled phone (slow 4G, 4x CPU), the page stood at 727px
// until 1.8s and then grew to 6381px in one step as the six chunks landed
// together. Anyone who had started scrolling lost their place. Imported
// statically, the sections are part of the first render, so the page reaches
// its layout in one pass instead of jumping to it a second and a half later.

// The immersive 3D scroll-storytelling experience is code-split so its WebGL
// bundle (react-three-fiber + drei + three + lenis) only downloads for visitors
// who actually enter it. useExperienceMode() keeps the classic site as the
// default and only returns '3d' for a capable desktop that opted in (see
// src/experience/useExperienceMode.ts). Reduced-motion, no-WebGL, mobile, and
// ?classic all resolve to the classic path below.
const Experience = lazy(() => import('@/experience/Experience'));

/** The whole site on one page — a single continuous colour journey. What used
 *  to be separate /about, /services, /projects and /contact routes now live
 *  here as five colour acts, in scroll order, so the visitor never leaves the
 *  page. The old routes redirect to the matching anchor (see App.tsx). This is
 *  also the guaranteed fallback for the 3D experience (reduced-motion /
 *  no-WebGL / mobile / opt-out).
 *
 *  Each act keeps its sections' own ids (#about, #what-i-do, #ai-automation,
 *  #projects, #contact, …) so the nav and every CTA scroll straight to them. */
const ClassicHome: React.FC = () => (
  <ScrollJourney>
    {/* Identity — who Waseem is: the hero, the story/timeline, the credentials. */}
    <Act act={ACT_IDENTITY}>
      <Hero />
      <AboutTimeline />
      <Certifications />
    </Act>
    {/* Services — what he builds, and how the work goes. */}
    <Act act={ACT_SERVICES}>
      <Services />
      <Process />
    </Act>
    {/* AI — the interactive proof, then the philosophy breather. */}
    <Act act={ACT_AI}>
      <AISection />
      <VibeCoding />
    </Act>
    {/* Work — the projects gallery and social proof. */}
    <Act act={ACT_WORK}>
      <Projects />
      <Reviews />
    </Act>
    {/* Contact — answer the last questions, then the one clear action. */}
    <Act act={ACT_CONTACT}>
      <FAQ />
      <Contact />
    </Act>
  </ScrollJourney>
);

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  useDocumentTitle(t('page_title_home'));
  const mode = useExperienceMode();

  if (mode === '3d') {
    // While the WebGL chunk streams in, hold a dark screen that matches the
    // experience background so there's no flash of the classic layout.
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <Experience />
      </Suspense>
    );
  }

  return <ClassicHome />;
};

export default HomePage;
