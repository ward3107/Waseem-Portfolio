import React, { useEffect, useState } from 'react';
import type { ProjectRow, LocalizedText } from '../../types';
import {
  listProjectRows, createProject, updateProject, deleteProject, type ProjectInput,
} from '../../lib/content/projects';
import { fetchRepoMeta } from '../../lib/github';
import ImageUpload from './ImageUpload';
import LocalizedTextInput from './LocalizedTextInput';

const EMPTY: ProjectInput = {
  slug: '', title: '', category: 'Web', description: { en: '' } as LocalizedText,
  image_url: null, tech: [], link: null, github: null, screenshots: [], sort_order: 0,
};

const ProjectsManager: React.FC = () => {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [editing, setEditing] = useState<ProjectInput & { id?: string }>({ ...EMPTY });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = () => listProjectRows().then(setRows).catch((e) => setError(e.message));
  useEffect(() => { reload(); }, []);
  const reset = () => setEditing({ ...EMPTY });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { id, ...input } = editing;
      if (id) await updateProject(id, input);
      else await createProject(input);
      reset();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await deleteProject(id);
    await reload();
  };

  const autofill = async () => {
    if (!editing.github) return;
    const meta = await fetchRepoMeta(editing.github);
    if (!meta) { setError('Could not read that GitHub repo'); return; }
    setEditing((p) => ({
      ...p,
      title: p.title || meta.title,
      description: { ...p.description, en: p.description.en || meta.description },
      tech: p.tech.length ? p.tech : meta.tech,
      github: meta.github,
    }));
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-4 bg-gray-900 p-4 rounded-xl">
        <h2 className="font-bold">{editing.id ? 'Edit project' : 'Add project'}</h2>
        <input required placeholder="Slug (e.g. souvlaki)" value={editing.slug}
          onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <input required placeholder="Title" value={editing.title}
          onChange={(e) => setEditing({ ...editing, title: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <select value={editing.category}
          onChange={(e) => setEditing({ ...editing, category: e.target.value as ProjectInput['category'] })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800">
          <option>Web</option><option>AI</option><option>Mobile</option>
        </select>
        <LocalizedTextInput label="Description" multiline value={editing.description}
          onChange={(description) => setEditing({ ...editing, description })} />
        <input placeholder="Live link" value={editing.link ?? ''}
          onChange={(e) => setEditing({ ...editing, link: e.target.value || null })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <div className="flex gap-2">
          <input placeholder="GitHub URL" value={editing.github ?? ''}
            onChange={(e) => setEditing({ ...editing, github: e.target.value || null })}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800" />
          <button type="button" onClick={autofill}
            className="px-3 py-2 rounded-lg bg-gray-700 text-sm">Auto-fill</button>
        </div>
        <input placeholder="Tech (comma separated)" value={editing.tech.join(', ')}
          onChange={(e) => setEditing({ ...editing, tech: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <ImageUpload value={editing.image_url} folder={`projects/${editing.slug || 'misc'}`}
          onChange={(url) => setEditing({ ...editing, image_url: url })} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-brand-purple font-bold disabled:opacity-50">
            {editing.id ? 'Update' : 'Add'}
          </button>
          {editing.id && <button type="button" onClick={reset} className="px-4 py-2 rounded-lg bg-gray-700">Cancel</button>}
        </div>
      </form>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between bg-gray-900 px-4 py-3 rounded-lg">
            <span>{r.title} <span className="text-gray-500 text-sm">({r.category})</span></span>
            <span className="flex gap-3 text-sm">
              <button onClick={() => setEditing({ ...r })} className="text-blue-400">Edit</button>
              <button onClick={() => remove(r.id)} className="text-red-400">Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectsManager;
