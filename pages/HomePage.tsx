import React, { lazy, Suspense } from 'react';
import Hero from '../components/Hero';
import SectionSkeleton from '../components/SectionSkeleton';

// Hero is eager — it's the LCP. Everything below the fold is lazy so the
// main chunk stays lean and mobile visitors on the hero don't pay for
// JavaScript they haven't scrolled to yet.
const Services = lazy(() => import('../components/Services'));
const AISection = lazy(() => import('../components/AISection'));
const VibeCoding = lazy(() => import('../components/VibeCoding'));
const FeaturedProjects = lazy(() => import('../components/FeaturedProjects'));
const HomeCTA = lazy(() => import('../components/HomeCTA'));

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
