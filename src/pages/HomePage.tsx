import React, { lazy, Suspense } from 'react';
import Hero from '@/features/hero';
import SectionSkeleton from '@/shared/ui/SectionSkeleton';

// Hero is eager — it's the LCP. Everything below the fold is lazy so the
// main chunk stays lean and mobile visitors on the hero don't pay for
// JavaScript they haven't scrolled to yet.
const Services = lazy(() => import('@/features/services'));
const AISection = lazy(() => import('@/features/ai/AISection'));
const VibeCoding = lazy(() => import('@/features/ai/VibeCoding'));
const FeaturedProjects = lazy(() => import('@/features/projects/FeaturedProjects'));
const HomeCTA = lazy(() => import('@/features/home/HomeCTA'));

const HomePage: React.FC = () => (
  <>
    <Hero />
    <Suspense fallback={<SectionSkeleton />}>
      <Services />
    </Suspense>
    <Suspense fallback={<SectionSkeleton />}>
      <AISection />
    </Suspense>
    <Suspense fallback={<SectionSkeleton />}>
      <VibeCoding />
    </Suspense>
    <Suspense fallback={<SectionSkeleton />}>
      <FeaturedProjects />
    </Suspense>
    <Suspense fallback={null}>
      <HomeCTA />
    </Suspense>
  </>
);

export default HomePage;
