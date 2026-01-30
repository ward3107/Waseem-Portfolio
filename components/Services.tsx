import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, X, MessageCircle, Code, Globe, Bot, Layout, Box, TrendingUp } from 'lucide-react';
import { Service } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// Card-specific gradient configurations
const cardGradients = [
  'from-purple-500/10 via-purple-400/5 to-transparent',
  'from-blue-500/10 via-blue-400/5 to-transparent',
  'from-teal-500/10 via-teal-400/5 to-transparent',
  'from-orange-500/10 via-orange-400/5 to-transparent',
  'from-amber-500/10 via-amber-400/5 to-transparent',
  'from-pink-500/10 via-pink-400/5 to-transparent',
];

const cardBorderColors = [
  'group-hover:border-purple-400/50',
  'group-hover:border-blue-400/50',
  'group-hover:border-teal-400/50',
  'group-hover:border-orange-400/50',
  'group-hover:border-amber-400/50',
  'group-hover:border-pink-400/50',
];

const cardGlowColors = [
  'group-hover:shadow-purple-500/20',
  'group-hover:shadow-blue-500/20',
  'group-hover:shadow-teal-500/20',
  'group-hover:shadow-orange-500/20',
  'group-hover:shadow-amber-500/20',
  'group-hover:shadow-pink-500/20',
];

