import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import ChapterOverlay, { containerVariants } from './ChapterOverlay';
import CertCarousel from '../components/CertCarousel';
import { WhatsAppButton, GhostNavButton } from './actions';

/** Stars pop in one after another as the chapter arrives. */
const starVariants: Variants = {
  hidden: { scale: 0, rotate: -30, opacity: 0 },
  show: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 12 },
  },
};

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
      {/* Variants inherit from the chapter container, so the stars cascade in
          step with the rest of the chapter — and replay on every visit. */}
      <motion.div
        variants={containerVariants}
        className="mt-6 flex items-center justify-center gap-1.5 text-3xl text-brand-gold"
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            variants={starVariants}
            className="inline-block drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          >
            ★
          </motion.span>
        ))}
      </motion.div>

      {/* Credentials as a compact, swipeable carousel — verifiable proof inside
          the experience, not just on the classic site. */}
      <div className="mx-auto w-full max-w-3xl">
        <CertCarousel />
      </div>
    </ChapterOverlay>
  );
};

export default TrustOverlay;
