import React from 'react';
import { Code, Search, Bot, Globe, Box, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChapterOverlay from './ChapterOverlay';
import HeadingAccent from '../components/HeadingAccent';
import MiniCardGrid from '../components/MiniCardGrid';
import { StartProjectButton, GhostNavButton } from './actions';

/** Chapter 2 — Services. Real service names as compact icon cards + CTA. */
const ServicesOverlay: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const { t } = useLanguage();
  const services = [
    { label: t('service_1_title'), Icon: Code },
    { label: t('service_2_title'), Icon: Search },
    { label: t('service_3_title'), Icon: Bot },
    { label: t('service_4_title'), Icon: Globe },
    { label: t('service_5_title'), Icon: Box },
    { label: t('service_marketing_title'), Icon: TrendingUp },
  ];
  return (
    <ChapterOverlay
      index={index}
      total={total}
      title={
        <>
          <span className="text-white">{t('services_title_1')}</span>
          <HeadingAccent tone="purple">{t('services_title_2')}</HeadingAccent>
        </>
      }
      description={t('services_subtitle')}
      actions={
        <>
          <StartProjectButton label={t('services_cta_btn')} />
          <GhostNavButton href="/projects">{t('hero_cta_view')}</GhostNavButton>
        </>
      }
    >
      <div className="mx-auto w-full max-w-2xl">
        <MiniCardGrid items={services} />
      </div>
    </ChapterOverlay>
  );
};

export default ServicesOverlay;
