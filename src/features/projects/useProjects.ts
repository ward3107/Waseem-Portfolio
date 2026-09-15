import { useEffect, useState } from 'react';
import type { Project } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { listProjectRows } from '@/lib/content/projects';
import { projectRowToModel } from '@/lib/content/mappers';
import {
  getLocalizedProjects,
  getRequiredPortfolioProjects,
  mergeRequiredPortfolioProjects,
} from '@/features/projects/data';

export function useProjects(): { projects: Project[]; loading: boolean } {
  const { t, language } = useLanguage();
  const [projects, setProjects] = useState<Project[]>(() => getLocalizedProjects(t));
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    listProjectRows()
      .then((rows) => {
        if (active) {
          const remoteProjects = rows.map((r) => projectRowToModel(r, language));
          setProjects(
            mergeRequiredPortfolioProjects(remoteProjects, getRequiredPortfolioProjects(t))
          );
        }
      })
      .catch(() => {/* keep fallback */})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [language, t]);

  return { projects, loading };
}
