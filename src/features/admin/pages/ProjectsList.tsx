import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GripVertical, Plus, Pencil, Trash2, Link as LinkIcon, Search } from 'lucide-react';
import Topbar from '@/features/admin/layout/Topbar';
import Skeleton from '@/features/admin/primitives/Skeleton';
import DragList from '@/features/admin/primitives/DragList';
import { listProjectRows, reorderProjects, deleteProject, createProject, type ProjectInput } from '@/lib/content/projects';
import type { ProjectRow } from '@/types';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { toastDeleted, toastError, toastSaved } from '@/lib/adminToast';

type Filter = 'All' | 'Web' | 'AI' | 'Mobile';

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [rows, setRows] = useState<ProjectRow[] | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const load = () =>
    listProjectRows()
      .then(setRows)
      .catch((err) => toastError(err, 'Could not load projects'));

  useEffect(() => {
    load();
  }, []);

  // Filtering is applied over the sorted array; drag is disabled while any
  // filter is active so we never reorder a partial view.
  const visible = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== 'All' && r.category !== filter) return false;
      if (q && !r.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, filter]);

  const dragDisabled = query.trim() !== '' || filter !== 'All';

  const onReorder = async (next: ProjectRow[], ids: string[]) => {
    setRows(next); // optimistic
    try {
      await reorderProjects(ids);
    } catch (err) {
      // The reorder is N parallel UPDATEs; a mid-list failure leaves the DB
      // half-shuffled. Re-fetch from the source of truth rather than pretend
      // to roll back to `previous` — some of those updates already committed.
      await load();
      toastError(err, 'Could not save new order — refreshed to actual DB state');
    }
  };

  const onDelete = async (row: ProjectRow) => {
    const ok = await confirm({
      title: `Delete "${row.title}"?`,
      body: 'This removes the project from the public site.',
      danger: true,
    });
    if (!ok) return;
    const snapshot = row;
    try {
      await deleteProject(row.id);
      setRows((prev) => prev?.filter((r) => r.id !== row.id) ?? null);
      toastDeleted(row.title, async () => {
        // Undo: re-insert with the same shape (server assigns a fresh id + created_at).
        try {
          const input: ProjectInput = {
            slug: `${snapshot.slug}-restored-${Date.now()}`,
            title: snapshot.title,
            category: snapshot.category,
            description: snapshot.description,
            image_url: snapshot.image_url,
            tech: snapshot.tech,
            link: snapshot.link,
            github: snapshot.github,
            screenshots: snapshot.screenshots,
            sort_order: snapshot.sort_order,
          };
          await createProject(input);
          await load();
          toastSaved('Project restored');
        } catch (err) {
          toastError(err, 'Undo failed');
        }
      });
    } catch (err) {
      toastError(err, 'Could not delete');
    }
  };

  return (
    <>
      <Topbar
        title="Projects"
        actions={
          <button
            type="button"
            onClick={() => navigate('/admin/projects/new')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight"
          >
            <Plus size={14} aria-hidden="true" />
            Add project
          </button>
        }
      />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              aria-label="Search projects"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            />
          </div>
          <div className="flex gap-1">
            {(['All', 'Web', 'AI', 'Mobile'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filter === f
                    ? 'bg-brand-purple text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {dragDisabled && rows && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500 italic">
            Clear the search/filter to drag-reorder.
          </p>
        )}

        {/* Loading */}
        {rows === null && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {/* Empty state */}
        {rows && rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-3">No projects yet.</p>
            <Link
              to="/admin/projects/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight"
            >
              <Plus size={14} aria-hidden="true" />
              Add your first project
            </Link>
          </div>
        )}

        {/* Table */}
        {rows && rows.length > 0 && (
          <ul className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
            <DragList
              items={visible}
              disabled={dragDisabled}
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
                    disabled={dragDisabled}
                    {...h.listeners}
                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <GripVertical size={16} aria-hidden="true" />
                  </button>
                  {row.image_url ? (
                    <img
                      src={row.image_url}
                      alt=""
                      className="w-10 h-10 rounded object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{row.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
                      {row.slug} · {row.category}
                      {row.link ? ' · live' : ''}
                    </p>
                  </div>
                  {row.link && (
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      aria-label="Open live site"
                      title="Open live site"
                    >
                      <LinkIcon size={14} aria-hidden="true" />
                    </a>
                  )}
                  <Link
                    to={`/admin/projects/${row.id}`}
                    className="p-1.5 text-zinc-400 hover:text-brand-purple"
                    aria-label={`Edit ${row.title}`}
                    title="Edit"
                  >
                    <Pencil size={14} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="p-1.5 text-zinc-400 hover:text-red-600"
                    aria-label={`Delete ${row.title}`}
                    title="Delete"
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

export default ProjectsList;
