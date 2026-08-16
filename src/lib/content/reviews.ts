import { db } from '@/lib/content/db';
import { translateToAll } from '@/lib/content/translate';
import type { Language, ReviewRow } from '@/types';

export type ReviewInput = Omit<ReviewRow, 'id' | 'created_at' | 'updated_at'>;

// Public site's rows — only approved. Anon RLS enforces this server-side too,
// but the explicit filter keeps the intent obvious in the code and avoids
// rendering rejected rows for an authenticated admin viewing the public site.
export async function listReviewRows(): Promise<ReviewRow[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ReviewRow[];
}

// Admin sees everything — pending/approved/rejected — so it can moderate.
export async function listAllReviewRows(): Promise<ReviewRow[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('status', { ascending: true }) // pending first, then approved, then rejected
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ReviewRow[];
}

// Public form submission — always inserts as `pending` per RLS policy.
// Fires the Gemini-backed `translate-review` Edge Function in parallel for
// the quote and the "helped with" label so the row lands with all three
// languages populated up-front. Both translations fall back to the source
// text on any failure (see translateToAll), so a submission is never
// blocked by an API issue.
export interface PublicReviewSubmission {
  author: string;
  rating: number;
  quote: string;
  helpedWith: string;
  language: Language;
  /** Optional extras — persisted only if the matching columns exist (see the
   *  migration in supabase/reviews-extra-fields.sql). The insert degrades
   *  gracefully if they don't, so deploying this code before running the
   *  migration never breaks the form. */
  location?: string;
  roleCompany?: string;
  wouldRecommend?: boolean;
}

// Postgres / PostgREST error codes for "column doesn't exist in the schema
// cache" — thrown when the optional columns haven't been migrated yet.
const MISSING_COLUMN_CODES = new Set(['PGRST204', '42703']);

export async function submitPublicReview(input: PublicReviewSubmission): Promise<void> {
  const supabase = await db();
  const [text, helped] = await Promise.all([
    translateToAll(input.quote, input.language),
    translateToAll(input.helpedWith, input.language),
  ]);

  const base = {
    author: input.author,
    rating: input.rating,
    text,
    helped_with: helped,
    status: 'pending',
    sort_order: 0,
  };
  const extras: Record<string, unknown> = {};
  if (input.location) extras.location = input.location;
  if (input.roleCompany) extras.role_company = input.roleCompany;
  if (typeof input.wouldRecommend === 'boolean') extras.would_recommend = input.wouldRecommend;

  // Try with the extra columns; if the DB doesn't have them yet, retry with
  // just the base columns so the submission still succeeds.
  const { error } = await supabase.from('reviews').insert({ ...base, ...extras });
  if (!error) return;

  const isMissingColumn =
    MISSING_COLUMN_CODES.has(error.code ?? '') ||
    /column .* does not exist|could not find/i.test(error.message ?? '');
  if (isMissingColumn && Object.keys(extras).length > 0) {
    const retry = await supabase.from('reviews').insert(base);
    if (retry.error) throw retry.error;
    return;
  }
  throw error;
}

export async function createReview(input: ReviewInput): Promise<void> {
  const supabase = await db();
  const { error } = await supabase.from('reviews').insert(input);
  if (error) throw error;
}

export async function updateReview(id: string, input: Partial<ReviewInput>): Promise<void> {
  const supabase = await db();
  const { error } = await supabase.from('reviews').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const supabase = await db();
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderReviews(orderedIds: string[]): Promise<void> {
  const supabase = await db();
  const updates = orderedIds.map((id, i) =>
    supabase.from('reviews').update({ sort_order: i }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const failure = results.find((r) => r.error);
  if (failure?.error) throw failure.error;
}
