import React, { useState, useEffect } from 'react';
import { Search, PenTool, Code, Rocket, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

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

  // We'll use IntersectionObservers on the text blocks to trigger the sticky graphic updates
  useEffect(() => {
    const handleScroll = () => {
      const stepElements = document.querySelectorAll('.process-step-text');
      stepElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        // If the element is near the center of the viewport
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
          setActiveStep(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="process" className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative transition-colors duration-300">

      {/* Desktop Sticky Layout */}
      <div className="hidden lg:flex">
        {/* Left Sticky Panel (Visuals) */}
        <div className="w-1/2 h-screen sticky top-0 flex items-center justify-center bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden relative">

          {/* Background Grid Animation */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 via-transparent to-slate-900 z-10"></div>

          {/* Active Step Graphic */}
          <div className="relative z-20 w-[280px] sm:w-[350px] md:w-[400px] h-[280px] sm:h-[350px] md:h-[400px] flex items-center justify-center">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                animate={{
                  opacity: activeStep === index ? 1 : 0,
                  scale: activeStep === index ? 1 : 0.8,
                  rotate: activeStep === index ? 0 : 20,
                }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 rounded-full border-3 sm:border-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
                style={{
                  boxShadow: activeStep === index ? `0 0 50px -10px currentColor` : 'none',
                  color: activeStep === index ? 'white' : 'transparent'
                }}
              >
                {/* Glowing Ring */}
                <div className={`absolute inset-0 rounded-full opacity-20 animate-pulse ${step.bg.replace('/10', '/30')}`}></div>

                <div className={`p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl mb-3 sm:mb-4 md:mb-6 ${step.bg} ${step.color}`}>
                  <step.icon size={32} strokeWidth={1.5} className="sm:w-10 sm:h-10 md:w-12 md:h-12" />
                </div>
                <h3 className={`text-xl sm:text-2xl md:text-3xl font-heading font-bold text-center mb-1 sm:mb-2 ${step.color}`}>
                  0{step.id}
                </h3>
                <h4 className="text-sm sm:text-base md:text-xl font-bold text-slate-600 dark:text-slate-300">
                  {step.title}
                </h4>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Scroll Panel (Text) */}
        <div className="w-1/2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`process-step-text min-h-screen flex items-center px-8 sm:px-12 lg:px-16 py-16 lg:py-20 border-b border-slate-200/50 dark:border-slate-900/50 ${activeStep === index ? 'opacity-100' : 'opacity-30'} transition-opacity duration-500`}
            >
              <div>
                <span className={`inline-block px-3 py-1 rounded mb-3 sm:mb-4 text-xs font-bold uppercase tracking-widest ${step.bg} ${step.color}`}>
                  {t('process_step_prefix')} 0{step.id}
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-4 sm:mb-6 text-slate-900 dark:text-white leading-tight">
                  {step.title}
                </h3>
                <div className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile / Tablet View (Standard Vertical Timeline) */}
      <div className="lg:hidden py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10">
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
              <div className={`relative z-10 flex-shrink-0 w-12 h-12 sm:w-14 sm:h-16 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl ${step.color}`}>
                <step.icon size={20} strokeWidth={2.5} className="sm:size-[24px] md:size-28" />
                {/* Connector dot */}
                <div className={`absolute -bottom-10 sm:-bottom-12 left-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-950 ${index === steps.length - 1 ? 'hidden' : ''}`}></div>
              </div>

              {/* Content Card */}
              <div className="pt-1 sm:pt-2 pb-6 sm:pb-8 flex-1">
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2 block ${step.color}`}>{t('process_step_prefix')} 0{step.id}</span>
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