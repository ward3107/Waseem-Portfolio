import React from 'react';
import { NavLink } from 'react-router-dom';
import { ExternalLink, LogOut } from 'lucide-react';
import { SECTIONS, ACCENT_CLASSES } from './sections';

const Sidebar: React.FC<{ onSignOut: () => void; email?: string | null }> = ({
  onSignOut,
  email,
}) => (
  <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-40 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
    {/* Brand header with a soft brand-color accent bar */}
    <div className="relative px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-gold" />
      <p className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <span className="inline-block w-6 h-6 rounded-md bg-gradient-to-br from-brand-purple to-brand-cyan shadow-sm flex items-center justify-center text-white text-[10px] font-bold">W</span>
        Waseem Admin
      </p>
      {email && (
        <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate mt-1 pl-8">{email}</p>
      )}
    </div>

    <nav className="flex-1 px-2 py-3 space-y-1">
      {SECTIONS.map(({ to, label, icon: Icon, end, accent }) => {
        const c = ACCENT_CLASSES[accent];
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? `${c.bgSoft} ${c.text} shadow-sm`
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                    isActive ? `${c.bg} text-white shadow` : `${c.bgSoft} ${c.text} group-hover:${c.bg} group-hover:text-white`
                  }`}
                >
                  <Icon size={14} aria-hidden="true" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>

    <div className="px-2 py-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
      <NavLink
        to="/"
        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-brand-purple"
      >
        <ExternalLink size={16} aria-hidden="true" />
        View site
      </NavLink>
      <button
        type="button"
        onClick={onSignOut}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
      >
        <LogOut size={16} aria-hidden="true" />
        Sign out
      </button>
    </div>
  </aside>
);

export default Sidebar;
