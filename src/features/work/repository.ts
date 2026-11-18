import { db } from '@/lib/content/db';
import { BUCKET, isLegacyAsset, PAGE_SIZE, type Work, type Scope } from './model';

export async function saveWork(work: Work): Promise<Work> {
  const client = await db();
  const { updated_at, ...fields } = work;
  const table = client.from('portfolio_works');
  const query = updated_at
    ? table.update(fields).eq('id', work.id).eq('updated_at', updated_at)
    : table.insert(fields);
  const { data, error } = await query.select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('העבודה נערכה בחלון אחר. יש לפתוח אותה מחדש לפני שמירה.');
  return data as Work;
}

export async function listAdminWorks(offset = 0): Promise<Work[]> {
  const client = await db();
  const { data, error } = await client
    .from('portfolio_works')
    .select('*')
    .order('updated_at', { ascending: false })
    .order('id')
    .range(offset, offset + PAGE_SIZE);
  if (error) throw error;
  return data ?? [];
}

export async function parentChoices(): Promise<Pick<Work, 'id' | 'title'>[]> {
  const client = await db();
  const result: Pick<Work, 'id' | 'title'>[] = [];
  for (let start = 0; ; start += 200) {
    const { data, error } = await client
      .from('portfolio_works')
      .select('id,title')
      .eq('kind', 'website')
      .eq('published', true)
      .order('id')
      .range(start, start + 199);
    if (error) throw error;
    result.push(...(data ?? []));
    if (!data || data.length < 200) return result;
  }
}

export async function getWork(id: string, publicOnly = true): Promise<Work | null> {
  const client = await db();
  let query = client.from('portfolio_works').select('*').eq('id', id);
  if (publicOnly) query = query.eq('published', true);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPage(scope: Scope, offset = 0, parent = ''): Promise<Work[]> {
  const client = await db();
  let query = client.from('portfolio_works').select('*').eq('published', true);
  if (scope === 'featured') query = query.eq('featured', true);
  else if (scope === 'project') {
    const slash = parent.indexOf('/');
    query = query.eq(
      parent.startsWith('work/') ? 'parent_id' : 'project_slug',
      parent.slice(slash + 1)
    );
  } else {
    const kind = { websites: 'website', videos: 'video', gallery: 'album' }[scope];
    query = query.eq('kind', kind).eq('listed', true);
  }
  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .order('id')
    .range(offset, offset + (scope === 'featured' ? 5 : PAGE_SIZE));
  if (error) throw error;
  return data ?? [];
}

export async function mediaUrls(paths: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const stored: string[] = [];
  for (const path of new Set(paths)) {
    if (isLegacyAsset(path)) result[path] = path;
    else if (path) stored.push(path);
  }
  if (stored.length) {
    const client = await db();
    const { data, error } = await client.storage.from(BUCKET).createSignedUrls(stored, 3600);
    if (error) throw error;
    for (const item of data ?? [])
      if (item.path && item.signedUrl && !item.error) result[item.path] = item.signedUrl;
  }
  return result;
}
