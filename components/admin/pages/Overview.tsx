import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, GraduationCap, MessageSquareText, Image as ImageIcon, Plus, ExternalLink, type LucideIcon } from 'lucide-react';
import Topbar from '../layout/Topbar';
import Skeleton from '../primitives/Skeleton';
import { listProjectRows } from '../../../lib/content/projects';
import { listCertRows } from '../../../lib/content/certifications';
import { listReviewRows } from '../../../lib/content/reviews';
import { toastError } from '../../../lib/adminToast';

type ActivityItem = { kind: 'project' | 'cert' | 'review'; id: string; title: string; ts: string };

/** Human-friendly relative time. Bare-bones; no i18n on the admin. */
const relativeTime = (iso: string): string => {
  const diffSec = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`;
  const days = Math.round(diffSec / 86400);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const StatCard: React.FC<{
  label: string;
  count: number | null;
  Icon: LucideIcon;
  to: string;
  hint?: string;
}> = ({ label, count, Icon, to, hint }) => (
  <Link
    to={to}
    className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-brand-purple/40 hover:shadow-sm transition-all"
  >
    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">
      <span>{label}</span>
      <Icon size={16} aria-hidden="true" />
    </div>
    <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
      {count === null ? <Skeleton className="h-8 w-16" /> : count}
    </div>
    {hint && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>}
  </Link>
);

const Overview: React.FC = () => {
  const [counts, setCounts] = useState<{ p: number; c: number; r: number } | null>(null);
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([listProjectRows(), listCertRows(), listReviewRows()])
      .then(([projects, certs, reviews]) => {
        if (!active) return;
        setCounts({ p: projects.length, c: certs.length, r: reviews.length });
        const items: ActivityItem[] = [
          ...projects.map((p) => ({ kind: 'project' as const, id: p.id, title: p.title, ts: p.updated_at })),
          ...certs.map((c) => ({ kind: 'cert' as const, id: c.id, title: c.title.en, ts: c.updated_at })),
          ...reviews.map((r) => ({ kind: 'review' as const, id: r.id, title: r.author, ts: r.updated_at })),
        ]
          .sort((a, b) => (a.ts < b.ts ? 1 : -1))
          .slice(0, 5);
        setActivity(items);
      })
      .catch((err) => toastError(err, 'Could not load overview'));
    return () => { active = false; };
  }, []);

  return (
    <>
      <Topbar
        title="Overview"
        actions={
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <ExternalLink size={14} aria-hidden="true" />
            Preview site
          </a>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Projects" count={counts?.p ?? null} Icon={FolderOpen} to="/admin/projects" />
          <StatCard label="Certificates" count={counts?.c ?? null} Icon={GraduationCap} to="/admin/certifications" />
          <StatCard label="Reviews" count={counts?.r ?? null} Icon={MessageSquareText} to="/admin/reviews" hint={counts?.r === 0 ? 'Add your first review' : undefined} />
          <StatCard label="Media" count={null} Icon={ImageIcon} to="/admin/media" hint="Browse storage" />
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/projects/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-md bg-brand-purple text-white hover:bg-brand-purpleLight"
          >
            <Plus size={14} aria-hidden="true" /> Add project
          </Link>
          <Link
            to="/admin/certifications/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <Plus size={14} aria-hidden="true" /> Add certificate
          </Link>
          <Link
            to="/admin/reviews/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <Plus size={14} aria-hidden="true" /> Add review
          </Link>
        </div>

        {/* Activity */}
        <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <header className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent activity</h2>
          </header>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {activity === null && (
              <>
                <li className="px-4 py-3"><Skeleton className="h-5 w-2/3" /></li>
                <li className="px-4 py-3"><Skeleton className="h-5 w-1/2" /></li>
                <li className="px-4 py-3"><Skeleton className="h-5 w-3/5" /></li>
              </>
            )}
            {activity?.length === 0 && (
              <li className="px-4 py-6 text-sm text-zinc-500 dark:text-zinc-500 text-center">
                Nothing yet. Add your first project to see it here.
              </li>
            )}
            {activity?.map((item) => (
              <li key={`${item.kind}-${item.id}`} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-600 mr-2">
                    {item.kind}
                  </span>
                  <span className="text-sm text-zinc-900 dark:text-zinc-100 truncate">{item.title}</span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500 shrink-0">{relativeTime(item.ts)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};

export default Overview;
