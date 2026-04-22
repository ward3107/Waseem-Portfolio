import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getPrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import HeroBackground from './HeroBackground';
import AnimatedHeadline from './AnimatedHeadline';
import ProfileCard from './ProfileCard';

const Hero: React.FC = () => {
  const { t, language } = useLanguage();
  const prefersReducedMotion = getPrefersReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);

  const layer1X = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
  const layer1Y = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);
  const layer2X = useTransform(mouseX, [-0.5, 0.5], [30, -30]);
  const layer2Y = useTransform(mouseY, [-0.5, 0.5], [30, -30]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleStartProject = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('name')?.focus(), 1000);
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center pt-20 overflow-visible bg-slate-50 dark:bg-slate-950 perspective-1000 transition-colors duration-300"
    >
      <HeroBackground mouseX={mouseX} mouseY={mouseY} prefersReducedMotion={prefersReducedMotion} />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center px-3 py-1 rounded-full border border-brand-green/30 bg-green-50 dark:bg-green-900/20 text-brand-green text-xs font-bold uppercase tracking-wider mb-6 shadow-sm"
          >
            <span className="relative flex h-2 w-2 mr-2">
              {!prefersReducedMotion && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            {t('hero_badge')}
          </motion.div>

          <AnimatedHeadline
            t={t}
            language={language}
            prefersReducedMotion={prefersReducedMotion}
            underlineX={layer1X}
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-6 md:mb-10 max-w-lg leading-relaxed font-medium break-words"
          >
            {t('hero_subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="flex flex-wrap gap-3 md:gap-4"
          >
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#contact"
              onClick={handleStartProject}
              className="group px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-slate-900 dark:bg-brand-purple text-white rounded-full font-bold text-xs sm:text-sm md:text-base shadow-xl hover:shadow-2xl shadow-brand-purple/20 transition-all flex items-center gap-1.5 sm:gap-2 md:gap-3"
            >
              {t('hero_cta_start')}
              {language === 'he' || language === 'ar' ? (
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#projects"
              className="px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-white dark:bg-transparent text-slate-800 dark:text-white border-2 border-slate-100 dark:border-slate-700 rounded-full font-bold text-xs sm:text-sm md:text-base hover:border-brand-purple/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 sm:gap-2"
            >
              {t('hero_cta_view')}
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="mt-6 sm:mt-8 md:mt-12 flex items-center gap-3 sm:gap-4 border-t border-slate-200/60 dark:border-slate-800 pt-4 sm:pt-6 md:pt-8"
          >
            <div>
              <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-brand-gold text-[10px] sm:text-xs md:text-sm">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('hero_trust')}
              </p>
            </div>
          </motion.div>
        </div>

        <ProfileCard
          t={t}
          prefersReducedMotion={prefersReducedMotion}
          rotateX={rotateX}
          rotateY={rotateY}
          layer1X={layer1X}
          layer1Y={layer1Y}
          layer2X={layer2X}
          layer2Y={layer2Y}
        />
      </div>
    </section>
  );
};

export default Hero;
