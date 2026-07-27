import React, { useEffect, useState } from 'react';
import type { CertificationRow, LocalizedText } from '../../types';
import {
  listCertRows, createCert, updateCert, deleteCert, type CertificationInput,
} from '../../lib/content/certifications';
import ImageUpload from './ImageUpload';
import LocalizedTextInput from './LocalizedTextInput';

const EMPTY: CertificationInput = {
  slug: '', title: { en: '' } as LocalizedText, issuer: '', issue_date: '',
  expiry_date: null, credential_url: '', image_url: null, sort_order: 0,
};

const CertificationsManager: React.FC = () => {
  const [rows, setRows] = useState<CertificationRow[]>([]);
  const [editing, setEditing] = useState<CertificationInput & { id?: string }>({ ...EMPTY });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reload = () => listCertRows().then(setRows).catch((e) => setError(e.message));
  useEffect(() => { reload(); }, []);
  const reset = () => setEditing({ ...EMPTY });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { id, ...input } = editing;
      if (id) await updateCert(id, input);
      else await createCert(input);
      reset();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this certificate?')) return;
    await deleteCert(id);
    await reload();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-4 bg-gray-900 p-4 rounded-xl">
        <h2 className="font-bold">{editing.id ? 'Edit certificate' : 'Add certificate'}</h2>
        <input required placeholder="Slug (e.g. google-ads-search)" value={editing.slug}
          onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <LocalizedTextInput label="Title" value={editing.title}
          onChange={(title) => setEditing({ ...editing, title })} />
        <input required placeholder="Issuer" value={editing.issuer}
          onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <label className="block text-sm">Issue date
          <input required type="date" value={editing.issue_date}
            onChange={(e) => setEditing({ ...editing, issue_date: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        </label>
        <label className="block text-sm">Expiry date (optional)
          <input type="date" value={editing.expiry_date ?? ''}
            onChange={(e) => setEditing({ ...editing, expiry_date: e.target.value || null })}
            className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        </label>
        <input required placeholder="Credential URL" value={editing.credential_url}
          onChange={(e) => setEditing({ ...editing, credential_url: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-gray-800" />
        <ImageUpload value={editing.image_url} folder={`certifications/${editing.slug || 'misc'}`}
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
            <span>{r.title.en} <span className="text-gray-500 text-sm">({r.issuer})</span></span>
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

export default CertificationsManager;
