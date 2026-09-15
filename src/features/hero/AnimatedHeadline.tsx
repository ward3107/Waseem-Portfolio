import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import Dimensional3DWord, { fontForLanguage } from '@/shared/three/Dimensional3DWord';

interface AnimatedHeadlineProps {
  t: (key: string) => string;
  language: string;
  prefersReducedMotion: boolean;
  underlineX: MotionValue<number>;
}

const AnimatedHeadline: React.FC<AnimatedHeadlineProps> = ({
  t,
  language,
  prefersReducedMotion,
  underlineX,
}) => {
  const initial = prefersReducedMotion ? false : { opacity: 0, y: 20 };
  const transition = (delay: number) => ({
    delay: prefersReducedMotion ? 0 : delay,
    duration: prefersReducedMotion ? 0 : 0.55,
    ease: [0.22, 1, 0.36, 1] as const,
  });

  return (
    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold leading-tight mb-4 md:mb-6 lg:mb-8 text-slate-900 dark:text-white tracking-tight break-words hyphens-auto overflow-wrap-anywhere">
      <motion.span initial={initial} animate={{ opacity: 1, y: 0 }} transition={transition(0.05)} className="block">
        {t('hero_title_1')}
      </motion.span>

      <motion.span initial={initial} animate={{ opacity: 1, y: 0 }} transition={transition(0.14)} className="relative z-50 mb-1 inline-block">
        <span className="relative z-50 text-brand-purple dark:text-brand-purpleLighter drop-shadow-[0_1px_10px_rgba(121,101,193,0.55)]">
          {t('hero_title_2')}
        </span>
        <motion.span
          style={{ x: underlineX }}
          initial={prefersReducedMotion ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 1.2, duration: 0.5, ease: 'easeOut' }}
          className="absolute -bottom-2 left-0 right-0 h-3 md:h-5 bg-brand-gold/30 -skew-x-12 -z-10 rounded-full blur-sm origin-left rtl:origin-right"
        />
      </motion.span>

      <motion.span initial={initial} animate={{ opacity: 1, y: 0 }} transition={transition(0.23)} className="block">
        {t('hero_title_3')}
        <span className="inline-block relative">
          <Dimensional3DWord
            word={t('hero_title_4')}
            font={fontForLanguage(language)}
            fallbackClassName="inline-block whitespace-pre font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-300 to-brand-gold dark:from-brand-goldLight dark:via-yellow-200 dark:to-brand-goldLight bg-[length:200%_auto] relative z-10 drop-shadow-[0_1px_8px_rgba(227,208,149,0.45)]"
          />
        </span>
      </motion.span>
    </h1>
  );
};

export default AnimatedHeadline;
