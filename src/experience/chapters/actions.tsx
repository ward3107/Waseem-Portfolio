import React from 'react';
import { ArrowRight, ArrowLeft, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContact } from '@/features/contact/useContact';
import { useSectionNavigate } from '@/shared/hooks/useSectionNavigate';

// Shared CTA controls for chapter overlays. Every button re-enables pointer
// events (the overlay wrapper is pointer-events-none) and preserves the same
// WhatsApp-first, attribution-aware behaviour as the classic site.

const BASE =
  'pointer-events-auto flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-transform hover:scale-105 sm:text-base';

/** Primary WhatsApp deep link — the site's main conversion action. */
export const WhatsAppButton: React.FC<{ label?: string }> = ({ label }) => {
  const { t } = useLanguage();
  const contact = useContact();
  return (
    <a
      href={contact.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${BASE} bg-[#25D366] text-white shadow-xl shadow-green-500/30`}
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      {label ?? t('hero_cta_whatsapp')}
    </a>
  );
};

/** "Start a project" / "Book a consultation" — opens WhatsApp directly, the
 *  same conversion target as the primary CTA. */
export const StartProjectButton: React.FC<{ label?: string }> = ({ label }) => {
  const { t, language } = useLanguage();
  const contact = useContact();
  const Arrow = language === 'he' || language === 'ar' ? ArrowLeft : ArrowRight;
  return (
    <a
      href={contact.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${BASE} bg-brand-purple text-white shadow-xl shadow-brand-purple/30`}
    >
      {label ?? t('hero_cta_start')}
      <Arrow className="h-4 w-4" aria-hidden="true" />
    </a>
  );
};

/** Ghost link for internal navigation (e.g. View Work → /projects). */
export const GhostNavButton: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  const navigate = useSectionNavigate();
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
      className="pointer-events-auto rounded-full border-2 border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:border-brand-cyan/40 hover:bg-white/10 sm:text-base"
    >
      {children}
    </a>
  );
};
