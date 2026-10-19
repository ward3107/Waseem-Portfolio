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
        name: /NINNYO FLOWERS20s/,
      })
    );

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('does not reintroduce alternate versions in the case studies or restaurant section', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/video-ads?lang=he']}>
        <LanguageProvider>
          <VideoAdsPage />
        </LanguageProvider>
      </MemoryRouter>
    );
    expect(
      [...container.querySelectorAll('video')].map((video) => video.getAttribute('src'))
    ).toEqual([
      '/assets/video-ads/greentouch-house.mp4',
      '/assets/video-ads/ninnyo-friday-wow.mp4',
      '/assets/video-ads/souvlaki/1000333189.mp4',
    ]);
    expect(container.querySelector('#ninnyo-friday-12')).toBeNull();
    expect(container.querySelector('#ninnyo-red-roses')).toBeNull();
  });
});
