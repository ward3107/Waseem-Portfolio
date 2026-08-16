import React from 'react';
import AboutTimeline from '@/features/about/AboutTimeline';
import Reviews from '@/features/reviews/Reviews';
import Process from '@/features/home/Process';
import FAQ from '@/features/home/FAQ';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

// Static rather than lazy — see the note in HomePage.tsx. Each section
// rendered unconditionally on mount, so the chunks were fetched immediately
// regardless; the split only bought a round trip and a skeleton that resized
// the page under the reader.

const AboutPage: React.FC = () => {
  const { t } = useLanguage();
  useDocumentTitle(t('page_title_about'));
  return (
    <>
      <AboutTimeline />
      <Reviews />
      <Process />
      <FAQ />
    </>
  );
};

export default AboutPage;
