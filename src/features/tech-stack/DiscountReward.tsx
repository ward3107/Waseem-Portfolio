import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFocusTrap, useEscapeKey } from '@/shared/hooks/useFocusTrap';
import { playSound } from './audio';
import { submitDiscountLead } from '@/lib/content/discountLeads';
import { trackEvent } from '@/lib/browser';
import { safeGetItem, safeSetItem } from '@/lib/safeStorage';

interface DiscountRewardProps {
  onClose: () => void;
  percent: number;
  code: string;
  isFinal: boolean;
}

const formatPercent = (p: number): string => `${p}%`;

// A contact is valid if it looks like an email OR a phone number with at
// least 8 digits (Israeli mobiles are 10; leave headroom for other formats).
// Kept intentionally loose — the intent is to reject "asdf" and typos, not
// to be a strict validator.
const isValidContact = (value: string): boolean => {
  const v = value.trim();
  if (!v) return false;
  const emailish = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const digits = v.replace(/\D/g, '');
  const phoneish = digits.length >= 8;
  return emailish || phoneish;
};

const LEAD_STORAGE_KEY = 'discount-lead-submitted';

const DiscountReward: React.FC<DiscountRewardProps> = ({ onClose, percent, code, isFinal }) => {
  const { t, language } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Repeat visitors that already gave contact info skip the form and see the
  // code straight away — otherwise the gate turns into friction, not a
  // conversion moment.
  const alreadySubmitted = Boolean(safeGetItem(LEAD_STORAGE_KEY));

  const [revealed, setRevealed] = useState(alreadySubmitted);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useFocusTrap(dialogRef, true);
  useEscapeKey(true, onClose);

  useEffect(() => {
    if (revealed) {
      playSound(isFinal ? 'finale' : 'redeem');
    }
  }, [revealed, isFinal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim() || !isValidContact(contact)) {
      setError(t('tech_lead_invalid'));
      return;
    }
    setError(null);
    setSubmitting(true);

    const ok = await submitDiscountLead({
      name: name.trim(),
      contact: contact.trim(),
      percent,
      code,
      language,
    });

    if (!ok) {
      setWarning(t('tech_lead_error'));
    }

    trackEvent('generate_lead', {
      source: 'discount_game',
      percent,
      code,
      saved: ok,
      language,
    });

    safeSetItem(LEAD_STORAGE_KEY, '1');

    setSubmitting(false);
    setRevealed(true);
  };

  return (
    <div
      ref={dialogRef}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="win-title"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        className="bg-slate-900 border-2 border-brand-gold p-1 rounded-2xl shadow-[0_0_60px_rgba(212,175,55,0.3)] max-w-md w-full relative"
        style={{ willChange: 'transform, opacity' }}
      >
        <div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent"
          aria-hidden="true"
        ></div>
        <div className="p-6 sm:p-8 text-center relative overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(212,175,55,0.1)_0deg,transparent_60deg,rgba(212,175,55,0.1)_120deg,transparent_180deg)] animate-[spin_10s_linear_infinite] pointer-events-none"
            style={{ willChange: 'transform' }}
            aria-hidden="true"
          ></div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-brand-gold to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl border border-yellow-300 rotate-3 relative z-10"
          >
            <Gift size={36} className="text-slate-900" />
          </motion.div>

          <h2
            id="win-title"
            className="text-3xl sm:text-4xl font-black text-white mb-2 font-heading tracking-tight relative z-10"
          >
            {revealed ? (isFinal ? t('tech_win_title') : t('tech_reward_title')) : t('tech_lead_title')}
          </h2>
          <p className="text-slate-300 mb-4 sm:mb-6 font-mono text-sm relative z-10">
            {revealed ? (isFinal ? t('tech_win_desc') : t('tech_reward_desc')) : t('tech_lead_desc')}
          </p>

          <div className="text-5xl sm:text-6xl font-black text-brand-gold mb-6 relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]">
            {formatPercent(percent)}
          </div>

          {!revealed ? (
            <form onSubmit={handleSubmit} className="relative z-10 text-left rtl:text-right space-y-3 mb-4">
              <div>
                <label htmlFor="lead-name" className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                  {t('tech_lead_name')}
                </label>
                <input
                  id="lead-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('tech_lead_name_placeholder')}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-brand-gold rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 transition"
                />
              </div>
              <div>
                <label htmlFor="lead-contact" className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                  {t('tech_lead_contact')}
                </label>
                <input
                  id="lead-contact"
                  type="text"
                  autoComplete="tel"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={t('tech_lead_contact_placeholder')}
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-brand-gold rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 transition"
                />
              </div>
              {error && (
                <p role="alert" className="text-xs text-red-400 font-mono">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 sm:py-4 bg-brand-gold hover:bg-yellow-400 text-slate-900 font-bold uppercase tracking-wider rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-gold/50 transition-all disabled:opacity-60 disabled:cursor-wait"
              >
                {submitting ? '…' : t('tech_lead_submit')}
              </button>
            </form>
          ) : (
            <>
              {warning && (
                <p className="text-[11px] text-amber-400 font-mono mb-3 relative z-10">{warning}</p>
              )}
              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 relative z-10">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-2">
                  {t('tech_win_code')}
                </p>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-brand-cyan tracking-widest select-all drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                  {code}
                </div>
              </div>

              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="w-full py-3 sm:py-4 bg-brand-gold hover:bg-yellow-400 text-slate-900 font-bold uppercase tracking-wider rounded-lg shadow-lg relative z-10 focus:outline-none focus:ring-4 focus:ring-brand-gold/50 transition-all"
              >
                {isFinal ? t('tech_win_btn') : t('tech_reward_btn')}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DiscountReward;