// Floating particles for visual interest
const FloatingParticles = ({ color }: { color: string }) => (
  <>
    <motion.div
      animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute top-4 right-4 w-2 h-2 rounded-full ${color} blur-[1px]`}
    />
    <motion.div
      animate={{ y: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      className={`absolute bottom-8 left-4 w-1.5 h-1.5 rounded-full ${color} blur-[1px]`}
    />
    <motion.div
      animate={{ x: [0, 10, 0], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className={`absolute top-1/2 right-8 w-1 h-1 rounded-full ${color} blur-[1px]`}
    />
  </>
);

const ServiceCard = ({ service, index, onClick, t }: {
  service: Service;
  index: number;
  onClick: () => void;
  t: (key: string) => string;
}) => {
  const Icon = service.icon;
  const [isHovered, setIsHovered] = useState(false);

  // Only enable 3D tilt on desktop (lg breakpoint and above)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only apply 3D tilt on desktop
    if (!isDesktop) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / 20);
    y.set((e.clientY - centerY) / 20);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const gradientClass = cardGradients[index] || cardGradients[0];
  const borderColorClass = cardBorderColors[index] || cardBorderColors[0];
  const glowColorClass = cardGlowColors[index] || cardGlowColors[0];

  // Card entrance animation - controlled by parent stagger
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
  };

  // Only apply 3D transform styles on desktop
  const transformStyle = isDesktop ? {
    rotateX: useTransform(mouseY, [-10, 10], [-3, 3]),
    rotateY: useTransform(mouseX, [-10, 10], [3, -3])
  } : {};

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -12, scale: 1.03 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={transformStyle}
      className={`cursor-pointer group relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 ${borderColorClass} rounded-3xl p-8 overflow-hidden transition-all duration-500 flex flex-col h-full shadow-lg hover:shadow-3xl ${glowColorClass} ${
        service.title === t('service_3_title') || service.title === t('service_marketing_title')
          ? 'lg:col-span-2'
          : 'col-span-1'
      }`}
    >
      {/* Animated gradient background with pulse */}
      <motion.div
        animate={{
          opacity: isHovered ? [0.5, 1, 0.5] : 0,
          scale: isHovered ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} transition-opacity duration-500`}
      />

      {/* Dramatic shimmer effect - always visible but subtle */}
      <motion.div
        animate={{ x: ['-100%', '250%'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
      />

      {/* Additional hover shimmer */}
      <motion.div
        animate={{ x: ['-100%', '250%'] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      />

      {/* Enhanced floating particles with more movement */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          x: [0, 5, 0],
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${service.color.replace('text-', 'bg-').split(' ')[0]}/50 blur-[2px]`}
      />
      <motion.div
        animate={{
          y: [0, 18, 0],
          x: [0, -5, 0],
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className={`absolute bottom-8 left-4 w-2 h-2 rounded-full ${service.color.replace('text-', 'bg-').split(' ')[0]}/40 blur-[2px]`}
      />
      <motion.div
        animate={{
          x: [0, 12, 0],
          y: [0, 8, 0],
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.4, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className={`absolute top-1/2 right-8 w-1.5 h-1.5 rounded-full ${service.color.replace('text-', 'bg-').split(' ')[0]}/30 blur-[2px]`}
      />

      {/* Corner decorations with animation */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 left-0 w-20 h-20 border-t-3 border-l-3 border-slate-200 dark:border-slate-700 rounded-tl-3xl transition-opacity duration-500"
      />
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 right-0 w-20 h-20 border-b-3 border-r-3 border-slate-200 dark:border-slate-700 rounded-br-3xl transition-opacity duration-500"
      />

      {/* Animated border glow */}
      <motion.div
        animate={{
          opacity: isHovered ? [0.3, 0.6, 0.3] : 0,
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute inset-0 rounded-3xl border-2 ${service.color.replace('text-', 'border-').split(' ')[0]}/30 pointer-events-none`}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Animated icon container */}
        <motion.div
          animate={isHovered ? {
            rotate: [0, -15, 15, -15, 0],
            scale: [1, 1.1, 1.15, 1.1, 1],
          } : {}}
          transition={{ duration: 0.6 }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-6 transition-all duration-300 ${service.color} shadow-lg group-hover:shadow-2xl relative overflow-hidden`}
        >
          {/* Enhanced pulsing ring around icon */}
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className={`absolute inset-0 rounded-2xl ${service.color.replace('text-', 'bg-').split(' ')[0]}/30`}
          />
          {/* Secondary pulse */}
          <motion.div
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className={`absolute inset-0 rounded-2xl ${service.color.replace('text-', 'bg-').split(' ')[0]}/20`}
          />
          <Icon size={32} className="relative z-10" />
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-purple group-hover:to-brand-cyan transition-all duration-300">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-6 flex-grow">
          {service.description}
        </p>

        {/* Animated CTA */}
        <motion.div
          whileHover={{ x: 8 }}
          className="pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center text-sm font-bold text-slate-400 dark:text-slate-500 group-hover:text-brand-purple dark:group-hover:text-white transition-colors"
        >
          <span className="mr-2">{t('projects_details')}</span>
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5 }}
          >
            <ArrowRight size={16} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Services: React.FC = () => {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const localizedServices: Service[] = [
    {
      title: t('service_1_title'),
      description: t('service_1_desc'),
      icon: Code,
      color: 'text-brand-purple'
    },
    {
      title: t('service_2_title'),
      description: t('service_2_desc'),
      icon: Layout,
      color: 'text-brand-blue'
    },
    {
      title: t('service_3_title'),
      description: t('service_3_desc'),
      icon: Bot,
      color: 'text-brand-teal'
    },
    {
      title: t('service_4_title'),
      description: t('service_4_desc'),
      icon: Globe,
      color: 'text-brand-orange'
    },
    {
      title: t('service_5_title'),
      description: t('service_5_desc'),
      icon: Box,
      color: 'text-brand-gold'
    },
    {
      title: t('service_marketing_title'),
      description: t('service_marketing_desc'),
      modalDescription: t('service_marketing_modal_desc'),
      icon: TrendingUp,
      color: 'text-brand-pink'
    }
  ];

  const handleStartProject = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.focus();
      }, 800);
    }
  };

  const handleModalCTA = () => {
    setSelectedService(null);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.focus();
      }, 800);
    }
  };

  return (
    <section
      id="what-i-do"
      className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-300"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-cyan/10 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10 w-full">

        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6"
          >
            <Sparkles size={14} className="text-brand-gold" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-300 tracking-wide uppercase">{t('services_badge')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-6"
          >
            {t('services_title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">{t('services_title_2')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-slate-600 dark:text-slate-400 text-lg"
          >
            {t('services_subtitle')}
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {localizedServices.map((service, index) => (
            <ServiceCard
              key={index}
              service={service}
              index={index}
              onClick={() => setSelectedService(service)}
              t={t}
            />
          ))}

          {/* CTA Card - Enhanced with more visual effects */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: "spring", stiffness: 100, damping: 15 }
              }
            }}
            onClick={handleStartProject}
            whileHover={{ scale: 1.03, y: -5 }}
            className="cursor-pointer group relative bg-gradient-to-br from-brand-purple via-brand-purpleLight to-brand-purpleDark rounded-3xl p-8 overflow-hidden flex flex-col items-center justify-center text-center h-full border-2 border-brand-purpleLight/40 hover:border-brand-gold/50 transition-all duration-500 shadow-2xl shadow-brand-purple/20 hover:shadow-brand-gold/30"
          >
            {/* Animated background patterns */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-brand-gold/30 to-transparent rounded-full blur-2xl"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-brand-cyan/30 to-transparent rounded-full blur-2xl"
            />

            {/* Floating sparkles */}
            <motion.div
              animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-8 left-8 text-brand-gold"
            >
              <Sparkles size={12} />
            </motion.div>
            <motion.div
              animate={{ y: [0, 20, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-12 right-12 text-brand-cyan"
            >
              <Sparkles size={10} />
            </motion.div>
            <motion.div
              animate={{ x: [0, 15, 0], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute top-1/2 right-6 text-white/40"
            >
              <Sparkles size={8} />
            </motion.div>

            <div className="relative z-10">
              {/* Animated icon container */}
              <motion.div
                whileHover={{ rotate: [0, 15, -15, 0], scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6 backdrop-blur-md border-2 border-white/30 shadow-2xl relative overflow-hidden"
              >
                {/* Pulsing glow */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-brand-gold/30 rounded-2xl"
                />
                <Sparkles size={36} className="text-brand-gold relative z-10" />
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{t('services_cta_title')}</h3>
              <p className="text-purple-100/90 text-sm mb-6 max-w-[200px] mx-auto drop-shadow">{t('services_cta_desc')}</p>

              {/* Enhanced button */}
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-white to-slate-100 text-brand-purple font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all inline-block text-sm relative overflow-hidden group"
              >
                <span className="relative z-10">{t('services_cta_btn')}</span>
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent skew-x-12"
                />
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive Popup Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              layoutId={`service-${selectedService.title}`}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              {/* Fun Background Pattern */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute -top-2 -right-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-red-500 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className={`w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700 shadow-[0_0_30px_rgba(72,58,160,0.3)]`}>
                  <selectedService.icon size={40} className={selectedService.color} />
                </div>

                <h3 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2">
                  {selectedService.title}
                </h3>

                <div className="h-1 w-20 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full mb-6"></div>

                <div className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-8 text-left whitespace-pre-wrap">
                  {selectedService.modalDescription || selectedService.description}
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={handleModalCTA}
                    className="w-full px-8 py-3 bg-brand-purple hover:bg-brand-purpleLight text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-brand-purple/40 transform hover:-translate-y-1"
                  >
                    {t('modal_btn')}
                  </button>

                  <a
                    href={`https://wa.me/972534260632?text=Hi, I'm interested in ${selectedService.title}...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-slate-400 hover:text-green-500 text-sm font-bold transition-colors py-2"
                  >
                    <MessageCircle size={16} />
                    {t('modal_whatsapp')}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Services;