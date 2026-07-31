import { supabase } from '@/lib/supabaseClient';
import type { ReviewRow } from '@/types';

export type ReviewInput = Omit<ReviewRow, 'id' | 'created_at' | 'updated_at'>;

export async function listReviewRows(): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ReviewRow[];
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
