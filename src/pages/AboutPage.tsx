import React, { lazy, Suspense } from 'react';
import AboutTimeline from '@/features/about/AboutTimeline';
import SectionSkeleton from '@/shared/ui/SectionSkeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

const Reviews = lazy(() => import('@/features/reviews/Reviews'));
const Process = lazy(() => import('@/features/home/Process'));
const FAQ = lazy(() => import('@/features/home/FAQ'));

const AboutPage: React.FC = () => {
  const { t } = useLanguage();
  useDocumentTitle(t('page_title_about'));
  return (
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
};

export default AboutPage;
