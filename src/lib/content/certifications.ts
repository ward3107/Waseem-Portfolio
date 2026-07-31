import { supabase } from '@/lib/supabaseClient';
import type { CertificationRow } from '@/types';

export type CertificationInput = Omit<CertificationRow, 'id' | 'created_at' | 'updated_at'>;

export async function listCertRows(): Promise<CertificationRow[]> {
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CertificationRow[];
}

export async function createCert(input: CertificationInput): Promise<void> {
  const { error } = await supabase.from('certifications').insert(input);
  if (error) throw error;
}

export async function updateCert(id: string, input: Partial<CertificationInput>): Promise<void> {
  const { error } = await supabase.from('certifications').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteCert(id: string): Promise<void> {
  const { error } = await supabase.from('certifications').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderCerts(orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, i) =>
    supabase.from('certifications').update({ sort_order: i }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const failure = results.find((r) => r.error);
  if (failure?.error) throw failure.error;
}
