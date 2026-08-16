import { useEffect, useMemo, useState } from 'react';
import type { Review, ReviewRow } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { listReviewRows } from '@/lib/content/reviews';
import { reviewRowToModel } from '@/lib/content/mappers';
import { REVIEWS } from '@/features/reviews/data';
import { GENERATED_REVIEW_ROWS } from '@/features/reviews/generated';

export function useReviews(): { reviews: Review[]; loading: boolean } {
  const { language } = useLanguage();

  // Seeded from the build-time snapshot so the testimonials section renders at
  // its real height in the first paint instead of appearing ~700ms later and
  // pushing the rest of the page down. Replaced by the live query below.
  const [rows, setRows] = useState<ReviewRow[] | null>(
    GENERATED_REVIEW_ROWS.length > 0 ? GENERATED_REVIEW_ROWS : null
  );
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    listReviewRows()
      .then((live) => {
        if (active) setRows(live);
      })
      .catch(() => {
        /* keep the baked snapshot */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // Deliberately not keyed on `language`: the rows carry all three
    // translations, so switching language re-maps them below rather than
    // re-querying Supabase for identical data.
  }, []);

  const reviews = useMemo(
    () => (rows ? rows.map((r) => reviewRowToModel(r, language)) : REVIEWS),
    [rows, language]
  );

  return { reviews, loading };
}
