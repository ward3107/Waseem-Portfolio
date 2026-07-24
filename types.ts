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
