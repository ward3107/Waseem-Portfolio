import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import { useContact } from '@/features/contact/useContact';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackEvent } from '@/lib/browser';
import { useFocusTrap, useEscapeKey } from '@/shared/hooks/useFocusTrap';

// Desktop exit-intent modal. Fires once per session when the pointer leaves
// the top edge of the viewport (typical tab-close / URL-bar gesture). Skipped
// entirely on touch devices — there is no "leave to top" signal on mobile,
// and pop-ups on mobile hurt more than they help.
//
// Content is a soft offer: free 15-min consultation via WhatsApp. Purpose is
// to convert the visitor about to bail, not to gate the site — the CTA opens
// WhatsApp in a new tab and the modal is trivially dismissable.

const STORAGE_KEY = 'exit-intent-shown';
const IDLE_MS = 30_000; // don't fire in the first 30s — the user is still browsing.

const ExitIntent: React.FC = () => {
  const { whatsappNumber } = useContact();
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const armedRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, open);
  useEscapeKey(open, () => setOpen(false));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const armId = window.setTimeout(() => {
      armedRef.current = true;
    }, IDLE_MS);

    const onLeave = (e: MouseEvent) => {
      if (!armedRef.current) return;
      if (e.clientY > 0) return;
      armedRef.current = false;
      setOpen(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        // Private-mode Safari — noop, exit-intent then re-fires once next tab.
      }
      trackEvent('exit_intent_shown', { language });
    };

    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.clearTimeout(armId);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [language]);

  const handleCta = () => {
    const msg = t('exit_intent_wa_prefill');
    trackEvent('generate_lead', { source: 'exit_intent', language });
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-intent-title"
        >
          <motion.div
            ref={dialogRef}
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative max-w-md w-full bg-slate-900 border-2 border-brand-gold rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(212,175,55,0.35)]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('exit_intent_close')}
              className="absolute top-3 right-3 rtl:right-auto rtl:left-3 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70"
            >
              <X size={16} />
            </button>

            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center shadow-lg rotate-3">
              <Gift size={30} className="text-slate-900" />
            </div>

            <h2 id="exit-intent-title" className="text-2xl sm:text-3xl font-black text-white mb-2 font-heading uppercase tracking-wide">
              {t('exit_intent_title')}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-6">
              {t('exit_intent_body')}
            </p>

            <button
              type="button"
              onClick={handleCta}
              className="w-full py-3 sm:py-4 bg-brand-gold hover:bg-yellow-400 text-slate-900 font-bold uppercase tracking-wider rounded-lg shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/50 transition-all"
            >
              {t('exit_intent_cta')}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 focus:outline-none"
            >
              {t('exit_intent_skip')}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntent;
