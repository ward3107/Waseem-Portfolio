import { db } from '@/lib/content/db';
import type { SiteSettingsRow } from '@/types';

/**
 * Site-wide settings live in a single-row table (id = true, checked). Read
 * by both the admin editor and the public site's useSiteSettings hook.
 */
export async function getSettings(): Promise<SiteSettingsRow | null> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', true)
    .maybeSingle();
  if (error) throw error;
  return (data as SiteSettingsRow | null) ?? null;
}

export type SettingsPatch = Partial<Omit<SiteSettingsRow, 'id' | 'updated_at'>>;

export async function updateSettings(patch: SettingsPatch): Promise<void> {
  const supabase = await db();
  const { error } = await supabase.from('site_settings').update(patch).eq('id', true);
  if (error) throw error;
}
