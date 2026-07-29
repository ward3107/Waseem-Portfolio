import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink, type LucideIcon } from 'lucide-react';
import Topbar from '../layout/Topbar';
import Skeleton from '../primitives/Skeleton';
import { SECTIONS, ACCENT_CLASSES, type AdminSection } from '../layout/sections';
import { listProjectRows } from '../../../lib/content/projects';
import { listCertRows } from '../../../lib/content/certifications';
import { listReviewRows } from '../../../lib/content/reviews';
import { toastError } from '../../../lib/adminToast';

type ActivityItem = { kind: 'project' | 'cert' | 'review'; id: string; title: string; ts: string };

/** Compact "2h ago" formatter. */
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
  section: AdminSection;
  count: number | null;
  hint?: string;
}> = ({ section, count, hint }) => {
  const c = ACCENT_CLASSES[section.accent];
  const Icon: LucideIcon = section.icon;
  return (
    <Link
      to={section.to}
      className={`group relative block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-transparent hover:shadow-lg transition-all overflow-hidden`}
    >
      {/* Corner glow that intensifies on hover — subtle brand tint per card. */}
      <span
        className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${c.bgSoft} opacity-60 group-hover:opacity-100 blur-xl transition-opacity`}
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold">
        <span>{section.label}</span>
        <span className={`w-8 h-8 rounded-lg ${c.bgSoft} ${c.text} flex items-center justify-center`}>
          <Icon size={16} aria-hidden="true" />
        </span>
      </div>
      <div className="relative mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        {count === null ? <Skeleton className="h-8 w-16" /> : count}
      </div>
      {hint && <p className="relative mt-1 text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>}
    </Link>
  );
};

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

  const projectsSection = SECTIONS.find((s) => s.key === 'projects')!;
  const certsSection = SECTIONS.find((s) => s.key === 'certifications')!;
  const reviewsSection = SECTIONS.find((s) => s.key === 'reviews')!;
  const mediaSection = SECTIONS.find((s) => s.key === 'media')!;

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
          <StatCard section={projectsSection} count={counts?.p ?? null} />
          <StatCard section={certsSection} count={counts?.c ?? null} />
          <StatCard section={reviewsSection} count={counts?.r ?? null} hint={counts?.r === 0 ? 'Add your first review' : undefined} />
          <StatCard section={mediaSection} count={null} hint="Browse storage" />
        </div>

        {/* Quick actions — primary is filled gradient; secondaries are per-section tinted */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/projects/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-brand-purple to-brand-purpleLight hover:shadow-lg hover:shadow-brand-purple/30 transition-shadow"
          >
            <Plus size={14} aria-hidden="true" /> Add project
          </Link>
          <Link
            to="/admin/certifications/new"
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg ${ACCENT_CLASSES.gold.bgSoft} ${ACCENT_CLASSES.gold.text} hover:bg-brand-gold hover:text-white transition-colors`}
          >
            <Plus size={14} aria-hidden="true" /> Add certificate
          </Link>
          <Link
            to="/admin/reviews/new"
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg ${ACCENT_CLASSES.pink.bgSoft} ${ACCENT_CLASSES.pink.text} hover:bg-brand-pink hover:text-white transition-colors`}
          >
            <Plus size={14} aria-hidden="true" /> Add review
          </Link>
        </div>

        {/* Activity */}
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <header className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-transparent to-brand-purple/5 dark:to-brand-purple/10">
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
            {activity?.map((item) => {
              const accentKey = item.kind === 'project' ? 'blue' : item.kind === 'cert' ? 'gold' : 'pink';
              const c = ACCENT_CLASSES[accentKey];
              return (
                <li key={`${item.kind}-${item.id}`} className="px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0 flex items-center gap-3">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${c.bgSoft} ${c.text}`}>
                      {item.kind}
                    </span>
                    <span className="text-sm text-zinc-900 dark:text-zinc-100 truncate">{item.title}</span>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-500 shrink-0">{relativeTime(item.ts)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
};

export default Overview;
