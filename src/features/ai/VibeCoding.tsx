import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInView } from '@/shared/hooks/useInView';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

const VibeCoding: React.FC = () => {
  const { t } = useLanguage();
  const sentence = t('vibe_text_2');

  // The "soulful" line floats every character forever. In English that's dozens
  // of perpetual loops, each also carrying a text-shadow glow — and it never
  // stopped, on-screen or off, phone or desktop. Gate the perpetual float on:
  //   • visibility     — stop the loops when the section is scrolled away
  //   • desktop width  — phones/tablets skip the per-character churn. (A
  //     `(hover)` check misfires on Samsung S-Pen phones, which report
  //     hover+fine-pointer; a viewport-width check can't be fooled.)
  //   • motion preference
  // When it's off, the text renders identically but static (no wave).
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, '150px');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const prefersReducedMotion = usePrefersReducedMotion();
  const animateWave = inView && isDesktop && !prefersReducedMotion;

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center min-h-[60vh] md:min-h-[80vh] transition-colors duration-300">
      {/* Background Ambience — huge 100-120px blur radii reduced to blur-3xl
          (~64px); visually indistinguishable at these opacities and much
          cheaper for the compositor to hold. */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple/20 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="flex flex-col items-center text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-md text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 md:mb-16 shadow-lg"
          >
            <Sparkles size={14} className="text-brand-gold" />
            <span>{t('vibe_badge')}</span>
          </motion.div>

          {/* Main Title - Massive */}
          <motion.h2
            initial={{ opacity: 0, scale: 2, filter: 'blur(20px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              type: "spring",
              bounce: 0.4,
              // Spring bounce overshoots — blur can't be negative, so tween it.
              filter: { type: "tween", duration: 0.6, ease: "easeOut" },
            }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 md:mb-12 select-none relative"
          >
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-500">{t('vibe_title_1')}</span>
            <span className="block text-4xl md:text-6xl font-normal font-heading tracking-normal text-brand-purpleLight mt-2">
              {t('vibe_title_2')}
            </span>
          </motion.h2>

          {/* The Converging Text Block */}
          <div className="max-w-5xl mx-auto relative px-4 py-10">

            {/* 4 Directions Container */}
            <div className="flex flex-col gap-6 md:gap-8 items-center justify-center font-heading">

              {/* 1. From Left */}
              <motion.div
                initial={{ x: -200, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                className="text-2xl md:text-4xl font-bold text-slate-600 dark:text-slate-300"
              >
                {t('vibe_text_1')}
              </motion.div>

              {/* 2. From Right - The Wavy Soulful Text */}
              <motion.div
                initial={{ x: 200, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
              >
                {/* Check for any RTL script (Hebrew \u0590-\u05FF or Arabic
                    \u0600-\u06FF). Splitting RTL text per-character and laying
                    the spans out in a flex row reverses/scrambles the word, so
                    RTL languages must animate as a whole unsplit block. */}
                {/[\u0590-\u06FF]/.test(sentence) ? (
                  // RTL (Hebrew/Arabic): Don't split characters, animate the whole word
                  <motion.div
                    animate={animateWave ? { y: [0, -15, 0] } : { y: 0 }}
                    transition={
                      animateWave
                        ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                        : { duration: 0 }
                    }
                    className="text-2xl sm:text-3xl md:text-5xl font-serif italic text-brand-cyan"
                    style={{
                      textShadow: "0 0 20px rgba(6,182,212,0.5)",
                    }}
                  >
                    {sentence}
                  </motion.div>
                ) : (
                  // English/Other: Split and animate each character
                  <div className="text-2xl sm:text-3xl md:text-5xl font-serif italic text-brand-cyan flex flex-wrap justify-center gap-0.5 sm:gap-1">
                    {sentence.split("").map((char, index) => (
                      <motion.span
                        key={index}
                        animate={animateWave ? { y: [0, -15, 0] } : { y: 0 }}
                        transition={
                          animateWave
                            ? { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.1 }
                            : { duration: 0 }
                        }
                        className="inline-block"
                        style={{
                          textShadow: "0 0 20px rgba(6,182,212,0.5)",
                          width: char === " " ? "0.5rem" : "auto"
                        }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* 3. From Bottom (Up) */}
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mt-4"
              >
                {t('vibe_text_3')}
              </motion.div>

              {/* 4. From Top (Down) - Delay slightly to land last */}
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                className="mt-6 md:mt-8 px-6 py-3 md:px-8 md:py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl"
              >
                <p className="text-brand-purpleLight font-mono text-base md:text-lg flex items-center gap-3">
                  <Zap size={20} className="fill-brand-purpleLight" />
                  {t('vibe_text_4')}
                </p>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default VibeCoding;