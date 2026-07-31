import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GripVertical, Plus, Pencil, Trash2, Star } from 'lucide-react';
import Topbar from '@/features/admin/layout/Topbar';
import Skeleton from '@/features/admin/primitives/Skeleton';
import DragList from '@/features/admin/primitives/DragList';
import { listReviewRows, reorderReviews, deleteReview } from '@/lib/content/reviews';
import type { ReviewRow } from '@/types';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { toastDeleted, toastError } from '@/lib/adminToast';

const ReviewsList: React.FC = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [rows, setRows] = useState<ReviewRow[] | null>(null);

  useEffect(() => {
    listReviewRows().then(setRows).catch((err) => toastError(err, 'Could not load reviews'));
  }, []);

  const onReorder = async (next: ReviewRow[], ids: string[]) => {
    const previous = rows;
    setRows(next);
    try {
      await reorderReviews(ids);
    } catch (err) {
      setRows(previous);
      toastError(err, 'Could not save new order');
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
          <button
            type="button"
            onClick={() => navigate('/admin/reviews/new')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight"
          >
            <Plus size={14} aria-hidden="true" />
            Add review
          </button>
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
                  {...h.attributes}
                  className={`flex items-center gap-3 px-3 py-2.5 ${h.isDragging ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
                >
                  <button
                    type="button"
                    aria-label="Drag to reorder"
                    {...h.listeners}
                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical size={16} aria-hidden="true" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {row.author}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
                      {row.text.en?.slice(0, 80)}{row.text.en && row.text.en.length > 80 ? '…' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 text-brand-gold shrink-0" aria-label={`${row.rating} of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < row.rating ? 'fill-current' : 'opacity-30'} aria-hidden="true" />
                    ))}
                  </div>
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
