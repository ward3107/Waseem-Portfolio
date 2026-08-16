import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Lazily-resolved Supabase client for the content layer.
 *
 * Every module in `lib/content` is reachable from the public site's static
 * import graph — `useProjects`, `useReviews` and `useCertifications` are
 * rendered by sections the home, projects and about pages import directly.
 * A top-level `import { supabase }` in any one of them therefore drags all of
 * supabase-js (GoTrue + Realtime + PostgREST, ~56 KB gzipped) into the entry
 * chunk and onto the critical path, in front of first paint.
 *
 * Resolving the client through this helper instead keeps it in its own chunk,
 * fetched in parallel once a section actually asks for data. Call it once at
 * the top of each async function:
 *
 *   const supabase = await db();
 *
 * The type-only import above is erased at build time and costs nothing.
 */
export async function db(): Promise<SupabaseClient> {
  const { supabase } = await import('@/lib/supabaseClient');
  return supabase;
}
