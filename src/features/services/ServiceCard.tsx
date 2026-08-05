import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Service } from '@/types';
import PlatformIcons from './PlatformIcons';

interface ServiceCardProps {
  service: Service;
  index: number;
  onClick: () => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

/**
 * Service card — intentionally static. Every decorative animation on this card
 * (corner brackets, border-glow pulse, gradient wash pulse, shine sweeps,
 * floating dots, icon ping rings, icon hover-rotate, arrow bounce loop, 3D
 * tilt, hover-lift) has been removed at the user's request: they read as bugs
 * on mobile (Samsung S-Pen fires hover events that lit them up) and the user
 * asked to strip them from desktop too. The card keeps only:
 *   - a one-time entrance animation (opacity + y, staggered by the parent)
 *   - the parent staggered layout
 *   - basic hover styling from Tailwind's `hover:` classes (shadow bump,
 *     title gradient, arrow-row color change) which are compositor-only and
 *     don't loop.
 */
const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onClick,
  t,
  dir,
}) => {
  const Icon = service.icon;
  const isRTL = dir === 'rtl';

  return (
    <motion.div
      variants={cardVariants}
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
      className={`cursor-pointer group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 overflow-hidden flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 ${
        service.title === t('service_3_title') || service.title === t('service_marketing_title')
          ? 'lg:col-span-2'
          : 'col-span-1'
      }`}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div
          className={`w-8 h-8 sm:w-9 md:w-10 sm:h-9 md:h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-1.5 sm:mb-2 ${service.color} shadow-lg relative overflow-hidden`}
        >
          <Icon size={16} className="relative z-10" />
        </div>

        <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white mb-1 sm:mb-1.5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-purple group-hover:to-brand-cyan transition-all duration-300">
          {service.title}
        </h3>

        <div className="mb-1.5 sm:mb-2 flex-grow">
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            {service.description}
          </p>
          {service.title === t('service_marketing_title') && <PlatformIcons />}
        </div>

        <div className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/50 flex items-center text-[11px] font-bold text-slate-600 dark:text-slate-500 group-hover:text-brand-purple dark:group-hover:text-white transition-colors">
          <span className={isRTL ? 'ml-2' : 'mr-2'}>{t('projects_details')}</span>
          {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
