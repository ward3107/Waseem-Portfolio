import React, { useEffect, useState } from 'react';
import type { ReviewRow, LocalizedText } from '../../types';
import {
  listReviewRows, createReview, updateReview, deleteReview, type ReviewInput,
} from '../../lib/content/reviews';
import LocalizedTextInput from './LocalizedTextInput';

const EMPTY: ReviewInput = {
  author: '', rating: 5, text: { en: '' } as LocalizedText,
  location: null, date: null, sort_order: 0,
};

const ReviewsManager: React.FC = () => {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [editing, setEditing] = useState<ReviewInput & { id?: string }>({ ...EMPTY });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = () => listReviewRows().then(setRows).catch((e) => setError(e.message));
  useEffect(() => { reload(); }, []);
  const reset = () => setEditing({ ...EMPTY });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { id, ...input } = editing;
      if (id) await updateReview(id, input);
      else await createReview(input);
      reset();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await deleteReview(id);
    await reload();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-4 bg-gray-900 p-4 rounded-xl">
        <h2 className="font-bold">{editing.id ? 'Edit review' : 'Add review'}</h2>
        <input required placeholder="Author" value={editing.author}
          onChange={(e) => setEditing({ ...editing, author: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <label className="block text-sm">Rating
          <select value={editing.rating}
            onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg bg-gray-800">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <LocalizedTextInput label="Review text" multiline value={editing.text}
          onChange={(text) => setEditing({ ...editing, text })} />
        <input placeholder="Location (optional)" value={editing.location ?? ''}
          onChange={(e) => setEditing({ ...editing, location: e.target.value || null })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <label className="block text-sm">Date (optional)
          <input type="date" value={editing.date ?? ''}
            onChange={(e) => setEditing({ ...editing, date: e.target.value || null })}
            className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        </label>
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
            <span>{r.author} — {'★'.repeat(r.rating)}</span>
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

export default ReviewsManager;
