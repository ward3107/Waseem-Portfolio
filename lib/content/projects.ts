import { supabase } from '../supabaseClient';
import type { ProjectRow } from '../../types';

// updated_at is server-managed by the touch_updated_at() trigger.
export type ProjectInput = Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'>;

export async function listProjectRows(): Promise<ProjectRow[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}

export async function createProject(input: ProjectInput): Promise<void> {
  const { error } = await supabase.from('projects').insert(input);
  if (error) throw error;
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<void> {
  const { error } = await supabase.from('projects').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

/** Reassign sort_order to match the given id order (0-indexed). */
export async function reorderProjects(orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, i) =>
    supabase.from('projects').update({ sort_order: i }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const failure = results.find((r) => r.error);
  if (failure?.error) throw failure.error;
}
