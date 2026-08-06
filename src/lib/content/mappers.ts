import type {
  Language, Project, Certification, Review,
  ProjectRow, CertificationRow, ReviewRow,
} from '@/types';
import { localized } from '@/lib/localized';

export function projectRowToModel(row: ProjectRow, lang: Language): Project {
  return {
    id: row.slug,
    title: row.title,
    category: row.category,
    description: localized(row.description, lang),
    image: row.image_url ?? '',
    tech: row.tech,
    link: row.link ?? undefined,
    github: row.github ?? undefined,
    screenshots: row.screenshots.length ? row.screenshots : undefined,
  };
}

export function certRowToModel(row: CertificationRow, lang: Language): Certification {
  return {
    id: row.slug,
    title: localized(row.title, lang),
    issuer: row.issuer,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date ?? '',
    credentialUrl: row.credential_url,
    image: row.image_url ?? undefined,
  };
}

export function reviewRowToModel(row: ReviewRow, lang: Language): Review {
  return {
    author: row.author,
    rating: row.rating,
    text: localized(row.text, lang),
    location: row.location ?? undefined,
    roleCompany: row.role_company ?? undefined,
    date: row.date ?? undefined,
  };
}
