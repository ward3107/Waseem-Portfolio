import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Trash2, Loader2 } from 'lucide-react';
import Topbar from '../layout/Topbar';
import Skeleton from '../primitives/Skeleton';
import ImageGallery from '../primitives/ImageGallery';
import {
  createCert,
  deleteCert,
  listCertRows,
  updateCert,
  type CertificationInput,
} from '../../../lib/content/certifications';
import { toastSaved, toastDeleted, toastError } from '../../../lib/adminToast';
import { useConfirm } from '../../../hooks/useConfirm';
import type { Language } from '../../../types';

const EMPTY: CertificationInput = {
  slug: '',
  title: { en: '', he: '', ar: '' },
  issuer: '',
  issue_date: '',
  expiry_date: null,
  credential_url: '',
  image_url: null,
  sort_order: 0,
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

const CertEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [form, setForm] = useState<CertificationInput>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [titleLang, setTitleLang] = useState<Language>('en');

  useEffect(() => {
    if (isNew) return;
    let active = true;
    listCertRows()
      .then((rows) => {
        if (!active) return;
        const row = rows.find((r) => r.id === id);
        if (!row) {
          toastError(new Error('Certificate not found'), 'Not found');
          navigate('/admin/certifications');
          return;
        }
        const { id: _id, created_at: _c, updated_at: _u, ...rest } = row;
        const t = rest.title ?? {};
        setForm({ ...rest, title: { en: t.en ?? '', he: t.he ?? '', ar: t.ar ?? '' } });
      })
      .catch((err) => toastError(err, 'Could not load certificate'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, isNew, navigate]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const patch = <K extends keyof CertificationInput>(key: K, value: CertificationInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (isNew) {
        await createCert(form);
        toastSaved('Certificate created');
        setDirty(false);
        navigate('/admin/certifications');
      } else if (id) {
        await updateCert(id, form);
        toastSaved('Certificate');
        setDirty(false);
      }
    } catch (err) {
      toastError(err, 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!saving && form.slug && form.title.en && form.issuer && form.issue_date && form.credential_url) save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onDelete = async () => {
    if (isNew || !id) return;
    const ok = await confirm({
      title: `Delete "${form.title.en || form.slug}"?`,
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteCert(id);
      toastDeleted(form.title.en || form.slug);
      navigate('/admin/certifications');
    } catch (err) {
      toastError(err, 'Could not delete');
    }
  };

  return (
    <>
      <Topbar
        title={isNew ? 'New certificate' : `Edit: ${form.title.en || '…'}`}
        actions={
          <>
            {!isNew && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 size={14} aria-hidden="true" /> Delete
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={saving || !form.slug || !form.title.en || !form.issuer || !form.issue_date || !form.credential_url}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      />

      {loading ? (
        <div className="p-6 space-y-3"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-32 w-full" /></div>
      ) : (
        <div className="p-4 sm:p-6 max-w-2xl space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Basics</legend>
            <label className="block">
              <span className="text-xs font-medium">Slug</span>
              <input
                required
                value={form.slug}
                onChange={(e) => patch('slug', slugify(e.target.value))}
                placeholder="google-ads-search"
                className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </label>
            <div>
              <div className="flex items-center gap-1 text-xs mb-1">
                <span className="font-medium mr-2">Title</span>
                {(['en', 'he', 'ar'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setTitleLang(lang)}
                    className={`px-2 py-0.5 rounded ${titleLang === lang ? 'bg-zinc-200 dark:bg-zinc-700 font-semibold' : 'text-zinc-500'}`}
                  >
                    {lang.toUpperCase()}{lang === 'en' && ' *'}
                  </button>
                ))}
              </div>
              <input
                required={titleLang === 'en'}
                value={form.title[titleLang] ?? ''}
                onChange={(e) => patch('title', { ...form.title, [titleLang]: e.target.value })}
                placeholder={titleLang === 'en' ? 'Required. e.g. Google Ads Search' : 'Optional translation'}
                className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </div>
            <label className="block">
              <span className="text-xs font-medium">Issuer</span>
              <input
                required
                value={form.issuer}
                onChange={(e) => patch('issuer', e.target.value)}
                placeholder="Google Skillshop"
                className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium">Issue date</span>
                <input
                  required
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => patch('issue_date', e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium">Expiry date</span>
                <input
                  type="date"
                  value={form.expiry_date ?? ''}
                  onChange={(e) => patch('expiry_date', e.target.value || null)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-medium">Credential URL</span>
              <input
                required
                type="url"
                value={form.credential_url}
                onChange={(e) => patch('credential_url', e.target.value)}
                placeholder="https://credential.net/…"
                className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Certificate image / PDF</legend>
            <ImageGallery
              value={form.image_url ? [form.image_url] : []}
              folder={`certifications/${form.slug || 'misc'}`}
              onChange={(urls) => patch('image_url', urls[0] ?? null)}
            />
          </fieldset>
        </div>
      )}
    </>
  );
};

export default CertEditor;
