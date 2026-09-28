import React from 'react';
import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { useContact } from '@/features/contact/useContact';

interface SocialLinksProps {
  variant?: 'light' | 'dark';
  className?: string;
}

interface SocialLink {
  name: string;
  href: string;
  icon: LucideIcon;
  hoverClass: string;
  external: boolean;
}

/** The portfolio's primary social/contact destinations, shared by every hero
 * and the footer so URLs, accessibility and interaction behaviour stay in sync. */
const SocialLinks: React.FC<SocialLinksProps> = ({ variant = 'light', className = '' }) => {
  const contact = useContact();
  const links: SocialLink[] = [
    { name: 'LinkedIn', href: contact.linkedin, icon: Linkedin, hoverClass: 'hover:text-[#0A66C2]', external: true },
    { name: 'GitHub', href: contact.github, icon: Github, hoverClass: 'hover:text-brand-purple', external: true },
    { name: 'Instagram', href: contact.instagram, icon: Instagram, hoverClass: 'hover:text-[#E4405F]', external: true },
    { name: 'Facebook', href: contact.facebook, icon: Facebook, hoverClass: 'hover:text-[#1877F2]', external: true },
    { name: 'WhatsApp', href: contact.whatsappUrl, icon: MessageCircle, hoverClass: 'hover:text-[#25D366]', external: true },
    { name: 'Email', href: `mailto:${contact.email}`, icon: Mail, hoverClass: 'hover:text-brand-cyan', external: false },
  ];

  const baseColor = variant === 'dark'
    ? 'text-slate-300 hover:bg-white/10 focus-visible:ring-offset-slate-950'
    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-900/5 dark:hover:bg-white/10 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950';

  return (
    <nav aria-label="Social and contact links" className={className}>
      <ul className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {links.map(({ name, href, icon: Icon, hoverClass, external }) => (
          <li key={name}>
            <a
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              aria-label={name}
              title={name}
              className={`group inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 ${baseColor} ${hoverClass}`}
            >
              <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SocialLinks;
