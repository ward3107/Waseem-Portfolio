import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Send,
  Loader2,
  Check,
  Globe,
  Bot,
  Search,
  TrendingUp,
  Code,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { submitPublicReview } from '@/lib/content/reviews';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { trackEvent } from '@/lib/browser';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';

// Standalone "share your experience" page. Sent to customers after each
// engagement. Submissions land in the reviews table with status='pending'
// and appear on the homepage only after Waseem approves them from admin.
//
// Design direction v2 (v1 was too gold-heavy and busy):
// - calm off-white / slate card; purple + cyan accents; gold reserved for
//   the primary submit CTA only.
// - short one-word placeholders instead of full sentences ("שם" not
//   "איך לזקק לכם קרדיט?").
// - sentence-starter chips above the quote textarea to defeat blank-page
//   paralysis: one tap prefills a starting phrase the customer edits.
// - floating widgets (WhatsApp / Exit / Share) are hidden by SiteShell's
//   focusMode when the visitor is on this route.

interface Category {
  key: string;
  icon: LucideIcon;
  labelKey: string;
}

const CATEGORIES: readonly Category[] = [
  { key: 'website', icon: Globe, labelKey: 'share_cat_website' },
  { key: 'ai', icon: Bot, labelKey: 'share_cat_ai' },
  { key: 'seo', icon: Search, labelKey: 'share_cat_seo' },
  { key: 'marketing', icon: TrendingUp, labelKey: 'share_cat_marketing' },
  { key: 'custom', icon: Code, labelKey: 'share_cat_custom' },
  { key: 'other', icon: MoreHorizontal, labelKey: 'share_cat_other' },
] as const;

const STARTER_KEYS: readonly string[] = [
  'share_starter_worked_on',
  'share_starter_loved',
  'share_starter_result',
] as const;

const StarPicker: React.FC<{
  value: number;
  onChange: (v: number) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label={label}
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover ?? value) >= n;
        return (
          <motion.button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/50 rounded"
          >
            <Star
              size={28}
              className={
                active
                  ? 'fill-brand-gold text-brand-gold'
                  : 'text-slate-300 dark:text-slate-600'
              }
              style={{ transition: 'fill 0.15s ease, color 0.15s ease' }}
              aria-hidden="true"
            />
          </motion.button>
        );
      })}
    </div>
  );
};

