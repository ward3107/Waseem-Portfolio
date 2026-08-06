import React from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { averageRating } from '@/features/reviews/data';
import { useReviews } from '@/features/reviews/useReviews';
import { jsonForScriptTag } from '@/lib/safe';
import TestimonialVideo from '@/features/reviews/TestimonialVideo';

// Section heading per language (no nested ternaries — SonarCloud-friendly).
const HEADINGS: Record<string, { badge: string; title: string; subtitle: string }> = {
  en: {
    badge: 'Testimonials',
    title: 'What clients say',
    subtitle: 'Real feedback from businesses I worked with.',
  },
  he: {
    badge: 'המלצות',
    title: 'מה הלקוחות אומרים',
    subtitle: 'משוב אמיתי מעסקים שעבדתי איתם.',
  },
  ar: {
    badge: 'التوصيات',
    title: 'ماذا يقول العملاء',
    subtitle: 'آراء حقيقية من أعمال عملت معها.',
  },
};

const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5" aria-label={`${rating} / 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={16}
        className={
          i <= Math.round(rating)
            ? 'fill-brand-gold text-brand-gold'
            : 'text-slate-300 dark:text-slate-700'
        }
        aria-hidden="true"
      />
    ))}
  </div>
);

const Reviews: React.FC = () => {
  const { language, dir } = useLanguage();
  const { reviews: REVIEWS } = useReviews();

  // Honest by design: with no real reviews AND no testimonial video, render
  // nothing and emit no schema. The video env-gate still gives an "empty
  // testimonials" state a way to look meaningful when a video is provided.
  const hasVideo = Boolean(import.meta.env.VITE_TESTIMONIAL_VIDEO_URL);
  if (REVIEWS.length === 0 && !hasVideo) return null;

  const avg = averageRating(REVIEWS);
  const copy = HEADINGS[language] ?? HEADINGS.en;

  const aggregateSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Waseem — Web Development Services',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg,
      reviewCount: REVIEWS.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: REVIEWS.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: r.text,
      ...(r.date ? { datePublished: r.date } : {}),
    })),
  };

  return (
    <section
      id="reviews"
      dir={dir}
      className="py-16 sm:py-20 md:py-24 bg-white dark:bg-slate-950 transition-colors duration-300"
    >
      {REVIEWS.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonForScriptTag(aggregateSchema) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-brand-purple text-xs font-bold uppercase tracking-wider mb-4">
            {copy.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-3">
            {copy.title}
          </h2>
          {REVIEWS.length > 0 && (
            <div className="flex items-center justify-center gap-3">
              <Stars rating={avg} />
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                {avg} / 5 · {REVIEWS.length}
              </span>
            </div>
          )}
          <p className="text-slate-600 dark:text-slate-400 mt-2">{copy.subtitle}</p>
        </div>

        <TestimonialVideo className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <figure
              key={`${r.author}-${i}`}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col gap-4"
            >
              <Stars rating={r.rating} />
              <blockquote className="text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
                “{r.text}”
              </blockquote>
              <figcaption className="text-sm font-bold text-slate-900 dark:text-white">
                {r.author}
                {r.roleCompany || r.location ? (
                  <span className="font-normal text-slate-500 dark:text-slate-400">
                    {' '}
                    · {[r.roleCompany, r.location].filter(Boolean).join(' · ')}
                  </span>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
