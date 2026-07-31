import { useEffect, useState } from 'react';
import type { Review } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { listReviewRows } from '@/lib/content/reviews';
import { reviewRowToModel } from '@/lib/content/mappers';
import { REVIEWS } from '@/features/reviews/data';

export function useReviews(): { reviews: Review[]; loading: boolean } {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    listReviewRows()
      .then((rows) => {
        if (active) setReviews(rows.map((r) => reviewRowToModel(r, language)));
      })
      .catch(() => {/* keep fallback */})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [language]);

  return { reviews, loading };
}
