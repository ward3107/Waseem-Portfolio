import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { useProjects } from '@/features/projects/useProjects';
import { translations } from '@/translations';
import type { ProjectRow } from '@/types';

const mocks = vi.hoisted(() => ({ configured: false, listProjectRows: vi.fn() }));
vi.mock('@/lib/supabaseConfig', () => ({
  get isSupabaseConfigured() { return mocks.configured; },
}));
vi.mock('@/lib/content/projects', () => ({ listProjectRows: mocks.listProjectRows }));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LanguageProvider>{children}</LanguageProvider>
);
function usePortfolio() {
  return { ...useProjects(), setLanguage: useLanguage().setLanguage };
}

describe('portfolio content loading', () => {
  afterEach(() => {
    document.getElementById('projects')?.remove();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    mocks.configured = false;
    mocks.listProjectRows.mockReset();
    window.history.replaceState({}, '', '/?lang=en');
    localStorage.clear();
  });

  it('translates the fallback immediately when a visitor switches language', () => {
    const { result } = renderHook(usePortfolio, { wrapper });
    expect(result.current.projects.find((project) => project.id === 'softec-vision')?.description).toBe(translations.en.project_softec_desc);
    act(() => result.current.setLanguage('he'));
    expect(result.current.projects.find((project) => project.id === 'softec-vision')?.description).toBe(translations.he.project_softec_desc);
    act(() => result.current.setLanguage('ar'));
    expect(result.current.projects.find((project) => project.id === 'softec-vision')?.description).toBe(translations.ar.project_softec_desc);
    expect(result.current.projects.map((project) => project.id)).toEqual([
      'mova-motion-store', 'nacre-ocean-atelier', 'frame-video-learning',
      'luma-video-library', 'mova-storefront-concept', 'flora-botanical-journey',
      'liman-hadha', 'land-of-jesus', 'classflow-studio', 'jalal-opticare',
      'bathline', 'ragad-kindergarten', 'cybersecurity-course', 'careerconnect',
      'habeeb-farah', 'adan-center',
      'softec-vision', 'biznix', 'kiwi',
      'shayish-kfar-yassif', 'ninnyo-flowers', 'vocabagrut',
      'souvlaki', 'seatai', 'law-office', 'shokha', 'vocaband',
    ]);
    expect(mocks.listProjectRows).not.toHaveBeenCalled();
  });

  it('preserves and translates CMS work without refetching or duplicating VocaBagrut', async () => {
    mocks.configured = true;
    const row: ProjectRow = {
      id: 'cms-id', slug: 'cms-only', title: 'CMS project', category: 'Web',
      description: { en: 'English description', he: 'תיאור בעברית', ar: 'وصف بالعربية' },
      image_url: '/cms.webp', tech: ['React'], link: 'https://example.com/', github: null,
      screenshots: [], sort_order: 0, created_at: '', updated_at: '',
    };
    mocks.listProjectRows.mockResolvedValue([
      row, { ...row, id: 'existing-bagrut', slug: 'vocabagrut', link: 'https://voca-bagrut.vercel.app/' },
    ]);
    const { result } = renderHook(usePortfolio, { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects.filter((project) => project.id === 'vocabagrut')).toHaveLength(1);
    act(() => result.current.setLanguage('ar'));
    expect(result.current.projects.find((project) => project.id === 'cms-only')?.description).toBe('وصف بالعربية');
    expect(mocks.listProjectRows).toHaveBeenCalledTimes(1);
  });

  it('shows curated work before requesting below-the-fold CMS projects', async () => {
    mocks.configured = true;
    mocks.listProjectRows.mockResolvedValue([]);
    const section = document.createElement('section');
    section.id = 'projects';
    document.body.append(section);
    let reveal: (() => void) | undefined;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) {
        reveal = () => callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
      }
      observe() { /* observed until the section enters the viewport */ }
      disconnect() { /* the query only needs one trigger */ }
    });

    const { result } = renderHook(() => useProjects('projects'), { wrapper });
    expect(result.current.projects.find((project) => project.id === 'law-office')?.link)
      .toBe('https://officelaw.vercel.app/');
    expect(mocks.listProjectRows).not.toHaveBeenCalled();
    act(() => reveal?.());
    await waitFor(() => expect(mocks.listProjectRows).toHaveBeenCalledTimes(1));
  });
});
