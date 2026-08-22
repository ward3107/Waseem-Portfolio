import { useEffect, useState } from 'react';
import type { Certification } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { listCertRows } from '@/lib/content/certifications';
import { certRowToModel } from '@/lib/content/mappers';
import { CERTIFICATIONS } from '@/features/certifications/data';

/**
 * Drop cards that are identical in what a visitor actually sees — same title,
 * issuer and issue date — keeping the first. The seed data holds the same
 * "AI-Powered Performance Ads" credential twice (two credential IDs), which
 * rendered as two indistinguishable cards; a duplicate can also slip in through
 * the admin/Supabase list. The credential itself is untouched in admin — this
 * only stops the same card showing twice on the public grid.
 */
function dedupeCertifications(list: Certification[]): Certification[] {
  const seen = new Set<string>();
  return list.filter((c) => {
    const key = `${c.title}|${c.issuer}|${c.issueDate}`.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function useCertifications(): { certifications: Certification[]; loading: boolean } {
  const { language } = useLanguage();
  const [certifications, setCertifications] = useState<Certification[]>(CERTIFICATIONS);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    listCertRows()
      .then((rows) => {
        if (active) setCertifications(rows.map((r) => certRowToModel(r, language)));
      })
      .catch(() => {/* keep fallback */})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [language]);

  return { certifications: dedupeCertifications(certifications), loading };
}
