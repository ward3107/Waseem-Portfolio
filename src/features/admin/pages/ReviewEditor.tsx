import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Trash2, Loader2, Star } from 'lucide-react';
import Topbar from '@/features/admin/layout/Topbar';
import Skeleton from '@/features/admin/primitives/Skeleton';
import MarkdownEditor from '@/features/admin/primitives/MarkdownEditor';
import {
  createReview,
  deleteReview,
  listReviewRows,
  updateReview,
  type ReviewInput,
} from '@/lib/content/reviews';
import { toastSaved, toastDeleted, toastError } from '@/lib/adminToast';
import { useConfirm } from '@/shared/hooks/useConfirm';
import type { Language } from '@/types';

const EMPTY: ReviewInput = {
  author: '',
  rating: 5,
  text: { en: '', he: '', ar: '' },
  helped_with: null,
  location: null,
  date: null,
  status: 'approved',
  sort_order: 0,
};

const StarPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover ?? value) >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            className="p-1"
          >
            <Star
              size={22}
              className={active ? 'fill-brand-gold text-brand-gold' : 'text-zinc-300 dark:text-zinc-700'}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
};

const ReviewEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [form, setForm] = useState<ReviewInput>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [textLang, setTextLang] = useState<Language>('en');

  useEffect(() => {
    if (isNew) return;
    let active = true;
    listReviewRows()
      .then((rows) => {
        if (!active) return;
        const row = rows.find((r) => r.id === id);
        if (!row) {
          toastError(new Error('Review not found'), 'Not found');
          navigate('/admin/reviews');
          return;
        }
        const { id: _id, created_at: _c, updated_at: _u, ...rest } = row;
        const t = rest.text ?? {};
        setForm({ ...rest, text: { en: t.en ?? '', he: t.he ?? '', ar: t.ar ?? '' } });
      })
      .catch((err) => toastError(err, 'Could not load review'))
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

  const patch = <K extends keyof ReviewInput>(key: K, value: ReviewInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    if (saving || !dirty || !form.author || !form.text.en) return;
    setSaving(true);
    try {
      if (isNew) {
        await createReview(form);
        toastSaved('Review created');
        setDirty(false);
        navigate('/admin/reviews');
      } else if (id) {
        await updateReview(id, form);
        toastSaved('Review');
        setDirty(false);
      }
    } catch (err) {
      toastError(err, 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  // Cmd/Ctrl+S saves. Listener attaches once; the ref keeps `save` fresh
  // without re-attaching the keydown handler on every render.
  const saveRef = useRef(save);
  useEffect(() => { saveRef.current = save; });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onDelete = async () => {
    if (isNew || !id) return;
    const ok = await confirm({ title: `Delete review by "${form.author}"?`, danger: true });
    if (!ok) return;
    try {
      await deleteReview(id);
      toastDeleted(`Review by ${form.author}`);
      navigate('/admin/reviews');
    } catch (err) {
      toastError(err, 'Could not delete');
    }
  };

  return (
    <>
      <Topbar
        title={isNew ? 'New review' : `Edit review by ${form.author}`}
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
              disabled={saving || !form.author || !form.text.en}
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
              <span className="text-xs font-medium">Author name</span>
              <input
                required
                value={form.author}
                onChange={(e) => patch('author', e.target.value)}
                placeholder="e.g. Dana Cohen"
                className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </label>
            <div>
              <p className="text-xs font-medium mb-1">Rating</p>
              <StarPicker value={form.rating} onChange={(v) => patch('rating', v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium">Location (optional)</span>
                <input
                  value={form.location ?? ''}
                  onChange={(e) => patch('location', e.target.value || null)}
                  placeholder="עכו"
                  className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium">Date (optional)</span>
                <input
                  type="date"
                  value={form.date ?? ''}
                  onChange={(e) => patch('date', e.target.value || null)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Review text</legend>
            <div className="flex gap-1 text-xs">
              {(['en', 'he', 'ar'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setTextLang(lang)}
                  className={`px-2 py-1 rounded ${textLang === lang ? 'bg-zinc-200 dark:bg-zinc-700 font-semibold' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                  {lang.toUpperCase()}{lang === 'en' && ' *'}
                </button>
              ))}
            </div>
            <MarkdownEditor
              value={form.text[textLang] ?? ''}
              onChange={(v) => patch('text', { ...form.text, [textLang]: v })}
              placeholder={textLang === 'en' ? 'Required. The review text.' : 'Optional translation.'}
              ariaLabel={`Review text in ${textLang.toUpperCase()}`}
            />
          </fieldset>
        </div>
      )}
    </>
  );
};

export default ReviewEditor;
