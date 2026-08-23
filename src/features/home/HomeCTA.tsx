import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { useContact } from '@/features/contact/useContact';

const HomeCTA: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'he' || language === 'ar';
  const prefersReducedMotion = usePrefersReducedMotion();
  const contact = useContact();

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center">
        <motion.h2
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-slate-900 dark:text-white mb-4"
        >
          {t('home_cta_title')}
        </motion.h2>
        <motion.p
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8"
        >
          {t('home_cta_desc')}
        </motion.p>
        <motion.a
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={contact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-8 py-4 bg-brand-purple text-white rounded-full font-bold text-base shadow-xl hover:shadow-2xl shadow-brand-purple/20 transition-all"
        >
          {t('home_cta_btn')}
          {isRtl ? (
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          ) : (
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          )}
        </motion.a>
      </div>
    </section>
  );
};

export default HomeCTA;
