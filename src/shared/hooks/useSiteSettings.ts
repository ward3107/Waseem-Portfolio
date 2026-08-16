import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { getSettings } from '@/lib/content/settings';
import type { SiteSettingsRow } from '@/types';

/**
 * Public read hook for site_settings. Falls back to `null` if Supabase
 * isn't configured or the row hasn't been created — every consumer is
 * expected to treat `null` fields as "use the hardcoded default".
 *
 * The fetch is deduplicated at module scope. `useContact()` (the only
 * consumer) is called from ~10 components — Hero, Footer, WhatsAppFloat,
 * ExitIntent, FAQ, ServiceModal, Contact … — and six of them mount on the
 * home page alone. Without this cache each one ran its own `getSettings()`,
 * so a single page load fired six identical requests for the same one-row
 * table. Now the first caller starts the request and everyone else awaits
 * the same promise.
 */

type Settings = SiteSettingsRow | null;

/** In-flight or completed request. Shared by every hook instance. */
let settingsPromise: Promise<Settings> | null = null;
/** Resolved value, so late subscribers render correct data on first paint
 *  instead of flashing the fallback and then swapping. */
let settingsCache: Settings = null;
let settled = false;

function loadSettings(): Promise<Settings> {
  if (!settingsPromise) {
    // `getSettings` resolves the Supabase client lazily via lib/content/db,
    // so importing it here does not put supabase-js on the critical path.
    settingsPromise = getSettings()
      .catch(() => null) // keep null; consumers use their defaults
      .then((s) => {
        settingsCache = s;
        settled = true;
        return s;
      });
  }
  return settingsPromise;
}

export function useSiteSettings(): { settings: Settings; loading: boolean } {
  const [settings, setSettings] = useState<Settings>(settingsCache);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !settled);

  useEffect(() => {
    if (!isSupabaseConfigured || settled) return;
    let active = true;
    loadSettings().then((s) => {
      if (!active) return;
      setSettings(s);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading };
}

/** Test-only: drop the module-level cache between cases. */
export function __resetSiteSettingsCache(): void {
  settingsPromise = null;
  settingsCache = null;
  settled = false;
}
