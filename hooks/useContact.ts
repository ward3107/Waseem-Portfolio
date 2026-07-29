import { useMemo } from 'react';
import { CONTACT } from '../constants';
import { useSiteSettings } from './useSiteSettings';

/**
 * Resolved contact + social links for the whole public site. Prefers whatever
 * the owner set in the admin's Settings page; falls back to the hardcoded
 * values in constants.ts (which themselves fall back to env vars).
 *
 * A single hook so every consumer (Footer, Contact, AISection widgets, etc.)
 * gets the same shape and never has to compose `settings?.foo ?? CONTACT.foo`
 * by hand.
 */
export interface ContactInfo {
  email: string;
  whatsappNumber: string;
  whatsappUrl: string;
  whatsappDisplay: string;
  github: string;
  linkedin: string;
  twitter: string;
}

/** Only fall back to the constant when the setting is null / empty. */
const prefer = (setting: string | null | undefined, fallback: string): string =>
  setting && setting.trim() ? setting.trim() : fallback;

/** Format a bare number like "972534260632" into "+972 53 426 0632". */
const formatWhatsapp = (n: string): string =>
  `+${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;

export function useContact(): ContactInfo {
  const { settings } = useSiteSettings();

  return useMemo(() => {
    const whatsappNumber = prefer(settings?.whatsapp, CONTACT.whatsappNumber);
    return {
      email: prefer(settings?.contact_email, CONTACT.email),
      whatsappNumber,
      whatsappUrl: `https://wa.me/${whatsappNumber}`,
      whatsappDisplay:
        whatsappNumber === CONTACT.whatsappNumber
          ? CONTACT.whatsappDisplay
          : formatWhatsapp(whatsappNumber),
      github: prefer(settings?.github_url, CONTACT.github),
      linkedin: prefer(settings?.linkedin_url, CONTACT.linkedin),
      twitter: prefer(settings?.twitter_url, CONTACT.twitter),
    };
  }, [settings]);
}
