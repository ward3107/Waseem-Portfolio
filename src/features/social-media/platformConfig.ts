import { CONTACT } from '@/constants';

export interface BrandPlatform {
  name: string;
  glow: string;
  border: string;
  enabled: boolean;
  href?: string;
  ariaLabel: string;
}

// Enable a platform here when its destination is ready. A saved URL alone
// never activates a card; only Facebook is currently connected.
export const BRAND_PLATFORMS: readonly BrandPlatform[] = [
  {
    name: 'Instagram',
    glow: 'bg-fuchsia-500/15',
    border: 'border-fuchsia-400/25',
    enabled: false,
    href: CONTACT.instagram,
    ariaLabel: 'Vasia Instagram page',
  },
  {
    name: 'Facebook',
    glow: 'bg-blue-500/15',
    border: 'border-blue-400/25',
    enabled: true,
    href: CONTACT.facebook,
    ariaLabel: 'Vasia Facebook page',
  },
  {
    name: 'TikTok',
    glow: 'bg-cyan-400/10',
    border: 'border-cyan-400/25',
    enabled: false,
    ariaLabel: 'Vasia TikTok page',
  },
  {
    name: 'Google Ads',
    glow: 'bg-amber-400/10',
    border: 'border-amber-400/25',
    enabled: false,
    ariaLabel: 'Vasia Google Ads page',
  },
];
