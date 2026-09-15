import { describe, expect, it } from 'vitest';
import {
  getRequiredPortfolioProjects,
  mergeRequiredPortfolioProjects,
} from '@/features/projects/data';
import type { Project } from '@/types';

const t = (key: string) => key;

describe('required portfolio projects', () => {
  it('always includes both WordPress case studies', () => {
    const projects = getRequiredPortfolioProjects(t);

    expect(projects.map((project) => project.id)).toEqual([
      'wordpress-studio-demo',
      'wordpress-shop-demo',
    ]);
    expect(projects.every((project) => project.category === 'WordPress')).toBe(true);
    expect(projects.map((project) => project.link)).toEqual([
      'https://waseemstudiodemo.wordpress.com/',
      'https://waseemshopdemo.wordpress.com/',
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
      'wordpress-studio-demo',
      'wordpress-shop-demo',
      'remote-project',
    ]);
    expect(merged[0].title).toBe('Waseem Studio — WordPress Portfolio');
  });
});
