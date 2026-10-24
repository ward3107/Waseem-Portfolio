import React, { lazy, Suspense } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useExperienceMode } from '@/experience';
import AudioTour from '@/experience/components/AudioTour';

const Experience = lazy(() => import('@/experience/Experience'));
const ClassicHome = lazy(() => import('./ClassicHome'));

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

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
        <ClassicHome />
      </Suspense>
      <AudioTour />
    </>
  );
};

export default HomePage;
