import React from 'react';
import Hero from '@/features/hero';
import AboutTimeline from '@/features/about/AboutTimeline';
import Certifications from '@/features/certifications/Certifications';
import Services from '@/features/services';
import Process from '@/features/home/Process';
import AISection from '@/features/ai/AISection';
import VibeCoding from '@/features/ai/VibeCoding';
import Projects from '@/features/projects/Projects';
import VideoAdsPreview from '@/features/video-ads/VideoAdsPreview';
import Reviews from '@/features/reviews/Reviews';
import SocialMediaSection from '@/features/social-media/SocialMediaSection';
import Contact from '@/features/contact/Contact';
import FAQ from '@/features/home/FAQ';
import ScrollJourney from '@/features/journey/ScrollJourney';
import Act from '@/features/journey/Act';
import { JOURNEY_ACTS } from '@/features/journey/journeyConfig';

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

/** The homepage is a continuous colour journey, with the complete portfolio
 *  including both existing work and approved additions. The other former routes
 *  redirect to the matching anchor (see App.tsx). This is
 *  also the guaranteed fallback for the 3D experience (reduced-motion /
 *  no-WebGL / crawler / opt-out).
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
      <VideoAdsPreview />
      <SocialMediaSection />
      <Reviews />
    </Act>
    {/* Contact — answer the last questions, then the one clear action. */}
    <Act act={ACT_CONTACT}>
      <FAQ />
      <Contact />
    </Act>
  </ScrollJourney>
);


export default ClassicHome;
