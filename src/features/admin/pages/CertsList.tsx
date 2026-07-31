import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GripVertical, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import Topbar from '@/features/admin/layout/Topbar';
import Skeleton from '@/features/admin/primitives/Skeleton';
import DragList from '@/features/admin/primitives/DragList';
import {
  listCertRows,
  reorderCerts,
  deleteCert,
} from '@/lib/content/certifications';
import type { CertificationRow } from '@/types';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { toastDeleted, toastError } from '@/lib/adminToast';

const CertsList: React.FC = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [rows, setRows] = useState<CertificationRow[] | null>(null);

  const load = () =>
    listCertRows().then(setRows).catch((err) => toastError(err, 'Could not load certificates'));

  useEffect(() => {
    load();
  }, []);

  const onReorder = async (next: CertificationRow[], ids: string[]) => {
    setRows(next);
    try {
      await reorderCerts(ids);
    } catch (err) {
      // Partial-failure safety: re-fetch instead of pretending to roll back —
      // some UPDATEs may have already committed. See reorderCerts.
      await load();
      toastError(err, 'Could not save new order — refreshed to actual DB state');
    }
  };

  const onDelete = async (row: CertificationRow) => {
    const ok = await confirm({
      title: `Delete "${row.title.en || row.slug}"?`,
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteCert(row.id);
      setRows((prev) => prev?.filter((r) => r.id !== row.id) ?? null);
      toastDeleted(row.title.en || row.slug);
    } catch (err) {
      toastError(err, 'Could not delete');
    }
  };

  return (
    <>
      <Topbar
        title="Certificates"
        actions={
          <button
            type="button"
            onClick={() => navigate('/admin/certifications/new')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight"
          >
            <Plus size={14} aria-hidden="true" />
            Add certificate
          </button>
        }
      />
      <div className="p-4 sm:p-6">
        {rows === null && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}
        {rows && rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-3">No certificates yet.</p>
            <Link
              to="/admin/certifications/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight"
            >
              <Plus size={14} aria-hidden="true" />
              Add your first certificate
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
                      {row.title.en || row.slug}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
                      {row.issuer} · {row.issue_date}
                    </p>
                  </div>
                  <a
                    href={row.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    aria-label="Open credential"
                    title="Open credential"
                  >
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                  <Link
                    to={`/admin/certifications/${row.id}`}
                    className="p-1.5 text-zinc-400 hover:text-brand-purple"
                    aria-label={`Edit ${row.title.en || row.slug}`}
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="p-1.5 text-zinc-400 hover:text-red-600"
                    aria-label={`Delete ${row.title.en || row.slug}`}
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

export default CertsList;
