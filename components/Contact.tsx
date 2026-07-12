import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import ProjectWizard from './ProjectWizard';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getPrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { CONTACT } from '../constants';
import Dimensional3DWord, { fontForLanguage } from './three/Dimensional3DWord';

const Contact: React.FC = () => {
  const { t, language } = useLanguage();

  // Check for reduced motion preference
  const prefersReducedMotion = getPrefersReducedMotion();

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-brand-purple/5 rounded-full blur-[80px] sm:blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-brand-cyan/5 rounded-full blur-[80px] sm:blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center">

          {/* Left Column: Copy & Info */}
          <div className="flex flex-col">
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : undefined}
              className="inline-flex items-center gap-2 px-3 py-1 sm:px-3 sm:py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-6 sm:mb-8 w-fit"
            >
              <span className="relative flex h-2 w-2">
                {!prefersReducedMotion && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {t('contact_avail')}
            </motion.div>

            <motion.h2
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-slate-900 dark:text-white mb-5 sm:mb-6 leading-tight"
            >
              {t('contact_title_1')} <br className="hidden sm:block" />
              <Dimensional3DWord
                word={t('contact_title_2')}
                font={fontForLanguage(language)}
                color="#9683d6"
                depthColor="#2b2168"
                fallbackClassName="inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan"
              />
            </motion.h2>

            <motion.p
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 mb-8 sm:mb-10 text-base sm:text-lg leading-relaxed max-w-lg"
            >
              {t('contact_desc')}
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
            >
              <a href={`mailto:${CONTACT.email}`} className="group flex flex-col p-4 sm:p-5 md:p-6 bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand-purple/20 hover:shadow-xl transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-brand-purple group-hover:text-white transition-colors mb-3 sm:mb-4 shadow-sm">
                  <Mail size={16} className="sm:w-5 sm:h-5" />
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('contact_email_btn')}</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base md:text-lg group-hover:text-brand-purple transition-colors break-all">{CONTACT.email}</p>
              </a>

              {/* Updated WhatsApp Block to be Green */}
              <a href={CONTACT.whatsappUrl} className="group flex flex-col p-4 sm:p-5 md:p-6 bg-green-50/50 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl sm:rounded-2xl border border-green-100 dark:border-green-900/30 hover:border-green-300 hover:shadow-xl hover:shadow-green-100 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white dark:bg-green-900/30 border border-green-100 dark:border-green-800 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:bg-green-600 group-hover:text-white transition-colors mb-3 sm:mb-4 shadow-sm">
                  <MessageSquare size={16} className="sm:w-5 sm:h-5" />
                </div>
                <p className="text-[11px] sm:text-xs text-green-600/80 dark:text-green-400/80 font-bold uppercase tracking-wider mb-1">{t('contact_whatsapp_btn')}</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base md:text-lg group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors" dir="ltr">{CONTACT.whatsappDisplay}</p>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.4 }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-purple/20 to-brand-cyan/20 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl transform rotate-3 scale-95 -z-10"></div>
            <ProjectWizard />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Contact;