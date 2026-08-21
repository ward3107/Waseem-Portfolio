import React from 'react';
import { motion } from 'framer-motion';
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
      {/* Stars pop in one after another — the chapter's living moment. */}
      <div
        className="mt-6 flex items-center justify-center gap-1.5 text-3xl text-brand-gold"
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.35 + i * 0.12, type: 'spring', stiffness: 300, damping: 12 }}
            className="inline-block drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          >
            ★
          </motion.span>
        ))}
      </div>
    </ChapterOverlay>
  );
};

export default TrustOverlay;
