import React from 'react';
import Hero from '@/features/hero';
import Services from '@/features/services';
import AISection from '@/features/ai/AISection';
import VibeCoding from '@/features/ai/VibeCoding';
import FeaturedProjects from '@/features/projects/FeaturedProjects';
import Reviews from '@/features/reviews/Reviews';
import HomeCTA from '@/features/home/HomeCTA';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

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

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  useDocumentTitle(t('page_title_home'));
  return (
    <>
      <Hero />
      <Services />
      <AISection />
      <VibeCoding />
      <FeaturedProjects />
      <Reviews />
      <HomeCTA />
    </>
  );
};

export default HomePage;
