import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChapterOverlay from './ChapterOverlay';
import { WhatsAppButton, GhostNavButton } from './actions';

/** Chapter 5 — Trust. Real trust line + rating + a nudge to the work/chat. */
const TrustOverlay: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const { t } = useLanguage();
  return (
    <ChapterOverlay
      index={index}
      total={total}
      eyebrow={t('testimonial_video_title')}
      title={<span className="text-white">{t('hero_trust')}</span>}
      actions={
        <>
          <GhostNavButton href="/projects">{t('hero_cta_view')}</GhostNavButton>
          <WhatsAppButton />
        </>
      }
    >
      <div
        className="mt-6 flex items-center justify-center gap-1 text-2xl text-brand-gold"
        aria-hidden="true"
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i}>★</span>
        ))}
      </div>
    </ChapterOverlay>
  );
};

export default TrustOverlay;
