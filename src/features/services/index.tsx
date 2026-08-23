import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Code, Globe, Bot, Box, TrendingUp, Search } from 'lucide-react';
import { Service } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal';
import Dimensional3DWord, { fontForLanguage } from '@/shared/three/Dimensional3DWord';

const Services: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const contact = useContact();

  // Every "start a project" affordance funnels straight to WhatsApp — the
  // site's single conversion target — rather than scrolling to an on-page
  // form. Opens in a new tab so the portfolio stays put behind it.
  const scrollToContact = () => {
    window.open(contact.whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const localizedServices: Service[] = [
    { title: t('service_1_title'), description: t('service_1_desc'), icon: Code, color: 'text-brand-purple' },
    { title: t('service_2_title'), description: t('service_2_desc'), icon: Search, color: 'text-brand-blue' },
    { title: t('service_3_title'), description: t('service_3_desc'), icon: Bot, color: 'text-brand-teal' },
    { title: t('service_4_title'), description: t('service_4_desc'), icon: Globe, color: 'text-brand-orange' },
    { title: t('service_5_title'), description: t('service_5_desc'), icon: Box, color: 'text-brand-gold' },
    {
      title: t('service_marketing_title'),
      description: t('service_marketing_desc'),
      modalDescription: t('service_marketing_modal_desc'),
      icon: TrendingUp,
      color: 'text-brand-pink',
    },
  ];

  const handleStartProject = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToContact();
  };

  const handleModalCTA = () => {
    setSelectedService(null);
    scrollToContact();
  };

  return (
    <section
      id="what-i-do"
      className="py-8 sm:py-10 bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-300"
    >
      {/* Big decorative blobs: 120px blur radius forces the compositor to
          re-blur a huge surface. Halved to blur-3xl (~64px) and dropped the
          animate-pulse on the top-right one — the continuous opacity change
          was repainting the whole blurred layer every frame. */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 relative z-10 w-full">
        <div className="text-center mb-4 sm:mb-6 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-4 sm:mb-6"
          >
            <Sparkles size={12} className="text-brand-gold" />
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-slate-300 tracking-wide uppercase">
              {t('services_badge')}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2 sm:mb-3"
          >
            {t('services_title_1')}{' '}
            <Dimensional3DWord
              word={t('services_title_2')}
              font={fontForLanguage(language)}
              color="#9683d6"
              depthColor="#2b2168"
              fallbackClassName="inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan"
            />
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm md:text-base"
          >
            {t('services_subtitle')}
          </motion.p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3"
        >
          {localizedServices.map((service, index) => (
            <ServiceCard
              key={index}
              service={service}
              index={index}
              onClick={() => setSelectedService(service)}
              t={t}
              dir={dir}
            />
          ))}

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 100, damping: 15 },
              },
            }}
            onClick={handleStartProject}
            role="button"
            tabIndex={0}
            aria-label={t('services_cta_title')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToContact();
              }
            }}
            className="cursor-pointer group relative bg-gradient-to-br from-brand-purple via-brand-purpleLight to-brand-purpleDark rounded-lg sm:rounded-xl p-2.5 sm:p-3 overflow-hidden flex flex-col items-center justify-center text-center h-full border border-brand-purpleLight/40 shadow-2xl shadow-brand-purple/20 hover:shadow-brand-gold/30 transition-shadow duration-300"
          >
            {/* All CTA decorations removed at the user's request (rotating
                blurred blobs, floating sparkles, icon rotate, ping ring,
                button shimmer, hover-lift). Kept only the entrance animation
                inherited from the parent variants and static styling. */}
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/15 flex items-center justify-center mx-auto mb-1.5 sm:mb-2 backdrop-blur-md border border-white/30 shadow-2xl">
                <Sparkles size={16} className="text-brand-gold" />
              </div>

              <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 drop-shadow-lg">
                {t('services_cta_title')}
              </h3>
              <p className="text-purple-100/90 text-[11px] sm:text-xs mb-1.5 sm:mb-2 max-w-[140px] sm:max-w-[160px] mx-auto drop-shadow leading-relaxed">
                {t('services_cta_desc')}
              </p>

              <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-white to-slate-100 text-brand-purple font-bold rounded-lg shadow-lg inline-block text-[11px]">
                {t('services_cta_btn')}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <ServiceModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onCTA={handleModalCTA}
        t={t}
        dir={dir}
      />
    </section>
  );
};

export default Services;
