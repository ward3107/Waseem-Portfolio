import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GripVertical, Plus, Pencil, Trash2, Star, Check, X as XIcon, Languages, Loader2 } from 'lucide-react';
import Topbar from '@/features/admin/layout/Topbar';
import Skeleton from '@/features/admin/primitives/Skeleton';
import DragList from '@/features/admin/primitives/DragList';
import { listAllReviewRows, reorderReviews, deleteReview, updateReview } from '@/lib/content/reviews';
import type { Language, LocalizedText, ReviewRow, ReviewStatus } from '@/types';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { toastDeleted, toastError, toastSaved } from '@/lib/adminToast';
import { translateToAll } from '@/lib/content/translate';

const LANGS: Language[] = ['en', 'he', 'ar'];

// Backfill languages for a review's localized text. Handles both:
// - Empty language fields (row saved before translation was set up)
// - All fields containing the same text (fallback fill from a failed
//   translate call — the site then shows source-language text on every
//   locale). In the second case we overwrite the duplicates so the site
//   actually renders the visitor's chosen language.
async function fillMissingLanguages(text: LocalizedText | null | undefined): Promise<LocalizedText | null> {
  if (!text) return null;
  const source = LANGS.find((l) => (text[l] ?? '').trim());
  if (!source) return text;
  const sourceText = (text[source] ?? '').trim();
  const allDuplicated = LANGS.every((l) => (text[l] ?? '').trim() === sourceText);
  const anyMissing = LANGS.some((l) => !(text[l] ?? '').trim());
  if (!anyMissing && !allDuplicated) return text;
  const translated = await translateToAll(sourceText, source);
  return {
    // For each target: keep existing content only if it's non-empty AND
    // distinct from the source. Otherwise use the fresh translation.
    en: source === 'en' ? sourceText : chooseText(text.en, translated.en, sourceText),
    he: source === 'he' ? sourceText : chooseText(text.he, translated.he, sourceText),
    ar: source === 'ar' ? sourceText : chooseText(text.ar, translated.ar, sourceText),
  };
}

const chooseText = (existing: string | undefined, translation: string | undefined, sourceText: string): string => {
  const trimmed = (existing ?? '').trim();
  if (!trimmed) return translation ?? sourceText;
  if (trimmed === sourceText) return translation ?? sourceText;
  return existing ?? '';
};

const needsBackfill = (text: LocalizedText | null | undefined): boolean => {
  if (!text) return false;
  const values = LANGS.map((l) => (text[l] ?? '').trim());
  const filled = values.filter(Boolean);
  if (filled.length === 0) return false;
  if (filled.length < LANGS.length) return true;
  return values.every((v) => v === values[0]);
};

