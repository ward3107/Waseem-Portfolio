import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '@/types';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useProjects } from '@/features/projects/useProjects';
import ProjectShowcase from './ProjectShowcase';

vi.mock('@/features/projects/useProjects', () => ({ useProjects: vi.fn() }));
vi.mock('@/shared/hooks/usePrefersReducedMotion', () => ({ usePrefersReducedMotion: () => true }));

const projects: Project[] = ['First', 'Second', 'Third'].map(title => ({
  id: title, title, category: 'Web', description: '', image: '/' + title + '.webp',
  tech: [], link: 'https://example.com/' + title,
}));

function view(language: string) {
  window.history.replaceState({}, '', '/?lang=' + language);
  vi.mocked(useProjects).mockReturnValue({ projects, loading: false });
  return render(<LanguageProvider><ProjectShowcase /></LanguageProvider>);
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('project showcase navigation', () => {
  it.each([['en', 'Next', 'ArrowRight'], ['he', 'הבא', 'ArrowLeft'], ['ar', 'التالي', 'ArrowLeft']])(
    'moves by one project in %s and keeps the selected ID after the CMS reorders items',
    (language, next, key) => {
      const { rerender } = view(language);
      const gallery = screen.getByRole('region');
      fireEvent.click(screen.getByRole('button', { name: next }));
      expect(screen.getByRole('heading').textContent).toBe('Second');
      fireEvent.keyDown(gallery, { key, repeat: true });
      expect(screen.getByRole('heading').textContent).toBe('Second');
      vi.mocked(useProjects).mockReturnValue({ projects: [projects[1], projects[2], projects[0]], loading: false });
      rerender(<LanguageProvider><ProjectShowcase /></LanguageProvider>);
      expect(screen.getByRole('heading').textContent).toBe('Second');
      fireEvent.keyDown(gallery, { key });
      expect(screen.getByRole('heading').textContent).toBe('Third');
    }
  );

  it('consumes one horizontal wheel gesture including momentum and leaves vertical scroll to the page', () => {
    view('en');
    const gallery = screen.getByRole('region');
    const time = vi.spyOn(performance, 'now').mockReturnValue(300);
    expect(fireEvent.wheel(gallery, { deltaY: 200, deltaX: 2 })).toBe(true);
    for (const deltaX of [20, 1200, 360, 40, 8, 2]) fireEvent.wheel(gallery, { deltaX });
    expect(screen.getByRole('heading').textContent).toBe('Second');
    time.mockReturnValue(600);
    fireEvent.wheel(gallery, { deltaX: -700 });
    expect(screen.getByRole('heading').textContent).toBe('First');
  });

  it('handles an empty list and a single project without a live URL', () => {
    const { rerender } = view('en');
    vi.mocked(useProjects).mockReturnValue({ projects: [], loading: false });
    rerender(<LanguageProvider><ProjectShowcase /></LanguageProvider>);
    expect(screen.queryByRole('region')).toBeNull();
    vi.mocked(useProjects).mockReturnValue({ projects: [{ ...projects[0], link: undefined }], loading: false });
    rerender(<LanguageProvider><ProjectShowcase /></LanguageProvider>);
    expect(screen.getByRole('heading').textContent).toBe('First');
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
