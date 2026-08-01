import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Circle, Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TrustBadgesProps {
  className?: string;
  variant?: 'hero' | 'contact';
}

// Trust chips shown near primary CTAs. Cheap, high-signal reassurance:
// "yes, they're available; yes, they'll answer fast; yes, the first talk is
// free". Kept as a single small component so both the hero and contact
// section render an identical row instead of reimplementing the pattern.
const TrustBadges: React.FC<TrustBadgesProps> = ({ className = '', variant = 'hero' }) => {
  const { t } = useLanguage();

  const chips = [
    {
      icon: <Circle size={10} className="fill-emerald-400 text-emerald-400" />,
      label: t('trust_available'),
    },
    {
      icon: <Clock size={12} className="text-brand-cyan" />,
      label: t('trust_response'),
    },
    {
      icon: <Gift size={12} className="text-brand-gold" />,
      label: t('trust_free'),
    },
  ];

  const base =
    variant === 'hero'
      ? 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800';

  return (
    <div className={`flex flex-wrap justify-center items-center gap-2 sm:gap-3 ${className}`}>
      {chips.map((chip, i) => (
        <motion.span
          key={chip.label}
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 * i, duration: 0.3 }}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${base} text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-200 backdrop-blur-sm`}
        >
          {chip.icon}
          {chip.label}
        </motion.span>
      ))}
    </div>
  );
};

export default TrustBadges;
