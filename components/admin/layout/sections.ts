import {
  LayoutDashboard,
  FolderOpen,
  GraduationCap,
  MessageSquareText,
  Image as ImageIcon,
  Settings2,
  type LucideIcon,
} from 'lucide-react';

/**
 * One source of truth for each admin section — path, label, icon, and the
 * accent color it uses across the sidebar, mobile nav, overview cards, and
 * page-specific highlights. Adding a new section = one entry here + one page.
 */
export type SectionKey = 'overview' | 'projects' | 'certifications' | 'reviews' | 'media' | 'settings';

export interface AdminSection {
  key: SectionKey;
  to: string;
  label: string;
  labelShort: string;
  icon: LucideIcon;
  end?: boolean;
  /** Tailwind class fragments. `accent` is the brand color name (`purple`,
   *  `blue`, …) — combined into full class names at the call site so
   *  Tailwind's JIT sees them at build time. */
  accent: 'purple' | 'blue' | 'gold' | 'pink' | 'cyan' | 'green';
}

export const SECTIONS: AdminSection[] = [
  { key: 'overview',       to: '/admin',                label: 'Overview',     labelShort: 'Home',     icon: LayoutDashboard,   end: true, accent: 'purple' },
  { key: 'projects',       to: '/admin/projects',       label: 'Projects',     labelShort: 'Projects', icon: FolderOpen,                    accent: 'blue' },
  { key: 'certifications', to: '/admin/certifications', label: 'Certificates', labelShort: 'Certs',    icon: GraduationCap,                 accent: 'gold' },
  { key: 'reviews',        to: '/admin/reviews',        label: 'Reviews',      labelShort: 'Reviews',  icon: MessageSquareText,             accent: 'pink' },
  { key: 'media',          to: '/admin/media',          label: 'Media',        labelShort: 'Media',    icon: ImageIcon,                     accent: 'cyan' },
  { key: 'settings',       to: '/admin/settings',       label: 'Settings',     labelShort: 'Settings', icon: Settings2,                     accent: 'green' },
];

/**
 * Precomputed Tailwind class fragments keyed by accent — safe to interpolate
 * because Tailwind's JIT can see the full literal strings below at build.
 */
export const ACCENT_CLASSES: Record<AdminSection['accent'], {
  text: string;
  bg: string;
  bgSoft: string;
  ring: string;
  border: string;
  fromTo: string;
}> = {
  purple: { text: 'text-brand-purple',    bg: 'bg-brand-purple',    bgSoft: 'bg-brand-purple/10',    ring: 'ring-brand-purple',    border: 'border-brand-purple',    fromTo: 'from-brand-purple to-brand-purpleLight' },
  blue:   { text: 'text-brand-blue',      bg: 'bg-brand-blue',      bgSoft: 'bg-brand-blue/10',      ring: 'ring-brand-blue',      border: 'border-brand-blue',      fromTo: 'from-brand-blue to-brand-cyan' },
  gold:   { text: 'text-brand-gold',      bg: 'bg-brand-gold',      bgSoft: 'bg-brand-gold/10',      ring: 'ring-brand-gold',      border: 'border-brand-gold',      fromTo: 'from-brand-gold to-brand-goldLight' },
  pink:   { text: 'text-brand-pink',      bg: 'bg-brand-pink',      bgSoft: 'bg-brand-pink/10',      ring: 'ring-brand-pink',      border: 'border-brand-pink',      fromTo: 'from-brand-pink to-brand-orange' },
  cyan:   { text: 'text-brand-cyan',      bg: 'bg-brand-cyan',      bgSoft: 'bg-brand-cyan/10',      ring: 'ring-brand-cyan',      border: 'border-brand-cyan',      fromTo: 'from-brand-cyan to-brand-blue' },
  green:  { text: 'text-brand-green',     bg: 'bg-brand-green',     bgSoft: 'bg-brand-green/10',     ring: 'ring-brand-green',     border: 'border-brand-green',     fromTo: 'from-brand-green to-brand-teal' },
};
