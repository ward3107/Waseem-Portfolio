import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Send,
  Loader2,
  Check,
  Sparkles,
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

// A standalone "share your experience" page. Waseem shares this URL with
// customers after each engagement. Submissions land in the reviews table
// with status='pending' and appear on the homepage only after Waseem
// approves them from the admin dashboard.

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

// Big animated stars — hover previews a rating, click locks it in.
const StarPicker: React.FC<{
  value: number;
  onChange: (v: number) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div
      className="flex items-center gap-1 sm:gap-2"
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
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded"
          >
            <Star
              size={36}
              className={
                active
                  ? 'fill-brand-gold text-brand-gold drop-shadow-[0_0_12px_rgba(212,175,55,0.7)]'
                  : 'text-slate-300 dark:text-slate-700'
              }
              style={{
                transition: 'fill 0.15s ease, color 0.15s ease, filter 0.15s ease',
              }}
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

  // The category pill either fills helped_with with the localized label,
  // or (for 'other') lets the customer type a free-form phrase.
  const helpedWithValue = useMemo(() => {
    if (categoryKey === 'other') return helpedWithOther.trim();
    const cat = CATEGORIES.find((c) => c.key === categoryKey);
    return cat ? t(cat.labelKey) : '';
  }, [categoryKey, helpedWithOther, t]);

  const quoteChars = quote.length;
  const quotePct = Math.min((quoteChars / 600) * 100, 100);

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
      trackEvent('testimonial_submitted', { rating, language, category: categoryKey || 'unspecified' });
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
      className="relative min-h-screen py-14 sm:py-20 md:py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 overflow-hidden"
    >
      {/* Ambient floating blobs — the "something moving" backdrop. Frozen
          under prefers-reduced-motion so we honor the user's system setting. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[110px] bg-brand-purple/25 dark:bg-brand-purple/15"
          animate={
            prefersReducedMotion
              ? undefined
              : { x: [0, 60, -20, 0], y: [0, 40, -20, 0] }
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-24 w-[460px] h-[460px] rounded-full blur-[120px] bg-brand-cyan/25 dark:bg-brand-cyan/15"
          animate={
            prefersReducedMotion
              ? undefined
              : { x: [0, -40, 30, 0], y: [0, -30, 20, 0] }
          }
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px] bg-brand-gold/15 dark:bg-brand-gold/10"
          animate={
            prefersReducedMotion
              ? undefined
              : { x: [0, 30, -10, 0], y: [0, -20, 10, 0] }
          }
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
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
              className="rounded-3xl p-8 sm:p-12 text-center shadow-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-slate-800"
            >
              {/* Concentric ripple around the check to celebrate submission. */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                {!prefersReducedMotion && (
                  <>
                    <motion.span
                      className="absolute inset-0 rounded-full bg-emerald-500/25"
                      animate={{ scale: [1, 1.6, 2.1], opacity: [0.5, 0.2, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.span
                      className="absolute inset-0 rounded-full bg-emerald-500/20"
                      animate={{ scale: [1, 1.9, 2.4], opacity: [0.4, 0.15, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
                    />
                  </>
                )}
                <motion.div
                  initial={{ scale: 0.5, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                >
                  <Check size={36} className="text-white" strokeWidth={3} />
                </motion.div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3 font-heading">
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
              {/* Hero header */}
              <div className="text-center mb-8 sm:mb-10">
                <motion.div
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { y: [0, -8, 0], rotate: [0, 4, -2, 0] }
                  }
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-gold to-yellow-500 shadow-lg shadow-brand-gold/30 mb-5 rotate-3"
                >
                  <Sparkles size={30} className="text-white" strokeWidth={2.5} />
                </motion.div>

                <span className="inline-block px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[11px] font-bold uppercase tracking-widest mb-3">
                  {t('share_badge')}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 font-heading leading-tight">
                  {t('share_title')}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                  {t('share_subtitle')}
                </p>

                {/* Trust chips */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                    ⏱️ {t('share_chip_time')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                    ✋ {t('share_chip_manual')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                    🔒 {t('share_chip_private')}
                  </span>
                </div>
              </div>

              {/* Gradient-bordered form card */}
              <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-brand-purple/60 via-brand-cyan/40 to-brand-gold/50 shadow-2xl">
                <form
                  onSubmit={handleSubmit}
                  className="rounded-[calc(1.5rem-1px)] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-6 sm:p-8 space-y-6"
                >
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="tst-name"
                      className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2"
                    >
                      {t('share_field_name')} *
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
                      className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition"
                    />
                  </div>

                  {/* Category pills */}
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
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
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/50 ${
                              active
                                ? 'bg-gradient-to-r from-brand-purple to-brand-cyan text-white border-transparent shadow-md shadow-brand-purple/30'
                                : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-purple/60 hover:text-brand-purple'
                            }`}
                          >
                            <Icon size={13} aria-hidden="true" />
                            {t(cat.labelKey)}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Reveal free-text field only when Other is chosen. */}
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
                          className="mt-3 w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quote */}
                  <div>
                    <label
                      htmlFor="tst-quote"
                      className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2"
                    >
                      {t('share_field_quote')} *
                    </label>
                    <textarea
                      id="tst-quote"
                      required
                      rows={4}
                      maxLength={600}
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      placeholder={t('share_field_quote_placeholder')}
                      className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition resize-none"
                    />
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan"
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
                    <span className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
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
                    <span className="relative flex items-center justify-center w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 group-hover:border-brand-gold transition-colors shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        required
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="peer absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <span
                        className={`absolute inset-0 rounded-[3px] bg-brand-gold transition-opacity ${
                          consent ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      {consent && (
                        <Check size={12} className="relative text-white" strokeWidth={4} />
                      )}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                      {t('share_consent')} *
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

                  {/* Submit — gradient background + shimmer overlay */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="relative w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-gold bg-[length:200%_auto] text-slate-900 font-bold uppercase tracking-wider shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-gold/50 transition-all disabled:opacity-60 disabled:cursor-wait overflow-hidden hover:shadow-brand-gold/40 hover:shadow-2xl"
                    style={{
                      backgroundPosition: submitting ? '0% center' : undefined,
                      animation: submitting ? undefined : 'shimmer 4s linear infinite',
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {submitting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {submitting ? t('share_submitting') : t('share_submit')}
                    </span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Local keyframes for the submit shimmer. Scoped enough not to leak
          into other pages via Tailwind — inline <style> keeps the animation
          co-located with the component that uses it. */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </section>
  );
};

export default ShareTestimonialPage;
