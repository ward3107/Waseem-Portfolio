// Bakes the approved reviews from Supabase into the bundle at build time,
// writing src/features/reviews/generated.ts.
//
// Reviews live in Supabase and the static REVIEWS array is intentionally
// empty, so the testimonials section used to render as nothing and then drop
// in ~700ms later when the query returned — growing the page by ~1000px and
// pushing everything below it down while the visitor was reading. Compiling
// the rows in lets the section render at its true height in the first paint.
// useReviews still queries at runtime and replaces this snapshot, so a review
// approved after the last deploy appears without a redeploy.
//
// Degrades quietly: with no Supabase env, an unreachable API or a bad
// response, the existing file is left untouched and the build continues. The
// site then behaves exactly as it did before this script existed.
//
// Run: node scripts/generate-reviews.mjs   (also run by `npm run build`)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'src', 'features', 'reviews', 'generated.ts');
const MARKER = 'export const GENERATED_REVIEW_ROWS: ReviewRow[] =';
const TIMEOUT_MS = 10_000;

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

const skip = (why) => {
  console.log(`[reviews] ${why} — leaving generated.ts unchanged.`);
  process.exit(0);
};

if (!url || !anonKey) skip('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set');

// Only approved reviews: the anon RLS policy enforces this server-side too,
// but asking for it explicitly keeps the intent obvious and avoids baking a
// pending submission into the bundle if the policy ever loosens.
const endpoint =
  `${url.replace(/\/$/, '')}/rest/v1/reviews` + `?select=*&status=eq.approved&order=sort_order.asc`;

let rows;
try {
  const res = await fetch(endpoint, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) skip(`Supabase returned ${res.status} ${res.statusText}`);
  rows = await res.json();
} catch (err) {
  skip(`could not reach Supabase (${err?.message ?? err})`);
}

if (!Array.isArray(rows)) skip('unexpected response shape (expected an array)');

// Keep only what the Review model and its JSON-LD actually read, so the
// bundle doesn't carry moderation metadata to every visitor.
const slim = rows.map((r) => ({
  id: r.id,
  author: r.author,
  rating: r.rating,
  text: r.text,
  helped_with: r.helped_with ?? null,
  location: r.location ?? null,
  role_company: r.role_company ?? null,
  would_recommend: r.would_recommend ?? null,
  date: r.date ?? null,
  status: r.status,
  sort_order: r.sort_order,
  created_at: r.created_at,
  updated_at: r.updated_at,
}));

const current = readFileSync(OUT, 'utf8');
const idx = current.indexOf(MARKER);
if (idx === -1) skip(`could not find "${MARKER}" in generated.ts`);

const next = current.slice(0, idx) + `${MARKER} ${JSON.stringify(slim, null, 2)};\n`;

if (next !== current) writeFileSync(OUT, next);
console.log(`[reviews] baked ${slim.length} approved review(s) into generated.ts`);
