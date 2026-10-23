import type { SiteSettingsRow } from '@/types';
import { supabaseAnonKey, supabaseUrl } from '@/lib/supabaseConfig';

/**
 * Read the single public settings row through the same anonymous PostgREST
 * endpoint used by supabase-js. The homepage needs one small JSON response,
 * not the SDK's auth, realtime and websocket modules on its first load.
 * Admin writes continue to use the authenticated Supabase client.
 */
export async function getPublicSettings(): Promise<SiteSettingsRow | null> {
  const url = new URL('/rest/v1/site_settings', supabaseUrl);
  url.searchParams.set('select', '*');
  url.searchParams.set('id', 'eq.true');
  url.searchParams.set('limit', '1');
  const response = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Public settings request failed: ${response.status}`);
  const rows = await response.json() as SiteSettingsRow[];
  return rows[0] ?? null;
}
