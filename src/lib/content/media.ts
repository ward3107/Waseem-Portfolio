import { db } from '@/lib/content/db';

const BUCKET = 'assets';

export interface MediaAsset {
  path: string; // e.g. "projects/souvlaki/2024-1234.webp"
  url: string; // public URL
  name: string; // basename
  size: number;
  updated_at: string;
}

/** Recursively walk the assets bucket. Bucket root + one level of folders
 *  is what the site uses today (projects/<slug>/, certifications/<slug>/). */
export async function listAssets(): Promise<MediaAsset[]> {
  const supabase = await db();
  const results: MediaAsset[] = [];
  const seen = new Set<string>();

  const walk = async (prefix: string) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: 1000, sortBy: { column: 'updated_at', order: 'desc' } });
    if (error) throw error;
    for (const entry of data ?? []) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Supabase reports folders as entries with metadata === null.
      if (entry.metadata) {
        if (seen.has(full)) continue;
        seen.add(full);
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(full);
        results.push({
          path: full,
          url: pub.publicUrl,
          name: entry.name,
          size: (entry.metadata.size as number) ?? 0,
          updated_at: entry.updated_at ?? entry.created_at ?? '',
        });
      } else {
        await walk(full);
      }
    }
  };

  await walk('');
  return results.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
}

export async function deleteAssets(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = await db();
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw error;
}

/** Find which content rows reference a given asset URL. */
export interface AssetUsage {
  projects: { id: string; title: string }[];
  certifications: { id: string; slug: string }[];
}
export async function getAssetUsage(url: string): Promise<AssetUsage> {
  const supabase = await db();
  // Fetch project rows in two typed queries — one for the cover URL (an
  // eq on a text column) and one for the screenshots array — instead of
  // .or()-interpolating the URL into a PostgREST filter string. The .or()
  // form breaks on commas/braces/quotes in the URL and silently returns
  // 'unused' for anything it can't parse, which would then be deleted.
  const [projByCover, projByShot, certs] = await Promise.all([
    supabase.from('projects').select('id, title').eq('image_url', url),
    supabase.from('projects').select('id, title').contains('screenshots', [url]),
    supabase.from('certifications').select('id, slug').eq('image_url', url),
  ]);

  const byId = new Map<string, { id: string; title: string }>();
  for (const p of projByCover.data ?? []) byId.set(p.id, { id: p.id, title: p.title });
  for (const p of projByShot.data ?? []) byId.set(p.id, { id: p.id, title: p.title });

  return {
    projects: Array.from(byId.values()),
    certifications: (certs.data ?? []).map((c) => ({ id: c.id, slug: c.slug })),
  };
}
