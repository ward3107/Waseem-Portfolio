import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Service } from '@/types';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { useInView } from '@/shared/hooks/useInView';
import PlatformIcons from './PlatformIcons';
import { cardGradients, cardBorderColors, cardGlowColors } from './cardStyles';

interface ServiceCardProps {
  service: Service;
  index: number;
  onClick: () => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  prefersReducedMotion: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  index,
  onClick,
  t,
  dir,
  prefersReducedMotion,
}) => {
  const Icon = service.icon;
  const [isHovered, setIsHovered] = useState(false);
  const isRTL = dir === 'rtl';
  // Reactive to resize / device rotation so the 3D tilt turns on/off correctly.
  // We also use this as the gate for all decorative motion. It was previously
  // gated on `(hover: hover) and (pointer: fine)`, but Samsung devices with an
  // S-Pen (and other stylus phones) report themselves as hover+fine-pointer,
  // so the perpetual loops still ran on those phones — the slow-pulsing border
  // and floating dots the user saw, plus the scroll jank. A viewport-width
  // check can't be fooled by a stylus: phones/tablets never light these up.
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  // Gate the always-on decorative animations behind visibility AND a real
  // desktop viewport. Each card mounts ~7 infinite Framer animations (shine
  // sweeps, blurred floating dots, ping rings, arrow bounce); with 6 cards
  // that's 40+ perpetual rAF loops — animating blurred layers is especially
  // costly on a mobile GPU. On phones/tablets we drop them entirely (no
  // perceptible loss on a small screen); on desktop we still hard-remove them
  // when the section scrolls off-screen so the compositor/JS thread stop
  // churning.
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, '200px');
  const animate = inView && !prefersReducedMotion && isDesktop;
  // The hover-driven pulses (gradient wash + border glow) loop forever for as
  // long as `isHovered` is true. A stylus hovering over a card while the user
  // scrolls can flip that on, starting the slow blink around each card on a
  // phone. Require a desktop viewport so only a real mouse hover triggers them.
  const hoverPulse = isHovered && isDesktop && !prefersReducedMotion;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  const rotateX = useTransform(mouseY, [-10, 10], [-3, 3]);
  const rotateY = useTransform(mouseX, [-10, 10], [3, -3]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDesktop || prefersReducedMotion) return;
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
  const colorBase = service.color.replace('text-', 'bg-').split(' ')[0];
  const borderBase = service.color.replace('text-', 'border-').split(' ')[0];

  const transformStyle = isDesktop && !prefersReducedMotion ? { rotateX, rotateY } : {};

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      whileHover={{ y: -12, scale: 1.03 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${service.title} — ${t('projects_details')}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={transformStyle}
      className={`cursor-pointer group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${borderColorClass} rounded-lg sm:rounded-xl p-2.5 sm:p-3 overflow-hidden transition-all duration-500 flex flex-col h-full shadow-lg hover:shadow-3xl ${glowColorClass} ${
        service.title === t('service_3_title') || service.title === t('service_marketing_title')
          ? 'lg:col-span-2'
          : 'col-span-1'
      }`}
    >
      <motion.div
        animate={{
          opacity: hoverPulse ? [0.5, 1, 0.5] : 0,
          scale: hoverPulse ? [1, 1.1, 1] : 1,
        }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity }}
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} transition-opacity duration-500`}
      />
      {animate && (
        <>
          <motion.div
            animate={{ x: ['-100%', '250%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
          />
          <motion.div
            animate={{ x: ['-100%', '250%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          />
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 5, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${colorBase}/50 blur-[1px] sm:blur-[2px]`}
          />
          <motion.div
            animate={{ y: [0, 18, 0], x: [0, -5, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className={`absolute bottom-4 left-3 sm:bottom-8 sm:left-4 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${colorBase}/40 blur-[1px] sm:blur-[2px]`}
          />
          <motion.div
            animate={{ x: [0, 12, 0], y: [0, 8, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className={`absolute top-1/2 right-4 sm:right-8 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${colorBase}/30 blur-[1px] sm:blur-[2px]`}
          />
        </>
      )}

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

      <motion.div
        animate={{ opacity: hoverPulse ? [0.3, 0.6, 0.3] : 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity }}
        className={`absolute inset-0 rounded-2xl sm:rounded-3xl border-2 ${borderBase}/30 pointer-events-none`}
      />

      <div className="relative z-10 flex flex-col h-full">
        <motion.div
          animate={isHovered ? { rotate: [0, -15, 15, -15, 0], scale: [1, 1.1, 1.15, 1.1, 1] } : {}}
          transition={{ duration: 0.6 }}
          className={`w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-1.5 sm:mb-2 transition-all duration-300 ${service.color} shadow-lg group-hover:shadow-2xl relative overflow-hidden`}
        >
          {animate && (
            <>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className={`absolute inset-0 rounded-xl sm:rounded-2xl ${colorBase}/30`}
              />
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className={`absolute inset-0 rounded-xl sm:rounded-2xl ${colorBase}/20`}
              />
            </>
          )}
          <Icon size={16} className="relative z-10" />
        </motion.div>

        <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1 sm:mb-1.5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-purple group-hover:to-brand-cyan transition-all duration-300">
          {service.title}
        </h3>

        <div className="mb-1.5 sm:mb-2 flex-grow">
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            {service.description}
          </p>
          {service.title === t('service_marketing_title') && <PlatformIcons />}
        </div>

        <motion.div
          whileHover={{ x: isRTL ? -8 : 8 }}
          className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/50 flex items-center text-[11px] font-bold text-slate-600 dark:text-slate-500 group-hover:text-brand-purple dark:group-hover:text-white transition-colors"
        >
          <span className={isRTL ? 'ml-2' : 'mr-2'}>{t('projects_details')}</span>
          <motion.div
            animate={animate ? { x: [0, isRTL ? -8 : 8, 0] } : {}}
            transition={animate ? { duration: 1.2, repeat: Infinity, repeatDelay: 0.5 } : { duration: 0 }}
          >
            {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
