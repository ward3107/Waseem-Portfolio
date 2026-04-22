import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { letterVariants, emphasizedVariants, part3Variants, splitForAnimation } from './animations';

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
  const letter = letterVariants(prefersReducedMotion);
  const emphasized = emphasizedVariants(prefersReducedMotion);
  const part3 = part3Variants(prefersReducedMotion);

  return (
    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold leading-tight mb-4 md:mb-6 lg:mb-8 text-slate-900 dark:text-white tracking-tight break-words hyphens-auto overflow-wrap-anywhere">
      {splitForAnimation(t('hero_title_1'), language).map((char, index) => (
        <motion.span
          key={`p1-${index}`}
          custom={index}
          variants={letter}
          initial="hidden"
          animate="visible"
          className="inline-block whitespace-pre"
        >
          {char}
        </motion.span>
      ))}
      <br />

      <span className="relative inline-block z-50 mr-2">
        <span className="relative z-50 text-brand-purple">
          {splitForAnimation(t('hero_title_2'), language).map((char, index) => (
            <motion.span
              key={`p2-${index}`}
              custom={index}
              variants={emphasized}
              initial="hidden"
              animate="visible"
              className="inline-block"
              style={{ transformOrigin: 'center bottom' }}
            >
              {char}
            </motion.span>
          ))}
        </span>
        <motion.span
          style={{ x: underlineX }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5, ease: 'easeOut' }}
          className="absolute -bottom-2 left-0 right-0 h-3 md:h-5 bg-brand-gold/30 -skew-x-12 -z-10 rounded-full blur-sm origin-left"
        ></motion.span>
      </span>

      <br className="hidden md:inline" />

      {splitForAnimation(t('hero_title_3'), language).map((char, index) => (
        <motion.span
          key={`p3-a-${index}`}
          custom={index}
          variants={part3}
          initial="hidden"
          animate="visible"
          className="inline-block whitespace-pre"
        >
          {char}
        </motion.span>
      ))}

      <span className="inline-block relative">
        {!prefersReducedMotion && (
          <motion.span
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-brand-purple/20 blur-xl rounded-full"
          ></motion.span>
        )}

        {splitForAnimation(t('hero_title_4'), language).map((char, index) => (
          <motion.span
            key={`p3-b-${index}`}
            custom={index + 5}
            variants={part3}
            initial="hidden"
            animate="visible"
            className="inline-block whitespace-pre font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-brand-purpleDark via-fuchsia-600 to-brand-purpleDark bg-[length:200%_auto] relative z-10"
          >
            {char}
          </motion.span>
        ))}
      </span>
    </h1>
  );
};

export default AnimatedHeadline;
