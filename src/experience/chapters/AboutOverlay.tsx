import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChapterOverlay from './ChapterOverlay';
import HeadingAccent from '../components/HeadingAccent';
import { StartProjectButton, GhostNavButton } from './actions';

/**
 * Chapter — About / Identity. The 3D experience previously had no "about"
 * section, so the nav's About link (/#about) scrolled to nothing. This chapter
 * gives it a real destination: who Waseem is, in the experience's voice, using
 * the same about_* copy as the classic AboutTimeline.
 */
const AboutOverlay: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const { t } = useLanguage();
  return (
    <ChapterOverlay
      index={index}
      total={total}
      eyebrow={t('about_badge')}
      title={
        <>
          <span className="text-white">{t('about_title_1')}</span>{' '}
          <HeadingAccent tone="purple">{t('about_title_2')}</HeadingAccent>
        </>
      }
      description={t('about_trusted_desc')}
      chips={[t('about_stat_1'), t('about_stat_2'), t('about_stat_3')]}
      actions={
        <>
          <StartProjectButton label={t('hero_cta_start')} />
          <GhostNavButton href="/projects">{t('hero_cta_view')}</GhostNavButton>
        </>
      }
    />
  );
};

export default AboutOverlay;
