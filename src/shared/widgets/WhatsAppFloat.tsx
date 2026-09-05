import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useContact } from '@/features/contact/useContact';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackEvent } from '@/lib/browser';

// The primary WhatsApp CTA, docked to the bottom edge of every public page the
// way an iOS app docks its main action. In the Israeli SMB market a one-tap
// WhatsApp handoff is table stakes, so it stays permanently reachable rather
// than hiding in a form at the bottom of the page.
//
// It used to be a round icon floating at the side that popped a teaser bubble
// open by itself a few seconds in. The bubble covered the page's own buttons
// and had to be dismissed, and the icon alone never said what it was. A docked
// bar carries its own label, so the teaser is gone entirely — the button IS
// the message.
//
// `env(safe-area-inset-bottom)` keeps it clear of the iPhone home indicator.
// The bar owns the bottom edge; BackToTop and the accessibility button sit
// above it. The cookie banner (z-50) deliberately covers it: consent first.

const WhatsAppFloat: React.FC = () => {
  const { whatsappNumber } = useContact();
  const { t, language } = useLanguage();

  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t('wa_float_prefill'))}`;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 print:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
    >
      {/* Centered dock: the WhatsApp CTA plus a trailing action slot. The
          experience portals its "chat" button into the slot so it sits beside
          this bar; on every other page the slot is empty (display:contents), so
          the pill stays perfectly centered and full-width. */}
      <div className="flex w-full max-w-sm items-center gap-2">
        <motion.a
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 220, damping: 26 }}
          whileTap={{ scale: 0.97 }}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('wa_float_aria')}
          onClick={() => trackEvent('generate_lead', { source: 'whatsapp_dock', language })}
          className="pointer-events-auto flex flex-1 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-6 py-3.5 text-base font-bold text-white shadow-2xl shadow-green-900/40 ring-1 ring-white/20 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
        >
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          {t('hero_cta_whatsapp')}
        </motion.a>
        <div id="assistant-dock-slot" className="contents" />
      </div>
    </div>
  );
};

export default WhatsAppFloat;
