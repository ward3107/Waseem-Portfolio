import { supabase } from '@/lib/supabaseClient';
import type { Language, LocalizedText, ReviewRow } from '@/types';

export type ReviewInput = Omit<ReviewRow, 'id' | 'created_at' | 'updated_at'>;

// Public site's rows — only approved. Anon RLS enforces this server-side too,
// but the explicit filter keeps the intent obvious in the code and avoids
// rendering rejected rows for an authenticated admin viewing the public site.
export async function listReviewRows(): Promise<ReviewRow[]> {
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
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('status', { ascending: true }) // pending first, then approved, then rejected
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ReviewRow[];
}

// Public form submission — always inserts as `pending` per RLS policy.
// Duplicates the same text into every language so the review renders for
// visitors browsing in any language until the admin edits per-language.
export interface PublicReviewSubmission {
  author: string;
  rating: number;
  quote: string;
  helpedWith: string;
  language: Language;
}

export async function submitPublicReview(input: PublicReviewSubmission): Promise<void> {
  const text: LocalizedText = { en: input.quote, he: input.quote, ar: input.quote };
  const helped: LocalizedText = { en: input.helpedWith, he: input.helpedWith, ar: input.helpedWith };
  const { error } = await supabase.from('reviews').insert({
    author: input.author,
    rating: input.rating,
    text,
    helped_with: helped,
    status: 'pending',
    sort_order: 0,
  });
  if (error) throw error;
}

export async function createReview(input: ReviewInput): Promise<void> {
  const { error } = await supabase.from('reviews').insert(input);
  if (error) throw error;
}

export async function updateReview(id: string, input: Partial<ReviewInput>): Promise<void> {
  const { error } = await supabase.from('reviews').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderReviews(orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, i) =>
    supabase.from('reviews').update({ sort_order: i }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const failure = results.find((r) => r.error);
  if (failure?.error) throw failure.error;
}
