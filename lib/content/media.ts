import { supabase } from '../supabaseClient';

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
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) throw error;
}

/** Find which content rows reference a given asset URL. */
export interface AssetUsage {
  projects: { id: string; title: string }[];
  certifications: { id: string; slug: string }[];
}
export async function getAssetUsage(url: string): Promise<AssetUsage> {
  const [proj, certs] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, image_url, screenshots')
      .or(`image_url.eq.${url},screenshots.cs.{"${url}"}`),
    supabase
      .from('certifications')
      .select('id, slug, image_url')
      .eq('image_url', url),
  ]);

  return {
    projects: (proj.data ?? []).map((p) => ({ id: p.id, title: p.title })),
    certifications: (certs.data ?? []).map((c) => ({ id: c.id, slug: c.slug })),
  };
}
