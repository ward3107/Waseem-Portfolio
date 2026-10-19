import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
      'mova-motion-store', 'nacre-ocean-atelier', 'softec-vision', 'biznix', 'kiwi',
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
});
