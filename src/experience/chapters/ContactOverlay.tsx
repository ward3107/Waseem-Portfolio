import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChapterOverlay from './ChapterOverlay';
import { WhatsAppButton, StartProjectButton } from './actions';

/** Chapter 6 — Contact finale. Real closing copy + WhatsApp-first CTAs. */
const ContactOverlay: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const { t } = useLanguage();
  return (
    <ChapterOverlay
      index={index}
      total={total}
      title={
        <>
          <span className="text-white">{t('contact_title_1')}</span>
          <span className="bg-gradient-to-r from-brand-goldLight via-yellow-200 to-brand-goldLight bg-clip-text italic text-transparent drop-shadow-[0_1px_10px_rgba(227,208,149,0.45)]">
            {t('contact_title_2')}
          </span>
        </>
      }
      description={t('contact_desc')}
      actions={
        <>
          <WhatsAppButton />
          <StartProjectButton />
        </>
      }
    />
  );
};

export default ContactOverlay;
