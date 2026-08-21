import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, MessageCircle, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import { useSectionNavigate } from '@/shared/hooks/useSectionNavigate';
import HeadingAccent from '../components/HeadingAccent';
import { useHeadingLeading } from './ChapterOverlay';

/**
 * Chapter 1 DOM overlay — the real, translated, crawlable hero content that
 * sits over the 3D glass monogram: availability badge, headline, subtitle, the
 * WhatsApp-first CTAs (same attribution-aware links as the classic hero), and a
 * scroll cue. The wrapper is pointer-events-none so cursor moves still reach the
 * canvas for parallax; each interactive control re-enables pointer events.
 */
const HeroOverlay: React.FC = () => {
  const { t, language } = useLanguage();
  const contact = useContact();
  const navigate = useSectionNavigate();
  const leading = useHeadingLeading();
  const isRtl = language === 'he' || language === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="pointer-events-none relative flex flex-col items-center text-center">
      {/* Soft scrim so the headline stays legible over the film's brightest
          frames (the 10k worst-frame legibility rule). Whisper level. */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-6 -inset-y-12 -z-10 rounded-[4rem] bg-slate-950/45 blur-3xl sm:-inset-x-16"
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-6 inline-flex items-center rounded-full border border-brand-green/30 bg-green-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-green backdrop-blur"
      >
        <span className="relative me-2 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
        {t('hero_badge')}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`max-w-4xl font-heading text-4xl font-black tracking-tight sm:text-6xl md:text-7xl ${leading}`}
      >
        <span className="text-white">{t('hero_title_1')}</span>
        <HeadingAccent tone="purple">{t('hero_title_2')}</HeadingAccent>{' '}
        <span className="text-white">{t('hero_title_3')}</span>
        <HeadingAccent tone="gold" fancy>{t('hero_title_4')}</HeadingAccent>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="mt-6 max-w-xl text-base font-medium leading-relaxed text-slate-300 sm:text-lg"
      >
        {t('hero_subtitle')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
      >
        <a
          href={contact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-xl shadow-green-500/30 transition-transform hover:scale-105 sm:text-base"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {t('hero_cta_whatsapp')}
        </a>
        <a
          href="/contact"
          onClick={(e) => {
            e.preventDefault();
            navigate('/contact', { focusId: 'project-wizard' });
          }}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-brand-purple px-6 py-3 text-sm font-bold text-white shadow-xl shadow-brand-purple/30 transition-transform hover:scale-105 sm:text-base"
        >
          {t('hero_cta_start')}
          <Arrow className="h-4 w-4" aria-hidden="true" />
        </a>
        <a
          href="/projects"
          onClick={(e) => {
            e.preventDefault();
            navigate('/projects');
          }}
          className="pointer-events-auto rounded-full border-2 border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:border-brand-cyan/40 hover:bg-white/10 sm:text-base"
        >
          {t('hero_cta_view')}
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-8 flex items-center gap-2"
      >
        <div className="flex gap-0.5" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="text-sm text-brand-gold">
              ★
            </span>
          ))}
        </div>
        <p className="text-xs font-medium text-slate-400 sm:text-sm">{t('hero_trust')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.4] }}
        transition={{ delay: 1.1, duration: 1.6, repeat: Infinity, repeatType: 'reverse' }}
        className="mt-14 flex flex-col items-center text-slate-400"
        aria-hidden="true"
      >
        <ChevronDown className="h-5 w-5" />
      </motion.div>
    </div>
  );
};

export default HeroOverlay;
