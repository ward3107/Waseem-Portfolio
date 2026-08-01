import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CalendarEmbedProps {
  className?: string;
}

// Env-gated Cal.com inline embed. Some visitors will not fill out a form
// but will happily book a 15-minute slot. If `VITE_CAL_URL` is set (either
// a full https://cal.com/... URL or a bare handle like "waseem/15min") we
// render the iframe; if not, we render nothing — no visible regression
// while the URL is still being provisioned.
const CalendarEmbed: React.FC<CalendarEmbedProps> = ({ className = '' }) => {
  const { t } = useLanguage();
  const raw = import.meta.env.VITE_CAL_URL;
  if (!raw) return null;

  const url = raw.startsWith('http') ? raw : `https://cal.com/${raw.replace(/^\/+/, '')}`;

  return (
    <div className={`w-full ${className}`}>
      <h3 className="text-sm sm:text-base font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200 mb-1">
        {t('booking_title')}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
        {t('booking_subtitle')}
      </p>
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
        <iframe
          src={url}
          title="Book a 15-minute call"
          loading="lazy"
          className="w-full h-[560px] sm:h-[620px] block"
        />
      </div>
    </div>
  );
};

export default CalendarEmbed;
