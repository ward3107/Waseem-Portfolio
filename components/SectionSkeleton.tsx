import React from 'react';

const SectionSkeleton: React.FC = () => (
  <div
    role="status"
    aria-label="Loading section"
    className="min-h-[50vh] flex items-center justify-center"
  >
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-16 animate-pulse">
      <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-full mb-6" />
      <div className="h-12 w-3/4 max-w-2xl bg-slate-200 dark:bg-slate-800 rounded-lg mb-4" />
      <div className="h-4 w-1/2 max-w-lg bg-slate-200 dark:bg-slate-800 rounded mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    </div>
    <span className="sr-only">Loading…</span>
  </div>
);

export default SectionSkeleton;
