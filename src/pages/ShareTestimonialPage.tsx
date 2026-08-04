import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Loader2,
  Check,
  ChevronDown,
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
import { useContact } from '@/features/contact/useContact';

// Standalone "share your experience" page. Shared with customers after a
// project so they can leave a moderated testimonial that lands in the
// reviews table as `pending`.
//
// Design v3 — "sage on golden hour" (chosen by client after previewing
// three directions):
// - Warm cream ground with a honey glow up top and a whisper of sage
//   below, so the whole page reads as one botanical, warm world instead
//   of a form parked on top of a landing page.
// - Sage as the calm authority — used for accents, active states, and
//   the submit CTA. Coral appears only on the rating stars, a single
//   note of human warmth.
// - Committed light theme. The page overrides the site's dark tokens
//   because the whole point of this design is warm daylight; a dark
//   inversion would ruin it. Reduced-motion is still respected.

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

// Eight full example testimonials that visitors can tap to insert into
// the quote textarea. Earlier versions used three sentence-starters
// ("I worked with Waseem on…") — visitors clicked and submitted them
// verbatim without finishing the sentence, so the pool of reviews filled
// with fragments. Full examples give the same "help me start" boost,
// look natural on the site if sent as-is, and each hits a different
// angle (speed, AI, design, SEO, reliability, …) so eight sitting side
// by side don't all read the same.
const EXAMPLES: readonly { label: string; text: string }[] = [
  { label: 'share_ex_speed_label', text: 'share_ex_speed_text' },
  { label: 'share_ex_ai_label', text: 'share_ex_ai_text' },
  { label: 'share_ex_clarity_label', text: 'share_ex_clarity_text' },
  { label: 'share_ex_seo_label', text: 'share_ex_seo_text' },
  { label: 'share_ex_design_label', text: 'share_ex_design_text' },
  { label: 'share_ex_ontime_label', text: 'share_ex_ontime_text' },
  { label: 'share_ex_tech_label', text: 'share_ex_tech_text' },
  { label: 'share_ex_partner_label', text: 'share_ex_partner_text' },
] as const;

// Palette lifted verbatim from the approved mockup — hard-coded so it
// survives the site's Tailwind theme without having to plumb new
// brand-* tokens through the whole design system.
const PAL = {
  ink: '#1f2a24',
  soft: '#5c6b62',
  line: 'rgba(31,42,36,0.10)',
  card: '#ffffff',
  cardTint: '#fafaf6',
  accent: '#3a5a44',
  accentSoft: 'rgba(58,90,68,0.10)',
  accentHover: '#2f4a37',
  coral: '#d97952',
  coralDim: 'rgba(217,121,82,0.22)',
} as const;

const STAR_LABEL_KEYS = [
  'share_star_1',
  'share_star_2',
  'share_star_3',
  'share_star_4',
  'share_star_5',
] as const;

const Stars: React.FC<{
  value: number;
  onChange: (v: number) => void;
  label: string;
  starLabel: (n: number) => string;
}> = ({ value, onChange, label, starLabel }) => {
  const [hover, setHover] = useState<number | null>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const shown = hover ?? value;

  // Roving-tabindex + arrow-key selection so the group behaves as one radio
  // group (a single tab stop; arrows move and select) instead of five tab stops.
  const move = (next: number) => {
    const clamped = Math.min(5, Math.max(1, next));
    onChange(clamped);
    const btn = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[clamped - 1];
    btn?.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      move(value + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      move(value - 1);
    }
  };

  return (
    <div>
      <div
        ref={groupRef}
        className="inline-flex items-center gap-1.5"
        role="radiogroup"
        aria-label={label}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = (hover ?? value) >= n;
          const singleLabel = starLabel(n);
          return (
            <motion.button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              tabIndex={value === n ? 0 : -1}
              aria-label={`${n} — ${singleLabel}`}
              title={singleLabel}
              onClick={() => onChange(n)}
              onMouseEnter={() => setHover(n)}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className="p-0.5 focus:outline-none focus-visible:ring-2 rounded"
              style={{
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                ['--tw-ring-color' as string]: PAL.accentSoft,
              }}
            >
              <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              aria-hidden="true"
              style={{
                color: active ? PAL.coral : PAL.coralDim,
                transition: 'color .18s ease',
              }}
            >
              <path
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442a.563.563 0 01.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                fill="currentColor"
              />
            </svg>
            </motion.button>
          );
        })}
      </div>
      <p
        className="mt-2 text-[13px] font-medium"
        style={{ color: PAL.soft, minHeight: '1.2em' }}
        aria-live="polite"
      >
        {starLabel(shown)}
      </p>
    </div>
  );
};

