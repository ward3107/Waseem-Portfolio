import { supabase } from '@/lib/supabaseClient';

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

/**
 * Read the first bytes of the file and match against magic numbers.
 * Returns the true MIME type or null if unrecognized.
 * `file.type` is browser-derived from the filename extension and is trivially
 * forged (rename evil.svg → evil.png and it lies), so we don't trust it here.
 */
async function sniffMime(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const starts = (bytes: number[], offset = 0) =>
    bytes.every((b, i) => head[offset + i] === b);
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
  // JPEG: FF D8 FF
  if (starts([0xff, 0xd8, 0xff])) return 'image/jpeg';
  // WebP: RIFF ???? WEBP
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp';
  // AVIF / HEIC-family: ???? ftyp avif  (bytes 4-11)
  if (starts([0x66, 0x74, 0x79, 0x70], 4) && starts([0x61, 0x76, 0x69, 0x66], 8)) return 'image/avif';
  // PDF: %PDF
  if (starts([0x25, 0x50, 0x44, 0x46])) return 'application/pdf';
  return null;
}

/** Upload a file under `folder/` and return its public URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  // Sniff the actual content bytes rather than trusting file.type — the
  // browser derives file.type from the filename extension, so it lies for
  // any renamed file. Refusing here matches the bucket's allow-list and
  // stops mislabeled files from being served with the wrong Content-Type.
  const sniffed = await sniffMime(file);
  const ext = sniffed ? ALLOWED.get(sniffed) : undefined;
  if (!sniffed || !ext) {
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
    contentType: sniffed,
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
