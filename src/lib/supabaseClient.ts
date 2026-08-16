import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from '@/lib/supabaseConfig';

// Re-exported for backwards compatibility. Prefer importing this from
// '@/lib/supabaseConfig' directly — modules on the public site's eager path
// must not reach this file, or supabase-js lands in the main entry chunk.
export { isSupabaseConfigured };

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // Loud in dev so nobody demos the site with admin sign-in silently pointing
  // at localhost:54321. Stays silent in prod builds — the site itself falls
  // back to static content and public visitors never see admin surfaces.
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — admin, ' +
    'reviews, projects, and certs will use fallback content only.'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