const ShareTestimonialPage: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { whatsappNumber } = useContact();

  const [author, setAuthor] = useState('');
  const [categoryKey, setCategoryKey] = useState<string>('');
  const [helpedWithOther, setHelpedWithOther] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  // When the customer is actively writing, the page ground deepens
  // slightly — a "you're in writing mode" ambience without moving the
  // form. Reset on blur.
  const [writingFocus, setWritingFocus] = useState(false);
  const [done, setDone] = useState(false);
  const quoteRef = useRef<HTMLTextAreaElement>(null);

  const helpedWithValue = useMemo(() => {
    if (categoryKey === 'other') return helpedWithOther.trim();
    const cat = CATEGORIES.find((c) => c.key === categoryKey);
    return cat ? t(cat.labelKey) : '';
  }, [categoryKey, helpedWithOther, t]);

  const quoteChars = quote.length;
  const quotePct = Math.min((quoteChars / 600) * 100, 100);

  const applyExample = (textKey: string) => {
    if (quote.trim().length > 0) {
      quoteRef.current?.focus();
      return;
    }
    const phrase = t(textKey);
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

  // Multi-radial ground: base warm cream → honey glow top-right → soft
  // honey top-left → sage undertone at the bottom. Layered so the
  // sage form belongs to the same world as its ground. When the quote
  // textarea has focus (writingFocus), each radial gets a bit stronger
  // and the base tilts a shade warmer — creates a "you're writing"
  // ambience without moving the form.
  const groundBackground = writingFocus
    ? [
        'radial-gradient(70% 50% at 50% 110%, rgba(58,90,68,0.16), transparent 62%)',
        'radial-gradient(55% 40% at 90% -10%, rgba(234,180,102,0.42), transparent 65%)',
        'radial-gradient(65% 45% at 8% 0%, rgba(240,200,140,0.30), transparent 60%)',
        'linear-gradient(180deg, #f8ecc6 0%, #f2e5bd 55%, #ebdbaa 100%)',
      ].join(', ')
    : [
        'radial-gradient(70% 50% at 50% 110%, rgba(58,90,68,0.11), transparent 62%)',
        'radial-gradient(55% 40% at 90% -10%, rgba(234,180,102,0.30), transparent 65%)',
        'radial-gradient(65% 45% at 8% 0%, rgba(240,200,140,0.22), transparent 60%)',
        'linear-gradient(180deg, #fbf3dd 0%, #f6eed3 55%, #f0e7c6 100%)',
      ].join(', ');

  const reminderHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t('share_reminder_wa_prefill'))}`;

  return (
    <section
      dir={dir}
      className="relative min-h-screen py-14 sm:py-20 md:py-24 overflow-hidden"
      style={{
        background: groundBackground,
        colorScheme: 'light',
        color: PAL.ink,
        transition: 'background 500ms ease',
      }}
    >
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="rounded-3xl p-8 sm:p-12 text-center"
              style={{
                background: PAL.card,
                boxShadow: '0 40px 80px -30px rgba(58,90,68,0.28), 0 12px 24px -12px rgba(31,42,36,0.10)',
                border: '1px solid rgba(255,255,255,0.65)',
              }}
            >
              <div className="relative w-20 h-20 mx-auto mb-6">
                {!prefersReducedMotion && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ background: PAL.accentSoft }}
                    animate={{ scale: [1, 1.7, 2.1], opacity: [0.5, 0.2, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <motion.div
                  initial={{ scale: 0.5, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="relative w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: PAL.accent,
                    boxShadow: '0 12px 24px -8px rgba(58,90,68,0.35)',
                  }}
                >
                  <Check size={36} className="text-white" strokeWidth={3} />
                </motion.div>
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold mb-3 font-heading"
                style={{ color: PAL.ink }}
              >
                {t('share_thanks_title')}
              </h1>
              <p style={{ color: PAL.soft }} className="leading-relaxed">
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
              {/* Hero */}
              <div className="text-center mb-10">
                <span
                  className="inline-block px-3 py-1.5 rounded-full text-[11px] font-bold uppercase mb-5"
                  style={{
                    color: PAL.accent,
                    background: PAL.accentSoft,
                    letterSpacing: '0.24em',
                  }}
                >
                  {t('share_badge')}
                </span>
                <h1
                  className="font-heading mb-4"
                  style={{
                    color: PAL.ink,
                    fontSize: 'clamp(32px, 5vw, 52px)',
                    fontWeight: 500,
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    textWrap: 'balance',
                  }}
                >
                  {t('share_title')}
                </h1>
                <p
                  className="max-w-lg mx-auto leading-relaxed mb-6"
                  style={{ color: PAL.soft, fontSize: '16px' }}
                >
                  {t('share_subtitle')}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['share_chip_time', 'share_chip_manual', 'share_chip_private'].map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
                      style={{
                        background: 'rgba(255,255,255,0.72)',
                        border: '1px solid rgba(31,42,36,0.06)',
                        color: PAL.ink,
                      }}
                    >
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ background: PAL.accent }}
                      />
                      {t(k)}
                    </span>
                  ))}
                </div>
              </div>

              {/* "Waseem is asking" — small personal attribution card */}
              <div
                className="rounded-2xl p-4 mb-5 flex items-start gap-3"
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(31,42,36,0.06)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm"
                  style={{ background: PAL.accent, letterSpacing: '0.02em' }}
                  aria-hidden="true"
                >
                  W
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[13.5px] font-semibold leading-snug"
                    style={{ color: PAL.ink }}
                  >
                    {t('share_from_waseem_title')}
                  </p>
                  <p
                    className="text-[12.5px] leading-snug mt-0.5"
                    style={{ color: PAL.soft }}
                  >
                    {t('share_from_waseem_body')}
                  </p>
                </div>
              </div>

              {/* Example testimonial — collapsed by default, expands on
                  click. Uses a real seeded review so the customer sees the
                  actual tone/length that reads well on the site. */}
              <ExampleTestimonial />

              {/* Card */}
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl p-6 sm:p-10 space-y-6"
                style={{
                  background: PAL.card,
                  border: '1px solid rgba(255,255,255,0.65)',
                  boxShadow: '0 40px 80px -30px rgba(58,90,68,0.24), 0 12px 24px -12px rgba(58,74,52,0.10)',
                }}
              >
                {/* Name */}
                <FieldLabel htmlFor="tst-name" required>
                  {t('share_field_name')}
                </FieldLabel>
                <Input
                  id="tst-name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={120}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder={t('share_field_name_placeholder')}
                />

                {/* Category pills */}
                <div>
                  <FieldLabel>{t('share_field_helped')}</FieldLabel>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label={t('share_field_helped')}
                    onKeyDown={(e) => {
                      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
                      e.preventDefault();
                      const radios = Array.from(
                        e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
                      );
                      const currentIdx = Math.max(0, CATEGORIES.findIndex((c) => c.key === categoryKey));
                      const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
                      const nextIdx = (currentIdx + delta + CATEGORIES.length) % CATEGORIES.length;
                      setCategoryKey(CATEGORIES[nextIdx].key);
                      radios[nextIdx]?.focus();
                    }}
                  >
                    {CATEGORIES.map((cat, idx) => {
                      const active = categoryKey === cat.key;
                      // Roving tabindex: the selected pill is the single tab stop
                      // (or the first pill when nothing is selected yet).
                      const isTabStop = categoryKey === '' ? idx === 0 : active;
                      const Icon = cat.icon;
                      return (
                        <motion.button
                          key={cat.key}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          tabIndex={isTabStop ? 0 : -1}
                          onClick={() => setCategoryKey(active ? '' : cat.key)}
                          whileTap={{ scale: 0.96 }}
                          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all"
                          style={{
                            background: active ? PAL.accent : PAL.cardTint,
                            border: active ? `1.5px solid ${PAL.accent}` : `1.5px solid ${PAL.line}`,
                            color: active ? '#fff' : PAL.soft,
                            boxShadow: active ? '0 4px 10px -4px rgba(58,90,68,0.4)' : 'none',
                          }}
                        >
                          <Icon size={13} aria-hidden="true" />
                          {t(cat.labelKey)}
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {categoryKey === 'other' && (
                      <motion.div
                        key="other-wrap"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3"
                      >
                        <Input
                          type="text"
                          maxLength={160}
                          value={helpedWithOther}
                          onChange={(e) => setHelpedWithOther(e.target.value)}
                          placeholder={t('share_field_helped_placeholder')}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quote */}
                <div>
                  <FieldLabel htmlFor="tst-quote" required>
                    {t('share_field_quote')}
                  </FieldLabel>
                  <p
                    className="text-[11.5px] leading-snug mb-2"
                    style={{ color: PAL.soft }}
                  >
                    {t('share_ex_hint')}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex.label}
                        type="button"
                        onClick={() => applyExample(ex.text)}
                        title={t(ex.text)}
                        className="inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-all"
                        style={{
                          background: PAL.accentSoft,
                          color: PAL.accent,
                          border: 'none',
                        }}
                      >
                        {t(ex.label)}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    ref={quoteRef}
                    id="tst-quote"
                    required
                    rows={4}
                    maxLength={600}
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    onFocus={() => setWritingFocus(true)}
                    onBlur={() => setWritingFocus(false)}
                    placeholder={t('share_field_quote_placeholder')}
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <div
                      className="flex-1 h-[3px] rounded-full overflow-hidden"
                      style={{ background: PAL.line }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: PAL.accent }}
                        animate={{ width: `${quotePct}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <span
                      className="text-[11px] font-mono tabular-nums shrink-0 font-medium"
                      style={{ color: PAL.soft }}
                    >
                      {quoteChars}/600
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <FieldLabel>{t('share_field_rating')}</FieldLabel>
                  <Stars
                    value={rating}
                    onChange={setRating}
                    label={t('share_field_rating')}
                    starLabel={(n) => (n >= 1 && n <= 5 ? t(STAR_LABEL_KEYS[n - 1]) : '')}
                  />
                </div>

                {/* Consent */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <span
                    className="relative flex items-center justify-center rounded-md flex-shrink-0 mt-0.5"
                    style={{
                      width: 20,
                      height: 20,
                      border: `2px solid ${PAL.accent}`,
                      background: consent ? PAL.accent : 'transparent',
                      transition: 'background .15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="peer absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {consent && <Check size={12} className="text-white" strokeWidth={4} />}
                  </span>
                  <span
                    className="text-sm leading-snug"
                    style={{ color: PAL.soft }}
                  >
                    {t('share_consent')}{' '}
                    <span style={{ color: PAL.coral, fontWeight: 700 }}>*</span>
                  </span>
                </label>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="text-sm font-medium"
                    style={{ color: '#c04a4a' }}
                  >
                    {error}
                  </motion.p>
                )}

                {/* Preview toggle — opens an inline card that renders the
                    testimonial in the same style the Reviews section uses.
                    Requires name + quote to be present, otherwise the
                    toggle is disabled with a hint. */}
                <PreviewSection
                  author={author}
                  quote={quote}
                  rating={rating}
                  category={helpedWithValue}
                  open={showPreview}
                  onToggle={() => setShowPreview((v) => !v)}
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-semibold text-[14.5px] tracking-wide transition-all disabled:opacity-60 disabled:cursor-wait"
                  style={{
                    background: submitting ? PAL.accentHover : PAL.accent,
                    color: '#fff',
                    boxShadow:
                      '0 12px 24px -10px rgba(58,90,68,0.5), 0 3px 6px -3px rgba(58,90,68,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      (e.currentTarget as HTMLButtonElement).style.background = PAL.accentHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      (e.currentTarget as HTMLButtonElement).style.background = PAL.accent;
                    }
                  }}
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {submitting ? t('share_submitting') : t('share_submit')}
                </button>

                {/* Reminder escape hatch — for visitors who want to come
                    back later. One tap opens WhatsApp with a pre-filled
                    "please remind me" message to Waseem. Zero backend. */}
                <p className="text-center text-[12.5px]" style={{ color: PAL.soft }}>
                  {t('share_reminder_hint')}{' '}
                  <a
                    href={reminderHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-2"
                    style={{ color: PAL.accent }}
                    onClick={() =>
                      trackEvent('testimonial_reminder_click', { language })
                    }
                  >
                    {t('share_reminder_action')}
                  </a>
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// Small helpers so the JSX above reads as a form, not a token dump.

const FieldLabel: React.FC<{
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ htmlFor, required, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-[13px] font-semibold mb-2"
    style={{ color: PAL.ink, letterSpacing: '-0.005em' }}
  >
    {children}
    {required && (
      <span
        aria-hidden="true"
        style={{ color: PAL.coral, fontWeight: 700, marginInlineStart: 4 }}
      >
        *
      </span>
    )}
  </label>
);

const inputStyle: React.CSSProperties = {
  background: PAL.cardTint,
  border: `1.5px solid ${PAL.line}`,
  color: PAL.ink,
  borderRadius: 12,
  padding: '12px 14px',
  fontFamily: 'inherit',
  fontSize: 15,
  outline: 'none',
  width: '100%',
  transition: 'border-color .15s ease, background .15s ease, box-shadow .15s ease',
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = PAL.accent;
      e.currentTarget.style.background = '#fff';
      e.currentTarget.style.boxShadow = `0 0 0 4px ${PAL.accentSoft}`;
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = PAL.line;
      e.currentTarget.style.background = PAL.cardTint;
      e.currentTarget.style.boxShadow = 'none';
      props.onBlur?.(e);
    }}
    style={{ ...inputStyle, ...props.style }}
  />
);

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => (
  <textarea
    ref={ref}
    {...props}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = PAL.accent;
      e.currentTarget.style.background = '#fff';
      e.currentTarget.style.boxShadow = `0 0 0 4px ${PAL.accentSoft}`;
      props.onFocus?.(e);
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = PAL.line;
      e.currentTarget.style.background = PAL.cardTint;
      e.currentTarget.style.boxShadow = 'none';
      props.onBlur?.(e);
    }}
    style={{
      ...inputStyle,
      minHeight: 118,
      resize: 'none',
      lineHeight: 1.55,
      ...props.style,
    }}
  />
));
Textarea.displayName = 'Textarea';

