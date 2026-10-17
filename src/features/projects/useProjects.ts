import { useEffect, useMemo, useState } from 'react';
import type { Project, ProjectRow } from '@/types';
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
  const [rows, setRows] = useState<ProjectRow[] | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    listProjectRows()
      .then((result) => {
        if (active) setRows(result);
      })
      .catch(() => {/* keep fallback */})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Derive translated content from the current language, including the offline
  // fallback; switching languages does not need another database request.
  const projects = useMemo(() => rows === null
    ? getLocalizedProjects(t)
    : mergeRequiredPortfolioProjects(
      rows.map((row) => projectRowToModel(row, language)),
      getRequiredPortfolioProjects(t)
    ), [rows, language, t]);
  return { projects, loading };
}
