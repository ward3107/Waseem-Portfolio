import React from 'react';
import AmbientField from '@/shared/ui/AmbientField';

/**
 * The cinematic world, extended to the inner pages.
 *
 * The homepage became a dark scroll journey while /projects, /services,
 * /about and /contact kept the original flat page background, so following a
 * nav link felt like leaving the site. This wraps those pages in the same
 * atmosphere — brand glows, the faint grid, and the drifting motes from the
 * journey — while leaving their content untouched. They stay ordinary,
 * readable content pages; they simply belong to the same place now.
 *
 * Theme-aware rather than forced dark: the theme toggle still works here, and
 * the ambience has a light palette of its own.
 */
const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="page-shell relative isolate bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
    {/* Atmosphere. Fixed so it stays put while the page scrolls over it,
        exactly like the journey's backdrop. */}
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-brand-purple/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-brand-cyan/10 blur-3xl" />
      <AmbientField />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/60 dark:to-slate-950/60" />
    </div>

    {children}
  </div>
);

export default PageShell;