// Inline "how it will look" preview. Toggle button + collapsible card
// that renders the visitor's own inputs in the exact style the Reviews
// section uses on the homepage.
const PreviewSection: React.FC<{
  author: string;
  quote: string;
  rating: number;
  category: string;
  open: boolean;
  onToggle: () => void;
}> = ({ author, quote, rating, category, open, onToggle }) => {
  const { t } = useLanguage();
  const ready = author.trim().length > 0 && quote.trim().length > 0;
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        disabled={!ready}
        aria-expanded={open}
        className="w-full inline-flex items-center justify-between gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(6px)',
          border: `1px solid ${PAL.line}`,
          color: PAL.ink,
        }}
      >
        <span className="text-start">
          {ready ? t('share_preview_toggle') : t('share_preview_missing')}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
          style={{ color: PAL.accent, display: 'inline-flex' }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && ready && (
          <motion.div
            key="preview-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-2xl p-5"
              style={{
                background: PAL.card,
                border: `1px solid ${PAL.line}`,
                boxShadow: '0 12px 24px -14px rgba(58,90,68,0.18)',
              }}
            >
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg
                    key={n}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    style={{ color: n <= rating ? PAL.coral : PAL.coralDim }}
                    aria-hidden="true"
                  >
                    <path
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442a.563.563 0 01.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      fill="currentColor"
                    />
                  </svg>
                ))}
              </div>
              <p
                className="text-[15px] leading-relaxed italic"
                style={{ color: PAL.ink, fontFamily: 'Georgia, "Iowan Old Style", serif' }}
                dir="auto"
              >
                &ldquo;{quote}&rdquo;
              </p>
              <p className="text-[12px] mt-3" style={{ color: PAL.soft }}>
                <span style={{ color: PAL.ink, fontWeight: 600 }}>{author}</span>
                {category && (
                  <>
                    {' · '}
                    <span>{category}</span>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Collapsed by default; expanding shows a real seeded testimonial so the
// visitor can see the tone / length that reads well on the site. The
// content lives in the component (not the reviews table) so this stays
// fast — no extra fetch — and shows the exact same reference even when
// the reviews list is still loading in.
const ExampleTestimonial: React.FC = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full inline-flex items-center justify-between gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-all"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(31,42,36,0.06)',
          color: PAL.ink,
        }}
      >
        <span className="text-start">{t('share_example_toggle')}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
          style={{ color: PAL.accent, display: 'inline-flex' }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="example-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-2xl p-5"
              style={{
                background: PAL.card,
                border: '1px solid rgba(31,42,36,0.06)',
                boxShadow: '0 12px 24px -14px rgba(58,90,68,0.18)',
              }}
            >
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg
                    key={n}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    style={{ color: PAL.coral }}
                    aria-hidden="true"
                  >
                    <path
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442a.563.563 0 01.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      fill="currentColor"
                    />
                  </svg>
                ))}
              </div>
              <p
                className="text-[15px] leading-relaxed italic"
                style={{ color: PAL.ink, fontFamily: 'Georgia, "Iowan Old Style", serif' }}
              >
                &ldquo;עזרה מהירה ומדויקת, בדיוק מה שהייתי צריך.&rdquo;
              </p>
              <p
                className="text-[12px] mt-2"
                style={{ color: PAL.soft }}
              >
                {t('share_example_by')} <span style={{ color: PAL.ink, fontWeight: 600 }}>אופק</span>
                {' · '}
                <span>{t('share_cat_website')}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareTestimonialPage;