const ReviewsList: React.FC = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [rows, setRows] = useState<ReviewRow[] | null>(null);
  const [backfilling, setBackfilling] = useState(false);

  const load = () =>
    listAllReviewRows().then(setRows).catch((err) => toastError(err, 'Could not load reviews'));

  const setStatus = async (row: ReviewRow, status: ReviewStatus) => {
    try {
      await updateReview(row.id, { status });
      setRows((prev) => prev?.map((r) => (r.id === row.id ? { ...r, status } : r)) ?? null);
      toastSaved(`Review by ${row.author} → ${status}`);
    } catch (err) {
      toastError(err, 'Could not update status');
    }
  };

  const statusPill = (status: ReviewStatus) => {
    const styles: Record<ReviewStatus, string> = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return (
      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  useEffect(() => {
    load();
  }, []);

  const onReorder = async (next: ReviewRow[], ids: string[]) => {
    setRows(next);
    try {
      await reorderReviews(ids);
    } catch (err) {
      // Partial-failure safety: re-fetch instead of pretending to roll back —
      // some UPDATEs may have already committed. See reorderReviews.
      await load();
      toastError(err, 'Could not save new order — refreshed to actual DB state');
    }
  };

  const backfillMissing = async () => {
    if (!rows || backfilling) return;
    setBackfilling(true);
    let updated = 0;
    let failed = 0;
    try {
      for (const row of rows) {
        if (!needsBackfill(row.text) && !needsBackfill(row.helped_with)) continue;
        try {
          const [text, helped_with] = await Promise.all([
            fillMissingLanguages(row.text),
            fillMissingLanguages(row.helped_with),
          ]);
          const patch: { text?: LocalizedText; helped_with?: LocalizedText | null } = {};
          if (text && text !== row.text) patch.text = text;
          if (helped_with !== row.helped_with) patch.helped_with = helped_with;
          if (Object.keys(patch).length === 0) continue;
          await updateReview(row.id, patch);
          updated += 1;
        } catch {
          failed += 1;
        }
      }
      await load();
      if (updated > 0) toastSaved(`Backfilled ${updated} review${updated === 1 ? '' : 's'}`);
      if (failed > 0) toastError(new Error(`${failed} row(s) failed`), 'Some rows failed');
      if (updated === 0 && failed === 0) toastSaved('Nothing to backfill');
    } finally {
      setBackfilling(false);
    }
  };

  const onDelete = async (row: ReviewRow) => {
    const ok = await confirm({ title: `Delete review by "${row.author}"?`, danger: true });
    if (!ok) return;
    try {
      await deleteReview(row.id);
      setRows((prev) => prev?.filter((r) => r.id !== row.id) ?? null);
      toastDeleted(`Review by ${row.author}`);
    } catch (err) {
      toastError(err, 'Could not delete');
    }
  };

  return (
    <>
      <Topbar
        title="Reviews"
        actions={
          <>
            {rows && rows.length > 0 && (
              <button
                type="button"
                onClick={backfillMissing}
                disabled={backfilling}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                title="Fill or refresh language translations via AI for every review"
              >
                {backfilling ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
                {backfilling ? 'Translating…' : 'Translate all'}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/admin/reviews/new')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight"
            >
              <Plus size={14} aria-hidden="true" />
              Add review
            </button>
          </>
        }
      />
      <div className="p-4 sm:p-6">
        {rows === null && <Skeleton className="h-14 w-full" />}
        {rows && rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
            <p className="text-sm text-zinc-500 mb-3">No reviews yet. Only add real ones.</p>
            <Link
              to="/admin/reviews/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight"
            >
              <Plus size={14} aria-hidden="true" /> Add first review
            </Link>
          </div>
        )}
        {rows && rows.length > 0 && (
          <ul className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
            <DragList
              items={rows}
              onReorder={onReorder}
              renderItem={(row, h) => (
                <li
                  ref={h.ref}
                  style={h.style}
                  className={`flex items-center gap-3 px-3 py-2.5 ${h.isDragging ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
                >
                  <button
                    type="button"
                    aria-label="Drag to reorder"
                    {...h.attributes}
                    {...h.listeners}
                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical size={16} aria-hidden="true" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {row.author}
                      </p>
                      {statusPill(row.status)}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
                      {(row.text.he || row.text.en || row.text.ar || '').slice(0, 80)}
                      {(row.text.he || row.text.en || row.text.ar || '').length > 80 ? '…' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 text-brand-gold shrink-0" aria-label={`${row.rating} of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < row.rating ? 'fill-current' : 'opacity-30'} aria-hidden="true" />
                    ))}
                  </div>
                  {row.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setStatus(row, 'approved')}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700"
                        aria-label={`Approve review by ${row.author}`}
                        title="Approve"
                      >
                        <Check size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(row, 'rejected')}
                        className="p-1.5 text-red-500 hover:text-red-600"
                        aria-label={`Reject review by ${row.author}`}
                        title="Reject"
                      >
                        <XIcon size={14} aria-hidden="true" />
                      </button>
                    </>
                  )}
                  <Link
                    to={`/admin/reviews/${row.id}`}
                    className="p-1.5 text-zinc-400 hover:text-brand-purple"
                    aria-label={`Edit review by ${row.author}`}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="p-1.5 text-zinc-400 hover:text-red-600"
                    aria-label={`Delete review by ${row.author}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </li>
              )}
            />
          </ul>
        )}
      </div>
    </>
  );
};

export default ReviewsList;
