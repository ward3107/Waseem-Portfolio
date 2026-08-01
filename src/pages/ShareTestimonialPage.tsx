import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { submitPublicReview } from '@/lib/content/reviews';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { trackEvent } from '@/lib/browser';

// A standalone "share your experience" page. Waseem shares this URL with
// customers after each engagement — replaces the old standalone Google Form
// wired to a Sheet. Submissions land in the reviews table with
// status='pending' and appear on the homepage only after Waseem approves
// them from the admin dashboard.

const StarPicker: React.FC<{ value: number; onChange: (v: number) => void; label: string }> = ({
  value,
  onChange,
  label,
}) => {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover ?? value) >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded"
          >
            <Star
              size={30}
              className={
                active
                  ? 'fill-brand-gold text-brand-gold drop-shadow-[0_0_6px_rgba(212,175,55,0.5)]'
                  : 'text-slate-300 dark:text-slate-700'
              }
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
};

const ShareTestimonialPage: React.FC = () => {
  const { t, language, dir } = useLanguage();

  const [author, setAuthor] = useState('');
  const [helpedWith, setHelpedWith] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
        helpedWith: helpedWith.trim(),
        language,
      });
      trackEvent('testimonial_submitted', { rating, language });
      setDone(true);
    } catch (err) {
      console.error('[share-testimonial] submit failed:', err);
      setError(t('share_error_generic'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section dir={dir} className="min-h-screen py-16 sm:py-20 md:py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center shadow-lg"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 font-heading">
              {t('share_thanks_title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">{t('share_thanks_body')}</p>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8 sm:mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[11px] font-bold uppercase tracking-widest mb-3">
                {t('share_badge')}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-3 font-heading">
                {t('share_title')}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                {t('share_subtitle')}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-5"
            >
              <div>
                <label htmlFor="tst-name" className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
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
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition"
                />
              </div>

              <div>
                <label htmlFor="tst-helped" className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                  {t('share_field_helped')}
                </label>
                <input
                  id="tst-helped"
                  type="text"
                  maxLength={160}
                  value={helpedWith}
                  onChange={(e) => setHelpedWith(e.target.value)}
                  placeholder={t('share_field_helped_placeholder')}
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition"
                />
              </div>

              <div>
                <label htmlFor="tst-quote" className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
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
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold transition resize-none"
                />
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 text-right rtl:text-left">
                  {quote.length}/600
                </p>
              </div>

              <div>
                <span className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                  {t('share_field_rating')}
                </span>
                <StarPicker value={rating} onChange={setRating} label={t('share_field_rating')} />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-gold focus:ring-brand-gold/40"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                  {t('share_consent')} *
                </span>
              </label>

              {error && (
                <p role="alert" className="text-sm text-red-500 font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-brand-gold hover:bg-yellow-400 text-slate-900 font-bold uppercase tracking-wider rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-brand-gold/50 transition-all disabled:opacity-60 disabled:cursor-wait"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {submitting ? t('share_submitting') : t('share_submit')}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
};

export default ShareTestimonialPage;
