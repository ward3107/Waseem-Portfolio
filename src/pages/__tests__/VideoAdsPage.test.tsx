import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import VideoAdsPage from '@/pages/VideoAdsPage';

describe('VideoAdsPage project navigation', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    scrollIntoView.mockReset();
    Element.prototype.scrollIntoView = scrollIntoView;
    window.history.replaceState({}, '', '/video-ads?lang=he');
  });

  it('scrolls to the selected reel instead of resetting the page to the top', () => {
    render(
      <MemoryRouter initialEntries={['/video-ads?lang=he']}>
        <LanguageProvider>
          <Routes>
            <Route path="/video-ads" element={<VideoAdsPage />} />
          </Routes>
        </LanguageProvider>
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole('link', {
        name: /NINNYO FLOWERS — שישי ב־12 שניות12s/,
      })
    );

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});
