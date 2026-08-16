import { describe, it, expect } from 'vitest';
import { projectRowToModel, certRowToModel, reviewRowToModel } from '@/lib/content/mappers';
import type { ProjectRow, CertificationRow, ReviewRow } from '@/types';

const projectRow: ProjectRow = {
  id: '1',
  slug: 'souvlaki',
  title: 'Souvlaki',
  category: 'Web',
  description: { en: 'Greek', he: 'יווני' },
  image_url: '/x.png',
  tech: ['Next.js'],
  link: 'https://x',
  github: null,
  screenshots: [],
  sort_order: 0,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

describe('mappers', () => {
  it('maps a project row to the app Project model (localized he)', () => {
    const p = projectRowToModel(projectRow, 'he');
    expect(p).toMatchObject({
      id: 'souvlaki',
      title: 'Souvlaki',
      category: 'Web',
      description: 'יווני',
      image: '/x.png',
      tech: ['Next.js'],
      link: 'https://x',
    });
    expect(p.github).toBeUndefined();
  });

  it('uses en fallback when locale missing on a cert title', () => {
    const row: CertificationRow = {
      id: '2',
      slug: 'ga',
      title: { en: 'Google Ads' },
      issuer: 'Google',
      issue_date: '2026-07-16',
      expiry_date: '2027-07-16',
      credential_url: 'https://c',
      image_url: null,
      sort_order: 0,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };
    expect(certRowToModel(row, 'ar').title).toBe('Google Ads');
  });

  it('maps a review row with localized text', () => {
    const row: ReviewRow = {
      id: '3',
      author: 'Dana',
      rating: 5,
      text: { en: 'Great', he: 'מעולה' },
      location: 'עכו',
      date: '2026-07-01',
      status: 'approved',
      sort_order: 0,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    };
    expect(reviewRowToModel(row, 'he')).toMatchObject({
      author: 'Dana',
      rating: 5,
      text: 'מעולה',
      location: 'עכו',
      date: '2026-07-01',
    });
  });
});
