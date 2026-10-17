import { describe, expect, it } from 'vitest';
import {
  getLocalizedProjects,
  getRequiredPortfolioProjects,
  mergeRequiredPortfolioProjects,
} from '@/features/projects/data';
import { translations } from '@/translations';
import type { Project } from '@/types';

const t = (key: string) => key;
const curatedIds = [
  'mova-motion-store', 'softec-vision', 'biznix', 'kiwi',
  'shayish-kfar-yassif', 'ninnyo-flowers', 'vocabagrut',
];
const remoteProject: Project = {
  id: 'remote-project', title: 'Remote project', category: 'Web',
  description: 'Remote', image: '/remote.webp', tech: ['React'],
};

describe('curated portfolio projects', () => {
  it('includes MOVA and the six approved projects while preserving the original portfolio', () => {
    const projects = getRequiredPortfolioProjects(t);
    expect(projects.map((project) => project.id)).toEqual(curatedIds);
    expect(projects[0].link).toBe('https://wordpress-woocommerce-mova.vercel.app/');
    expect(projects[0].github).toBe('https://github.com/ward3107/WordPress-WooCommerce-MOVA');
    expect(getLocalizedProjects(t).map((project) => project.id)).toEqual([
      ...curatedIds, 'souvlaki', 'seatai', 'law-office', 'shokha', 'vocaband',
    ]);
    expect(projects.find((project) => project.id === 'biznix')?.github).toBeUndefined();
    expect(projects.find((project) => project.id === 'vocabagrut')?.github).toBeUndefined();
  });

  it('pins approved entries while preserving unrelated CMS projects', () => {
    const required = getRequiredPortfolioProjects(t);
    const merged = mergeRequiredPortfolioProjects([
      { ...required[0], title: 'Stale remote title' }, remoteProject,
    ], required);
    expect(merged.map((project) => project.id)).toEqual([...curatedIds, 'remote-project']);
    expect(merged[0].title).toBe('MOVA — Motion Store');
  });

  it('merges existing CMS entries by live URL or repository even if the slug differs', () => {
    const required = getRequiredPortfolioProjects(t);
    const merged = mergeRequiredPortfolioProjects([
      { ...remoteProject, id: 'old-vocabagrut', link: 'https://voca-bagrut.vercel.app/?lang=he' },
      { ...remoteProject, id: 'old-softec', github: 'https://github.com/ward3107/softec-vision.git' },
      { ...remoteProject, id: 'old-kiwi', link: 'https://kidfin-three.vercel.app/' },
      remoteProject,
    ], required);
    expect(merged.map((project) => project.id)).toEqual([...curatedIds, 'remote-project']);
  });

  it('keeps retired demos hidden without hiding unrelated WordPress work or drafts', () => {
    const required = getRequiredPortfolioProjects(t);
    const merged = mergeRequiredPortfolioProjects([
      { ...remoteProject, id: 'wordpress-studio-demo' },
      { ...remoteProject, id: 'wordpress-shop-demo' },
      { ...remoteProject, id: 'cms-studio', link: 'https://waseemstudiodemo.wordpress.com/?preview=1' },
      { ...remoteProject, id: 'cms-shop', link: 'https://waseemshopdemo.wordpress.com/store/' },
      { ...remoteProject, id: 'unrelated-wordpress', link: 'https://example.wordpress.com/' },
      { ...remoteProject, id: 'draft' },
    ], required);
    expect(merged.map((project) => project.id)).toEqual([
      ...curatedIds, 'unrelated-wordpress', 'draft',
    ]);
  });

  it.each(Object.entries(translations))('provides project descriptions in %s', (_, copy) => {
    const projects = getRequiredPortfolioProjects((key) => copy[key] ?? key);
    expect(projects.every((project) => project.description && !project.description.startsWith('project_'))).toBe(true);
  });
});
