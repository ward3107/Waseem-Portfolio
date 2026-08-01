import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useContact } from '@/features/contact/useContact';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackEvent } from '@/lib/browser';

// Floating WhatsApp CTA anchored to the bottom-right (bottom-left in RTL) on
// every public page. In the Israeli SMB market a one-tap WhatsApp handoff is
// table stakes — every competing freelancer offers it, and burying the
// contact link in a form at the bottom of the page leaks warm leads.
//
// The button auto-shows a small teaser bubble ~4s after mount on the first
// visit of the session so the visitor notices it above other page motion,
// then collapses to just the round icon. The bubble is dismissible with an
// explicit close button, and we don't re-open it during the same session.

const STORAGE_KEY = 'wa-teaser-dismissed';

const WhatsAppFloat: React.FC = () => {
  const { whatsappNumber } = useContact();
  const { t, language } = useLanguage();
  const [showTeaser, setShowTeaser] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const id = window.setTimeout(() => setShowTeaser(true), 4000);
    return () => window.clearTimeout(id);
  }, []);

  const dismissTeaser = () => {
    setShowTeaser(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Private-mode Safari throws on setItem — swallow, teaser just re-shows next visit.
    }
  };

  const message = t('wa_float_prefill');
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    trackEvent('generate_lead', { source: 'whatsapp_float', language });
    dismissTeaser();
  };

  return (
    // Force the whole widget to the bottom-right in every locale. In RTL
    // the ShareWidget + BackToTop stack lives on the LEFT (unflipped by
    // design), so any RTL flip on this widget would land it on top of
    // theirs. Global convention for WhatsApp CTAs is bottom-right anyway
    // (Intercom / Crisp / Tawk.to all do the same regardless of locale).
    // `dir="ltr"` keeps flex `items-end` predictable inside an RTL page.
    <div dir="ltr" className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2 print:hidden">
      <AnimatePresence>
        {showTeaser && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative max-w-[240px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-br-sm shadow-xl px-4 py-3 text-sm"
          >
            <button
              type="button"
              onClick={dismissTeaser}
              aria-label={t('wa_float_close')}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow"
            >
              <X size={12} />
            </button>
            {/* dir="auto" lets the browser pick per-paragraph direction from
                the first strong character — Hebrew/Arabic bubbles read RTL,
                English bubbles read LTR, without the outer dir="ltr" (which
                is there purely for absolute positioning) leaking into text. */}
            <p dir="auto" className="font-semibold text-slate-900 dark:text-white leading-tight">
              {t('wa_float_teaser_title')}
            </p>
            <p dir="auto" className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
              {t('wa_float_teaser_body')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label={t('wa_float_aria')}
        animate={{
          scale: [1, 1.06, 1],
          boxShadow: [
            '0 6px 20px rgba(37, 211, 102, 0.35)',
            '0 12px 32px rgba(37, 211, 102, 0.55)',
            '0 6px 20px rgba(37, 211, 102, 0.35)',
          ],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
        style={{ willChange: 'transform, box-shadow' }}
      >
        <MessageCircle size={26} className="drop-shadow" />
        <span className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping pointer-events-none" aria-hidden="true" />
      </motion.a>
    </div>
  );
};

export default WhatsAppFloat;
