import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { getSettings } from '../lib/content/settings';
import type { SiteSettingsRow } from '../types';

/**
 * Public read hook for site_settings. Falls back to `null` if Supabase
 * isn't configured or the row hasn't been created — every consumer is
 * expected to treat `null` fields as "use the hardcoded default".
 */
export function useSiteSettings(): { settings: SiteSettingsRow | null; loading: boolean } {
  const [settings, setSettings] = useState<SiteSettingsRow | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    getSettings()
      .then((s) => { if (active) setSettings(s); })
      .catch(() => { /* keep null; consumers use their defaults */ })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { settings, loading };
}
