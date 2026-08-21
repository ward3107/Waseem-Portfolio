import React from 'react';
import { useScrollSnapshot } from '../useScrollSnapshot';
import { CHAPTERS } from '../storyboard';

/**
 * A slim top progress bar plus a dot-per-chapter indicator down the side.
 * Reads the scroll store via useSyncExternalStore, so it re-renders only when
 * progress or the active chapter changes. Decorative and aria-hidden — the
 * accessible way through the page is the normal document flow and headings.
 */
const ScrollProgress: React.FC = () => {
  const { progress, chapter } = useScrollSnapshot();

  return (
    <div aria-hidden="true">
      {/* Top progress line */}
      <div className="fixed inset-x-0 top-0 z-40 h-0.5 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-brand-purpleLighter via-brand-cyan to-brand-gold origin-left"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      {/* Chapter dots */}
      <div className="fixed end-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        {CHAPTERS.map((c, i) => (
          <span
            key={c.id}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === chapter
                ? 'scale-125 bg-brand-cyan shadow-[0_0_10px] shadow-brand-cyan'
                : 'bg-white/25'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ScrollProgress;
