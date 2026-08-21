import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChapterOverlay from './ChapterOverlay';
import { StartProjectButton, GhostNavButton } from './actions';

/** Chapter 2 — Services. Real service names as chips + consultation CTA. */
const ServicesOverlay: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const { t } = useLanguage();
  return (
    <ChapterOverlay
      index={index}
      total={total}
      title={
        <>
          <span className="text-white">{t('services_title_1')}</span>
          <span
            className="exp-glow-pulse text-brand-purpleLighter"
            style={{ '--glow': 'rgba(121,101,193,0.6)' } as React.CSSProperties}
          >
            {t('services_title_2')}
          </span>
        </>
      }
      description={t('services_subtitle')}
      chips={[
        t('service_1_title'),
        t('service_2_title'),
        t('service_3_title'),
        t('service_4_title'),
        t('service_5_title'),
        t('service_marketing_title'),
      ]}
      actions={
        <>
          <StartProjectButton label={t('services_cta_btn')} />
          <GhostNavButton href="/projects">{t('hero_cta_view')}</GhostNavButton>
        </>
      }
    />
  );
};

export default ServicesOverlay;
