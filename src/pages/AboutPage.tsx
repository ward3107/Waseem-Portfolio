import React, { lazy, Suspense } from 'react';
import AboutTimeline from '@/features/about/AboutTimeline';
import SectionSkeleton from '@/shared/ui/SectionSkeleton';

const Reviews = lazy(() => import('@/features/reviews/Reviews'));
const Process = lazy(() => import('@/features/home/Process'));
const FAQ = lazy(() => import('@/features/home/FAQ'));
const Contact = lazy(() => import('@/features/contact/Contact'));

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
    <Suspense fallback={<SectionSkeleton />}>
      <Contact />
    </Suspense>
  </>
);

export default AboutPage;
