import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, X, MessageCircle, Code, Globe, Bot, Layout, Box, TrendingUp } from 'lucide-react';
import { Service } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getPrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useFocusTrap, useEscapeKey } from '../hooks/useFocusTrap';

// Platform icons component with clean SVG paths
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 2.53H12v-4.54h10.56z"/>
    <path fill="#34A853" d="M12 22c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 18.86 7.7 22 12 22z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 4.14 2.18 7.5l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4">
    <path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.79c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path fill="#000000" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#E4405F" strokeWidth="2">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="18" cy="6" r="1" fill="#E4405F" stroke="none"/>
  </svg>
);

const PlatformIcons = () => (
  <div className="flex items-center gap-2 flex-wrap mt-1">
    <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-600 px-2 py-1 rounded-full">
      <GoogleIcon />
      <span>Google</span>
    </span>
    <span className="flex items-center gap-1 text-xs bg-blue-600/10 text-blue-600 px-2 py-1 rounded-full">
      <FacebookIcon />
      <span>Meta</span>
    </span>
    <span className="flex items-center gap-1 text-xs bg-pink-500/10 text-pink-600 px-2 py-1 rounded-full">
      <TikTokIcon />
      <span>TikTok</span>
    </span>
    <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded-full">
      <InstagramIcon />
      <span>Instagram</span>
    </span>
  </div>
);

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

