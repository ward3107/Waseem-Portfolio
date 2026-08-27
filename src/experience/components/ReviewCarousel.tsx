import React from 'react';
import { Quote, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReviews } from '@/features/reviews/useReviews';
import Carousel from './Carousel';

/** Five stars with the first `rating` filled — the same gold treatment the
 *  classic testimonials grid uses, sized for the dark experience cards. */
const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5" aria-label={`${rating} / 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={14}
        className={i <= Math.round(rating) ? 'fill-brand-gold text-brand-gold' : 'text-white/20'}
        aria-hidden="true"
      />
    ))}
  </div>
);

/**
 * The client testimonials carousel for the Trust chapter — a swipeable one-row
 * strip that brings the real reviews INTO the 3D experience, not just the
 * classic site. Most visitors (desktop and phones) see the experience by
 * default, so before this the collected testimonials were invisible to them;
 * the chapter showed only stars and the certifications strip.
 *
 * Data comes from the shared `useReviews` hook (Supabase-backed, approved-only),
 * so approving a review in /admin surfaces it here too. Cards are plain DOM —
 * quote, rating, author, role — so they stay keyboard-reachable and crawlable
 * even though the surrounding canvas is aria-hidden. Renders nothing when there
 * are no reviews, so an empty state never shows an empty rail.
 */
const ReviewCarousel: React.FC = () => {
  const { t } = useLanguage();
  const { reviews } = useReviews();

  if (!reviews.length) return null;

  return (
    <Carousel ariaLabel={t('testimonial_video_title')}>
      {reviews.map((r, i) => (
        <figure
          key={`${r.author}-${i}`}
          role="listitem"
          className="flex w-64 flex-none snap-start flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-start backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/40 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-brand-gold/10 sm:w-72"
        >
          <div className="flex items-center justify-between">
            <Stars rating={r.rating} />
            <Quote className="h-5 w-5 text-brand-gold/50" aria-hidden="true" />
          </div>
          <blockquote className="mt-3 line-clamp-5 flex-1 text-sm leading-relaxed text-slate-200">
            {r.text}
          </blockquote>
          <figcaption className="mt-4 border-t border-white/10 pt-3">
            <p className="text-sm font-bold text-white">{r.author}</p>
            {(r.roleCompany || r.location) && (
              <p className="mt-0.5 text-xs font-medium text-slate-400">
                {[r.roleCompany, r.location].filter(Boolean).join(' · ')}
              </p>
            )}
          </figcaption>
        </figure>
      ))}
    </Carousel>
  );
};

export default ReviewCarousel;
