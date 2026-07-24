import React, { lazy, Suspense } from 'react';
import AboutTimeline from '../components/AboutTimeline';
import SectionSkeleton from '../components/SectionSkeleton';

const Reviews = lazy(() => import('../components/Reviews'));
const Process = lazy(() => import('../components/Process'));
const FAQ = lazy(() => import('../components/FAQ'));
const Contact = lazy(() => import('../components/Contact'));

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
