import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { SECTIONS, ACCENT_CLASSES } from './sections';

/** Fixed bottom bar for < md — one thumb, no gesture. Colored per section.
 *  Last tile is Sign out — the only way to log out on mobile since the
 *  desktop sidebar is hidden. */
const MobileNav: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => (
  <nav
    className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-7"
    aria-label="Admin sections"
  >
    {SECTIONS.map(({ to, labelShort, icon: Icon, end, accent }) => {
      const c = ACCENT_CLASSES[accent];
      return (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors min-h-[52px] ${
              isActive
                ? c.text
                : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`transition-transform ${isActive ? 'scale-110' : ''}`}
                aria-hidden="true"
              >
                <Icon size={18} />
              </span>
              <span>{labelShort}</span>
            </>
          )}
        </NavLink>
      );
    })}
    <button
      type="button"
      onClick={onSignOut}
      aria-label="Sign out"
      className="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium min-h-[52px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
    >
      <LogOut size={18} aria-hidden="true" />
      <span>Sign out</span>
    </button>
  </nav>
);

export default MobileNav;
