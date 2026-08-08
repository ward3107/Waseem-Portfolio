import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when both env vars are present. The site still renders (with fallback
 *  content) when Supabase is not configured, so we never throw at import time. */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // Loud in dev so nobody demos the site with admin sign-in silently pointing
  // at localhost:54321. Stays silent in prod builds — the site itself falls
  // back to static content and public visitors never see admin surfaces.
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — admin, ' +
    'reviews, projects, and certs will use fallback content only.'
  );
}

export const supabase: SupabaseClient = createClient(
  url ?? 'http://localhost:54321',
  anonKey ?? 'public-anon-key-placeholder'
);