const ServiceCard = ({ service, index, onClick, t, dir, prefersReducedMotion }: {
  service: Service;
  index: number;
  onClick: () => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  prefersReducedMotion: boolean;
}) => {
  const Icon = service.icon;
  const [isHovered, setIsHovered] = useState(false);
  const isRTL = dir === 'rtl';

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
      className={`cursor-pointer group relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 ${borderColorClass} rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 overflow-hidden transition-all duration-500 flex flex-col h-full shadow-lg hover:shadow-3xl ${glowColorClass} ${
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

      {/* Enhanced floating particles with more movement - Disabled for reduced motion */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            animate={{
              y: [0, -15, 0],
              x: [0, 5, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${service.color.replace('text-', 'bg-').split(' ')[0]}/50 blur-[1px] sm:blur-[2px]`}
          />
          <motion.div
            animate={{
              y: [0, 18, 0],
              x: [0, -5, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className={`absolute bottom-4 left-3 sm:bottom-8 sm:left-4 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${service.color.replace('text-', 'bg-').split(' ')[0]}/40 blur-[1px] sm:blur-[2px]`}
          />
          <motion.div
            animate={{
              x: [0, 12, 0],
              y: [0, 8, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className={`absolute top-1/2 right-4 sm:right-8 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${service.color.replace('text-', 'bg-').split(' ')[0]}/30 blur-[1px] sm:blur-[2px]`}
          />
        </>
      )}

      {/* Corner decorations with animation */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 left-0 w-12 h-12 sm:w-20 sm:h-20 border-t-2 sm:border-t-3 border-l-2 sm:border-l-3 border-slate-200 dark:border-slate-700 rounded-tl-2xl sm:rounded-tl-3xl transition-opacity duration-500"
      />
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 right-0 w-12 h-12 sm:w-20 sm:h-20 border-b-2 sm:border-b-3 border-r-2 sm:border-r-3 border-slate-200 dark:border-slate-700 rounded-br-2xl sm:rounded-br-3xl transition-opacity duration-500"
      />

      {/* Animated border glow */}
      <motion.div
        animate={{
          opacity: isHovered ? [0.3, 0.6, 0.3] : 0,
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute inset-0 rounded-2xl sm:rounded-3xl border-2 ${service.color.replace('text-', 'border-').split(' ')[0]}/30 pointer-events-none`}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Animated icon container */}
        <motion.div
          animate={isHovered ? {
            rotate: [0, -15, 15, -15, 0],
            scale: [1, 1.1, 1.15, 1.1, 1],
          } : {}}
          transition={{ duration: 0.6 }}
          className={`w-10 h-10 sm:w-14 md:w-16 sm:h-14 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-3 sm:mb-4 md:mb-6 transition-all duration-300 ${service.color} shadow-lg group-hover:shadow-2xl relative overflow-hidden`}
        >
          {/* Enhanced pulsing ring around icon */}
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className={`absolute inset-0 rounded-xl sm:rounded-2xl ${service.color.replace('text-', 'bg-').split(' ')[0]}/30`}
          />
          {/* Secondary pulse */}
          <motion.div
            animate={{
              scale: [1, 1.6, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className={`absolute inset-0 rounded-xl sm:rounded-2xl ${service.color.replace('text-', 'bg-').split(' ')[0]}/20`}
          />
          <Icon size={20} className="sm:size-24 md:size-32 relative z-10" />
        </motion.div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-purple group-hover:to-brand-cyan transition-all duration-300">
          {service.title}
        </h3>

        {/* Description */}
        <div className="mb-3 sm:mb-4 md:mb-6 flex-grow">
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {service.description}
          </p>
          {/* Platform Icons for Performance Marketing */}
          {service.title === t('service_marketing_title') && <PlatformIcons />}
        </div>

        {/* Animated CTA */}
        <motion.div
          whileHover={{ x: isRTL ? -8 : 8 }}
          className="pt-3 sm:pt-4 md:pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 group-hover:text-brand-purple dark:group-hover:text-white transition-colors"
        >
          <span className={isRTL ? 'ml-2' : 'mr-2'}>{t('projects_details')}</span>
          <motion.div
            animate={{ x: [0, isRTL ? -8 : 8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5 }}
          >
            {isRTL ? <ArrowLeft size={12} className="sm:size-14 md:size-16" /> : <ArrowRight size={12} className="sm:size-14 md:size-16" />}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Services: React.FC = () => {
  const { t, dir } = useLanguage();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = getPrefersReducedMotion();

  // Focus trap within modal
  const handleCloseModal = () => setSelectedService(null);
  useFocusTrap(modalRef, selectedService !== null);
  useEscapeKey(selectedService !== null, handleCloseModal);

  // Handle body scroll and previous element focus when modal is open
  useEffect(() => {
    if (selectedService && modalRef.current) {
      // Store the previously focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = '';

        // Return focus to the trigger element when modal closes
        previousActiveElementRef.current?.focus();
      };
    }
  }, [selectedService]);

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 relative z-10 w-full">

        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-4 sm:mb-6"
          >
            <Sparkles size={12} className="sm:size-14 text-brand-gold" />
            <span className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-slate-300 tracking-wide uppercase">{t('services_badge')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-4 sm:mb-6"
          >
            {t('services_title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-cyan">{t('services_title_2')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-slate-600 dark:text-slate-400 text-sm sm:text-base md:text-lg"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8"
        >
          {localizedServices.map((service, index) => (
            <ServiceCard
              key={index}
              service={service}
              index={index}
              onClick={() => setSelectedService(service)}
              t={t}
              dir={dir}
              prefersReducedMotion={prefersReducedMotion}
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
            className="cursor-pointer group relative bg-gradient-to-br from-brand-purple via-brand-purpleLight to-brand-purpleDark rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 overflow-hidden flex flex-col items-center justify-center text-center h-full border-2 border-brand-purpleLight/40 hover:border-brand-gold/50 transition-all duration-500 shadow-2xl shadow-brand-purple/20 hover:shadow-brand-gold/30"
          >
            {/* Animated background patterns */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 -right-6 sm:-top-10 sm:-right-10 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-brand-gold/30 to-transparent rounded-full blur-xl sm:blur-2xl"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-6 -left-6 sm:-bottom-10 sm:-left-10 w-24 h-24 sm:w-40 sm:h-40 bg-gradient-to-tr from-brand-cyan/30 to-transparent rounded-full blur-xl sm:blur-2xl"
            />

            {/* Floating sparkles */}
            <motion.div
              animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-4 left-4 sm:top-8 sm:left-8 text-brand-gold"
            >
              <Sparkles size={8} className="sm:size-12" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 20, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-6 right-6 sm:bottom-12 sm:right-12 text-brand-cyan"
            >
              <Sparkles size={8} className="sm:size-10" />
            </motion.div>
            <motion.div
              animate={{ x: [0, 15, 0], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute top-1/2 right-4 sm:right-6 text-white/40"
            >
              <Sparkles size={6} className="sm:size-8" />
            </motion.div>

            <div className="relative z-10">
              {/* Animated icon container */}
              <motion.div
                whileHover={{ rotate: [0, 15, -15, 0], scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 backdrop-blur-md border-2 border-white/30 shadow-2xl relative overflow-hidden"
              >
                {/* Pulsing glow */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-brand-gold/30 rounded-xl sm:rounded-2xl"
                />
                <Sparkles size={24} className="sm:size-36 text-brand-gold relative z-10" />
              </motion.div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 drop-shadow-lg">{t('services_cta_title')}</h3>
              <p className="text-purple-100/90 text-xs sm:text-sm mb-3 sm:mb-4 md:mb-6 max-w-[180px] sm:max-w-[200px] mx-auto drop-shadow leading-relaxed sm:leading-normal">{t('services_cta_desc')}</p>

              {/* Enhanced button */}
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-white to-slate-100 text-brand-purple font-bold rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all inline-block text-xs sm:text-sm relative overflow-hidden group"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              aria-hidden="true"
            />

            <motion.div
              ref={modalRef}
              layoutId={`service-${selectedService.title}`}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="service-modal-title"
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Fun Background Pattern */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse" aria-hidden="true"></div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <button
                  onClick={() => setSelectedService(null)}
                  aria-label={t('legal_close')}
                  className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 p-1.5 sm:p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple"
                >
                  <X size={16} className="sm:size-20" aria-hidden="true" />
                </button>

                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 sm:mb-6 border border-slate-200 dark:border-slate-700 shadow-[0_0_30px_rgba(72,58,160,0.3)]`} aria-hidden="true">
                  <selectedService.icon size={28} className="sm:size-40" />
                </div>

                <h3 id="service-modal-title" className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2">
                  {selectedService.title}
                </h3>

                <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full mb-4 sm:mb-6" aria-hidden="true"></div>

                <div className={`text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-5 sm:mb-6 md:mb-8 whitespace-pre-wrap ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {selectedService.modalDescription || selectedService.description}
                </div>

                <div className="flex flex-col gap-2.5 sm:gap-3 w-full">
                  <button
                    onClick={handleModalCTA}
                    className="w-full px-6 sm:px-8 py-2.5 sm:py-3 bg-brand-purple hover:bg-brand-purpleLight text-white font-bold rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-brand-purple/40 transform hover:-translate-y-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
                  >
                    {t('modal_btn')}
                  </button>

                  <a
                    href={`https://wa.me/972534260632?text=Hi, I'm interested in ${selectedService.title}...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-slate-400 hover:text-green-500 text-xs sm:text-sm font-bold transition-colors py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <MessageCircle size={14} className="sm:size-16" aria-hidden="true" />
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