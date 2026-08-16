import type { ReviewRow } from '@/types';

/**
 * Approved reviews, baked in at build time by scripts/generate-reviews.mjs.
 *
 * DO NOT EDIT BY HAND, and keep this committed as an empty array — `npm run
 * build` fills it from Supabase on each deploy. To change what appears on the
 * site, approve or edit reviews in /admin/reviews and redeploy.
 *
 * Why this exists: reviews live in Supabase, and the static REVIEWS array in
 * ./data.ts is intentionally empty (no invented testimonials). That meant the
 * whole testimonials section rendered as nothing and then dropped in ~700ms
 * later when the query returned, growing the page by ~1070px and shoving
 * everything below it down mid-read. Compiling the rows into the bundle lets
 * the section render at its true height in the first paint. The runtime query
 * in useReviews still runs and replaces this snapshot, so a review approved
 * after the last deploy still shows up without a redeploy.
 *
 * Raw rows rather than localized `Review` objects on purpose: the visitor's
 * language is only known at runtime, so localization happens at render.
 *
 * An empty array here is a valid state — it just restores the previous
 * behaviour (nothing until the query resolves).
 */
export const GENERATED_REVIEW_ROWS: ReviewRow[] = [];
