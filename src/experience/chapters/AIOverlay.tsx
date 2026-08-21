import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChapterOverlay from './ChapterOverlay';
import { WhatsAppButton, StartProjectButton } from './actions';

/** Chapter 3 — AI & Automation. Real AI copy + capability chips. */
const AIOverlay: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const { t } = useLanguage();
  return (
    <ChapterOverlay
      index={index}
      total={total}
      eyebrow={t('ai_badge')}
      title={
        <>
          <span className="text-white">{t('ai_title_start')} </span>
          <span
            className="exp-glow-pulse text-brand-cyan"
            style={{ '--glow': 'rgba(0,229,255,0.55)' } as React.CSSProperties}
          >
            {t('ai_title_highlight')}
          </span>
        </>
      }
      description={t('ai_desc')}
      chips={[t('ai_card_1_title'), t('ai_card_2_title')]}
      actions={
        <>
          <WhatsAppButton />
          <StartProjectButton />
        </>
      }
    />
  );
};

export default AIOverlay;
