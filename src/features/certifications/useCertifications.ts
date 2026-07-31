import { useEffect, useState } from 'react';
import type { Certification } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { listCertRows } from '@/lib/content/certifications';
import { certRowToModel } from '@/lib/content/mappers';
import { CERTIFICATIONS } from '@/features/certifications/data';

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

  return { certifications, loading };
}