const ShareTestimonialPage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [author, setAuthor] = useState('');
  const [categoryKey, setCategoryKey] = useState<string>('');
  const [helpedWithOther, setHelpedWithOther] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const quoteRef = useRef<HTMLTextAreaElement>(null);

  const helpedWithValue = useMemo(() => {
    if (categoryKey === 'other') return helpedWithOther.trim();
    const cat = CATEGORIES.find((c) => c.key === categoryKey);
    return cat ? t(cat.labelKey) : '';
  }, [categoryKey, helpedWithOther, t]);

  const quoteChars = quote.length;
  const quotePct = Math.min((quoteChars / 600) * 100, 100);

  const applyStarter = (starterKey: string) => {
    // Prefill only when the textarea is empty — never overwrite what the
    // customer has already typed. Focus and drop the caret at end so they
    // can just keep typing.
    if (quote.trim().length > 0) {
      quoteRef.current?.focus();
      return;
    }
    const phrase = t(starterKey);
    setQuote(phrase);
    requestAnimationFrame(() => {
      const el = quoteRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(phrase.length, phrase.length);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!author.trim() || !quote.trim() || !consent) {
      setError(t('share_error_required'));
      return;
    }
    if (!isSupabaseConfigured) {
      setError(t('share_error_config'));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await submitPublicReview({
        author: author.trim(),
        rating,
        quote: quote.trim(),
        helpedWith: helpedWithValue,
        language,
      });
      trackEvent('testimonial_submitted', {
        rating,
        language,
        category: categoryKey || 'unspecified',
      });
      setDone(true);
    } catch (err) {
      console.error('[share-testimonial] submit failed:', err);
      setError(t('share_error_generic'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      dir={dir}
      className="relative min-h-screen py-14 sm:py-20 md:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 transition-colors duration-300 overflow-hidden"
    >
      {/* Very soft ambient wash — much lighter than v1. Two barely-there blobs
          give the page depth without competing with the form. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute -top-40 -left-20 w-[520px] h-[520px] rounded-full blur-[140px] bg-brand-purple/15 dark:bg-brand-purple/10"
          animate={
            prefersReducedMotion
              ? undefined
              : { x: [0, 40, -20, 0], y: [0, 30, -10, 0] }
          }
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-20 w-[540px] h-[540px] rounded-full blur-[140px] bg-brand-cyan/15 dark:bg-brand-cyan/10"
          animate={
            prefersReducedMotion
              ? undefined
              : { x: [0, -30, 20, 0], y: [0, -20, 10, 0] }
          }
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="rounded-2xl p-8 sm:p-12 text-center shadow-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                {!prefersReducedMotion && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-emerald-500/20"
                    animate={{ scale: [1, 1.6, 2.1], opacity: [0.5, 0.2, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <motion.div
                  initial={{ scale: 0.5, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="relative w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                >
                  <Check size={36} className="text-white" strokeWidth={3} />
                </motion.div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 font-heading">
                {t('share_thanks_title')}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('share_thanks_body')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form-wrap"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Calm header — no floating icon, no gradient border. Just
                  a small mark and clean typography. */}
              <div className="text-center mb-8 sm:mb-10">
                <span className="inline-block px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-[11px] font-bold uppercase tracking-widest mb-4">
                  {t('share_badge')}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 font-heading leading-tight">
                  {t('share_title')}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  {t('share_subtitle')}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  {['share_chip_time', 'share_chip_manual', 'share_chip_private'].map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-200 backdrop-blur-sm"
                    >
                      {t(k)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Soft-shadow card, thin border, plenty of breathing room. */}
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 space-y-6"
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="tst-name"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    {t('share_field_name')} <span className="text-brand-purple">*</span>
                  </label>
                  <input
                    id="tst-name"
                    type="text"
                    autoComplete="name"
                    required
                    maxLength={120}
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder={t('share_field_name_placeholder')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple transition"
                  />
                </div>

                {/* Category pills */}
                <div>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {t('share_field_helped')}
                  </span>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label={t('share_field_helped')}
                  >
                    {CATEGORIES.map((cat) => {
                      const active = categoryKey === cat.key;
                      const Icon = cat.icon;
                      return (
                        <motion.button
                          key={cat.key}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setCategoryKey(active ? '' : cat.key)}
                          whileTap={{ scale: 0.96 }}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 ${
                            active
                              ? 'bg-brand-purple text-white border-transparent shadow-sm'
                              : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-purple/40 hover:text-brand-purple'
                          }`}
                        >
                          <Icon size={13} aria-hidden="true" />
                          {t(cat.labelKey)}
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {categoryKey === 'other' && (
                      <motion.input
                        key="other-input"
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -6, height: 0 }}
                        transition={{ duration: 0.2 }}
                        type="text"
                        maxLength={160}
                        value={helpedWithOther}
                        onChange={(e) => setHelpedWithOther(e.target.value)}
                        placeholder={t('share_field_helped_placeholder')}
                        className="mt-3 w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Quote — with sentence-starter chips above */}
                <div>
                  <label
                    htmlFor="tst-quote"
                    className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
                  >
                    {t('share_field_quote')} <span className="text-brand-purple">*</span>
                  </label>

                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {STARTER_KEYS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => applyStarter(k)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-brand-purple/5 text-brand-purple border border-brand-purple/20 hover:bg-brand-purple/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/30"
                      >
                        + {t(k)}
                      </button>
                    ))}
                  </div>

                  <textarea
                    ref={quoteRef}
                    id="tst-quote"
                    required
                    rows={4}
                    maxLength={600}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder={t('share_field_quote_placeholder')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/40 focus:border-brand-purple transition resize-none"
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <motion.div
                        className="h-full bg-brand-purple"
                        animate={{ width: `${quotePct}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                      {quoteChars}/600
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {t('share_field_rating')}
                  </span>
                  <StarPicker
                    value={rating}
                    onChange={setRating}
                    label={t('share_field_rating')}
                  />
                </div>

                {/* Consent */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <span className="relative flex items-center justify-center w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 group-hover:border-brand-purple transition-colors shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="peer absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span
                      className={`absolute inset-0 rounded-[3px] bg-brand-purple transition-opacity ${
                        consent ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    {consent && (
                      <Check size={12} className="relative text-white" strokeWidth={4} />
                    )}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                    {t('share_consent')} <span className="text-brand-purple">*</span>
                  </span>
                </label>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="text-sm text-red-500 font-medium"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-gold hover:bg-yellow-400 text-slate-900 font-bold tracking-wide shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-gold/40 transition disabled:opacity-60 disabled:cursor-wait"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {submitting ? t('share_submitting') : t('share_submit')}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ShareTestimonialPage;
