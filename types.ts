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
}

export interface Project {
  id: string;
  title: string;
  category: 'Web' | 'AI' | 'Mobile' | 'All';
  description: string;
  image: string;
  tech: string[];
  link?: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
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