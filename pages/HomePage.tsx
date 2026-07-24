import React, { lazy, Suspense } from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import AISection from '../components/AISection';
import VibeCoding from '../components/VibeCoding';
import SectionSkeleton from '../components/SectionSkeleton';

const FeaturedProjects = lazy(() => import('../components/FeaturedProjects'));
const HomeCTA = lazy(() => import('../components/HomeCTA'));

const HomePage: React.FC = () => (
  <>
    <Hero />
    <Services />
    <AISection />
    <VibeCoding />
    <Suspense fallback={<SectionSkeleton />}>
      <FeaturedProjects />
    </Suspense>
    <Suspense fallback={null}>
      <HomeCTA />
    </Suspense>
  </>
);

export default HomePage;
