import { describe, expect, it } from 'vitest';
import {
  getLocalizedProjects,
  getRequiredPortfolioProjects,
  mergeRequiredPortfolioProjects,
} from '@/features/projects/data';
import type { Project } from '@/types';

const t = (key: string) => key;

describe('required portfolio projects', () => {
  it('features MOVA with its live demo and GitHub source instead of the retired demos', () => {
    const projects = getRequiredPortfolioProjects(t);

    expect(projects.map((project) => project.id)).toEqual([
      'mova-motion-store',
    ]);
    expect(projects.every((project) => project.category === 'WordPress')).toBe(true);
    expect(projects.map((project) => project.link)).toEqual([
      'https://wordpress-woocommerce-mova.vercel.app/',
    ]);
    expect(projects[0].github).toBe('https://github.com/ward3107/WordPress-WooCommerce-MOVA');
    expect(getLocalizedProjects(t).map((project) => project.id)).toEqual([
      'mova-motion-store', 'souvlaki', 'seatai', 'law-office', 'shokha', 'vocaband',
    ]);
  });

  it('pins required projects and removes duplicate remote entries', () => {
    const required = getRequiredPortfolioProjects(t);
    const remote: Project[] = [
      { ...required[0], title: 'Stale remote title' },
      {
        id: 'remote-project',
        title: 'Remote project',
        category: 'Web',
        description: 'Remote',
        image: '/remote.webp',
        tech: ['React'],
      },
    ];

    const merged = mergeRequiredPortfolioProjects(remote, required);

    expect(merged.map((project) => project.id)).toEqual([
      'mova-motion-store',
      'remote-project',
    ]);
    expect(merged[0].title).toBe('MOVA — Motion Store');
  });

  it('keeps retired demos hidden when stale remote content uses old or different slugs', () => {
    const required = getRequiredPortfolioProjects(t);
    const project = required[0];
    const remote: Project[] = [
      { ...project, id: 'wordpress-studio-demo', link: undefined },
      { ...project, id: 'wordpress-shop-demo', link: undefined },
      { ...project, id: 'cms-studio', link: 'https://waseemstudiodemo.wordpress.com/?preview=1' },
      { ...project, id: 'cms-shop', link: 'https://waseemshopdemo.wordpress.com/store/' },
      { ...project, id: 'unrelated-wordpress', link: 'https://example.wordpress.com/' },
      { ...project, id: 'draft', link: undefined },
    ];

    expect(mergeRequiredPortfolioProjects(remote, required).map((item) => item.id)).toEqual([
      'mova-motion-store', 'unrelated-wordpress', 'draft',
    ]);
  });
});
