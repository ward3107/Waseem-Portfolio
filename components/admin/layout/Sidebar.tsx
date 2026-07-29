import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  GraduationCap,
  MessageSquareText,
  Image as ImageIcon,
  Settings2,
  ExternalLink,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
/** Six workspace links. Icons + labels; active state via NavLink's isActive. */
type SidebarLink = { to: string; label: string; icon: LucideIcon; end?: boolean };
const LINKS: SidebarLink[] = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { to: '/admin/certifications', label: 'Certificates', icon: GraduationCap },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquareText },
  { to: '/admin/media', label: 'Media', icon: ImageIcon },
  { to: '/admin/settings', label: 'Settings', icon: Settings2 },
];

const Sidebar: React.FC<{ onSignOut: () => void; email?: string | null }> = ({
  onSignOut,
  email,
}) => (
  <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 md:left-0 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
    <div className="px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
      <p className="font-semibold text-zinc-900 dark:text-zinc-100">Waseem Admin</p>
      {email && (
        <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate mt-0.5">{email}</p>
      )}
    </div>
    <nav className="flex-1 px-2 py-3 space-y-1">
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-l-2 border-brand-purple'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`
          }
        >
          <Icon size={16} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
    <div className="px-2 py-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
      <NavLink
        to="/"
        className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
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
