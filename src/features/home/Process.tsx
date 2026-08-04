import React, { useState, useEffect } from 'react';
import { Search, PenTool, Code, Rocket, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const Process: React.FC = () => {
  const { t } = useLanguage();
  // Active step tracking for Sticky Desktop View
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      icon: Search,
      title: t('process_step_1_title'),
      desc: t('process_step_1_desc'),
      color: 'text-brand-blue',
      bg: 'bg-brand-blue/10',
    },
    {
      id: 2,
      icon: PenTool,
      title: t('process_step_2_title'),
      desc: t('process_step_2_desc'),
      color: 'text-brand-purple',
      bg: 'bg-brand-purple/10',
    },
    {
      id: 3,
      icon: Code,
      title: t('process_step_3_title'),
      desc: t('process_step_3_desc'),
      color: 'text-brand-green',
      bg: 'bg-brand-green/10',
    },
    {
      id: 4,
      icon: CheckCircle,
      title: t('process_step_4_title'),
      desc: t('process_step_4_desc'),
      color: 'text-brand-orange',
      bg: 'bg-brand-orange/10',
    },
    {
      id: 5,
      icon: Rocket,
      title: t('process_step_5_title'),
      desc: t('process_step_5_desc'),
      color: 'text-brand-gold',
      bg: 'bg-brand-gold/10',
    },
  ];

  // IntersectionObserver over the text blocks — replaces a per-scroll-event
  // querySelectorAll + getBoundingClientRect loop that forced a layout pass on
  // every scroll tick and was a top contributor to mid-page scroll jank.
  // rootMargin narrows the trigger band to the top half of the viewport so
  // the sticky graphic switches exactly where the old logic used to.
  useEffect(() => {
    const stepElements = document.querySelectorAll('.process-step-text');
    if (!stepElements.length || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(stepElements).indexOf(entry.target);
            if (index !== -1) setActiveStep(index);
          }
        });
      },
      { rootMargin: '0px 0px -50% 0px', threshold: 0 }
    );

    stepElements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="process" className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative transition-colors duration-300">

      {/* Desktop Sticky Layout — visual and text now feel like halves of the
          same idea:
           • text panel is wider (7/12 vs 5/12) so the description is what the
             eye lands on, not the decorative circle
           • text panel shows the SAME step icon prominently at the top, in
             the same color as the sticky graphic — the parallel is obvious
           • sticky visual is smaller and lighter so it supports rather than
             upstages the copy
           • a small "step N / total" indicator anchors both sides */}
      <div className="hidden lg:flex">
        {/* Left/right depends on `dir` — semantically "visual". */}
        <div className="w-5/12 h-screen sticky top-0 flex items-center justify-center bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          {/* Dark vignette — only in dark mode. In light mode the panel is
              white, so slate-900 fades at the top/bottom looked like a bug. */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-transparent dark:from-slate-900 dark:to-slate-900 z-10"></div>

          <div className="relative z-20 w-[240px] xl:w-[300px] h-[240px] xl:h-[300px] flex items-center justify-center">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                animate={{
                  opacity: activeStep === index ? 1 : 0,
                  scale: activeStep === index ? 1 : 0.8,
                  rotate: activeStep === index ? 0 : 20,
                }}
                transition={{ duration: 0.5, ease: 'backOut' }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-full border-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
                style={{
                  boxShadow: activeStep === index ? '0 0 50px -10px currentColor' : 'none',
                  color: activeStep === index ? 'white' : 'transparent',
                }}
              >
                <div className={`absolute inset-0 rounded-full opacity-20 animate-pulse ${step.bg.replace('/10', '/30')}`}></div>

                <div className={`p-4 rounded-2xl mb-3 ${step.bg} ${step.color}`}>
                  <step.icon size={36} strokeWidth={1.5} />
                </div>
                <h3 className={`text-2xl xl:text-3xl font-heading font-bold text-center mb-1 ${step.color}`}>
                  0{step.id}
                </h3>
                <h4 className="text-sm xl:text-base font-bold text-slate-600 dark:text-slate-300 text-center px-2">
                  {step.title}
                </h4>
              </motion.div>
            ))}

            {/* Step-progress rail: 5 dots stacked centered, current one grows.
                Reinforces the "these are steps" idea without more text. */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {steps.map((s, i) => (
                <span
                  key={s.id}
                  aria-hidden="true"
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    activeStep === i
                      ? `w-8 ${s.color.replace('text-', 'bg-')}`
                      : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Text panel — wider, and now visually echoes the sticky graphic. */}
        <div className="w-7/12">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`process-step-text min-h-screen flex items-center px-8 sm:px-12 lg:px-16 xl:px-24 py-16 lg:py-20 border-b border-slate-200/50 dark:border-slate-900/50 ${activeStep === index ? 'opacity-100' : 'opacity-40'} transition-opacity duration-500`}
            >
              <div className="max-w-xl">
                {/* Header row: matching icon + step badge — mirrors the sticky
                    graphic so the pairing is unmistakable. */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${step.bg} ${step.color} shrink-0`}>
                    <step.icon size={28} strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${step.color}`}>
                      {t('process_step_prefix')} 0{step.id}
                      <span className="ms-2 text-slate-400 dark:text-slate-600 font-normal normal-case tracking-normal">
                        · {step.id} / {steps.length}
                      </span>
                    </span>
                  </div>
                </div>

                <h3 className="text-3xl xl:text-4xl font-heading font-bold mb-5 text-slate-900 dark:text-white leading-tight">
                  {step.title}
                </h3>
                <div className="text-base xl:text-lg text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile / Tablet View (Standard Vertical Timeline).
          overflow-x-clip: the absolute connecting-line + icon-bubble dots
          were overflowing by ~4px in RTL and causing sideways scroll on
          Hebrew/Arabic mobile — clip locally so it can't escape. */}
      <div className="lg:hidden py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 overflow-x-clip">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">{t('process_mobile_title')}</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{t('process_mobile_desc')}</p>
        </div>

        <div className="relative space-y-10 sm:space-y-12">
          {/* Connecting Line */}
          <div className="absolute left-6 sm:left-8 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4 sm:gap-6 md:gap-8"
            >
              {/* Icon Bubble */}
              <div className={`relative z-10 flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl ${step.color}`}>
                <step.icon size={20} strokeWidth={2.5} className="sm:size-[24px] md:w-7 md:h-7" />
                {/* Connector dot */}
                <div className={`absolute -bottom-10 sm:-bottom-12 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-950 ${index === steps.length - 1 ? 'hidden' : ''}`}></div>
              </div>

              {/* Content Card */}
              <div className="pt-1 sm:pt-2 pb-6 sm:pb-8 flex-1">
                <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2 block ${step.color}`}>{t('process_step_prefix')} 0{step.id}</span>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">{step.title}</h3>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-2 border-slate-200 dark:border-slate-800 pl-3 sm:pl-4 whitespace-pre-line">
                  {step.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default Process;