import { supabase } from '../supabaseClient';

const BUCKET = 'assets';

/**
 * Types the public `assets` bucket accepts. Mirrors the bucket's server-side
 * `allowed_mime_types` (see supabase/schema.sql) — this copy only exists to
 * fail fast with a readable message instead of a raw storage error.
 * SVG is excluded on purpose: it is an active-content format and the bucket is
 * served publicly.
 */
const ALLOWED = new Map<string, string>([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
  ['application/pdf', 'pdf'],
]);

const MAX_BYTES = 5 * 1024 * 1024;

/** Upload a file under `folder/` and return its public URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  // Derive the extension from the sniffed MIME type, never from the filename —
  // a filename is attacker-supplied text and says nothing about the contents.
  const ext = ALLOWED.get(file.type);
  if (!ext) {
    throw new Error(
      `Unsupported file type "${file.type || 'unknown'}". Allowed: PNG, JPEG, WebP, AVIF, PDF.`
    );
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`File is too large (max ${MAX_BYTES / 1024 / 1024} MB).`);
  }
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '-');
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Best-effort delete of an uploaded image given its public URL. */
export async function deleteImageByUrl(url: string): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = url.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
