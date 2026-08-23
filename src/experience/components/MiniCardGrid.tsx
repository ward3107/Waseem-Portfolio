import React from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * A compact grid of small glass cards (icon + short label) for a chapter's
 * overlay — the condensed "smaller cards" presentation used by Services and AI
 * instead of a plain row of text chips. Cards are deliberately small so several
 * fit a phone screen without scrolling. The chapter's own entrance animation
 * (the wrapper in ChapterOverlay) fades the whole grid in, so the cards
 * themselves stay plain to avoid a double reveal.
 */
export interface MiniCard {
  label: string;
  Icon: LucideIcon;
}

const MiniCardGrid: React.FC<{ items: MiniCard[] }> = ({ items }) => (
  <div className="mt-7 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3">
    {items.map(({ label, Icon }) => (
      <div
        key={label}
        className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-start backdrop-blur transition-colors hover:border-brand-cyan/40 hover:bg-white/10"
      >
        <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold leading-tight text-slate-100 sm:text-sm">
          {label}
        </span>
      </div>
    ))}
  </div>
);

export default MiniCardGrid;
