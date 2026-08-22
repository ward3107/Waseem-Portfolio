import React from 'react';
import { JOURNEY_ACTS } from './journeyConfig';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * The slim five-node rail pinned to the side of the journey. Each node is one
 * act, tinted in that act's accent; the active act's node grows and glows.
 * Clicking a node scrolls to its act. It doubles as a progress indicator and a
 * within-page nav, and is hidden on small screens where it would crowd content.
 *
 * `accents` are passed in (already theme-resolved) so the rail matches whatever
 * palette the engine is currently painting, and recolours on a theme flip
 * without the rail needing to watch the theme itself.
 */
interface ColorRailProps {
  active: number;
  accents: string[];
  onSelect: (index: number) => void;
}

const ColorRail: React.FC<ColorRailProps> = ({ active, accents, onSelect }) => {
  const { t } = useLanguage();

  return (
    <nav
      aria-label={t('journey_nav')}
      className="pointer-events-none fixed start-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3.5 rounded-full border border-white/10 bg-slate-950/40 p-2.5 backdrop-blur-md md:flex"
    >
      {JOURNEY_ACTS.map((act, i) => {
        const isActive = i === active;
        const color = accents[i];
        return (
          <button
            key={act.id}
            type="button"
            onClick={() => onSelect(i)}
            aria-current={isActive ? 'true' : 'false'}
            aria-label={t(act.labelKey)}
            className="group pointer-events-auto relative grid h-3.5 w-3.5 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            style={{ ['--dot' as string]: color }}
          >
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: isActive ? '0.75rem' : '0.6rem',
                height: isActive ? '0.75rem' : '0.6rem',
                backgroundColor: isActive ? color : 'transparent',
                border: `1.5px solid ${color}`,
                boxShadow: isActive ? `0 0 12px ${color}` : 'none',
                opacity: isActive ? 1 : 0.55,
              }}
            />
            {/* Label reveals on hover / focus */}
            <span
              className="pointer-events-none absolute start-6 whitespace-nowrap rounded-md border border-white/10 bg-slate-950/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {t(act.labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default ColorRail;
