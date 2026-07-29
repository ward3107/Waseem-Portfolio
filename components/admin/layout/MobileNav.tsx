import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  GraduationCap,
  MessageSquareText,
  Image as ImageIcon,
  Settings2,
  type LucideIcon,
} from 'lucide-react';

type MobileLink = { to: string; label: string; icon: LucideIcon; end?: boolean };
const LINKS: MobileLink[] = [
  { to: '/admin', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { to: '/admin/certifications', label: 'Certs', icon: GraduationCap },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquareText },
  { to: '/admin/media', label: 'Media', icon: ImageIcon },
  { to: '/admin/settings', label: 'Settings', icon: Settings2 },
];

/** Fixed bottom bar for < md — one thumb, no gesture, always visible. */
const MobileNav: React.FC = () => (
  <nav
    className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-6"
    aria-label="Admin sections"
  >
    {LINKS.map(({ to, label, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors min-h-[52px] ${
            isActive
              ? 'text-brand-purple'
              : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`
        }
      >
        <Icon size={18} aria-hidden="true" />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);

export default MobileNav;
