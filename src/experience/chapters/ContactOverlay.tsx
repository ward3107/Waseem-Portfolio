import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import ChapterOverlay from './ChapterOverlay';
import HeadingAccent from '../components/HeadingAccent';
import { StartProjectButton } from './actions';

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
          <HeadingAccent tone="gold" fancy>{t('contact_title_2')}</HeadingAccent>
        </>
      }
      description={t('contact_desc')}
      actions={
        <span className="relative inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {/* The finale's living moment: a slow breathing glow gathers behind
              the one call to action the whole journey funnels toward. */}
          <motion.span
            aria-hidden="true"
            animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-x-4 -inset-y-6 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(37,211,102,0.28),rgba(121,101,193,0.18),transparent)] blur-2xl sm:-inset-x-10"
          />
          <StartProjectButton />
        </span>
      }
    />
  );
};

export default ContactOverlay;
