import { LucideIcon } from 'lucide-react';

export type Language = 'en' | 'he' | 'ar';

export interface NavLink {
  name: string;
  href: string;
}

export interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  modalDescription?: string;
}

export interface Project {
  id: string;
  title: string;
  category: 'Web' | 'AI' | 'Mobile' | 'All';
  description: string;
  image: string;
  tech: string[];
  /** Live demo URL. */
  link?: string;
  /** Public GitHub repository URL. Omit to hide the Code button. */
  github?: string;
  /** Extra gallery screenshots beyond the card image. */
  screenshots?: string[];
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  /** ISO date, e.g. "2026-07-16" */
  issueDate: string;
  /** ISO date, e.g. "2027-07-16" */
  expiryDate: string;
  /** Public credential verification URL. */
  credentialUrl: string;
  /** Path or URL to a preview image of the certificate itself (optional). */
  image?: string;
}

export interface TechItem {
  name: string;
  icon: string; // URL or simplified icon name
  category: 'Frontend' | 'Backend' | 'DevOps' | 'AI';
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Review {
  /** Reviewer's name as it should appear publicly. */
  author: string;
  /** Star rating, 1–5. */
  rating: number;
  /** The review text. */
  text: string;
  /** City / context, e.g. "עכו" (optional). */
  location?: string;
  /** ISO date the review was given, e.g. "2026-07-01" (optional). */
  date?: string;
}

/** Multilingual text. `en` required; `he`/`ar` optional (fall back to en). */
export interface LocalizedText {
  en: string;
  he?: string;
  ar?: string;
}

/** Rows exactly as stored in Supabase. */
export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  category: 'Web' | 'AI' | 'Mobile';
  description: LocalizedText;
  image_url: string | null;
  tech: string[];
  link: string | null;
  github: string | null;
  screenshots: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CertificationRow {
  id: string;
  slug: string;
  title: LocalizedText;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  credential_url: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewRow {
  id: string;
  author: string;
  rating: number;
  text: LocalizedText;
  helped_with?: LocalizedText | null;
  location: string | null;
  date: string | null;
  status: ReviewStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Single-row site_settings table — hero copy + contact + SEO. */
export interface SiteSettingsRow {
  id: true;
  contact_email: string | null;
  whatsapp: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  hero_badge: LocalizedText;
  hero_headline: LocalizedText;
  hero_subtitle: LocalizedText;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
}
