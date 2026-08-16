/**
 * Supabase *configuration* only — deliberately free of any `@supabase/supabase-js`
 * import.
 *
 * Several public-site modules only need to know *whether* Supabase is set up
 * (to decide between live content and the static fallback). Importing that flag
 * from `supabaseClient.ts` used to drag the entire supabase-js library —
 * GoTrue (auth) + Realtime (websockets) + PostgREST, ~110 KB raw — into the
 * main entry chunk that every visitor downloads, purely so a boolean could be
 * read. Keeping the flag here lets those modules stay on the light path.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when both env vars are present. The site still renders (with fallback
 *  content) when Supabase is not configured, so we never throw at import time. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabaseUrl = url ?? 'http://localhost:54321';
export const supabaseAnonKey = anonKey ?? 'public-anon-key-placeholder';
