import React, { lazy, Suspense } from 'react';
import AboutTimeline from '@/features/about/AboutTimeline';
import SectionSkeleton from '@/shared/ui/SectionSkeleton';

const Reviews = lazy(() => import('@/features/reviews/Reviews'));
const Process = lazy(() => import('@/features/home/Process'));
const FAQ = lazy(() => import('@/features/home/FAQ'));

const AboutPage: React.FC = () => (
  <>
    <AboutTimeline />
    <Suspense fallback={null}>
      <Reviews />
    </Suspense>
    <Suspense fallback={<SectionSkeleton />}>
      <Process />
    </Suspense>
    <Suspense fallback={<SectionSkeleton />}>
      <FAQ />
    </Suspense>
  </>
);

export default AboutPage;
