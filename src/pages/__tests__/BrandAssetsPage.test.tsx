import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import BrandAssetsPage from '@/pages/BrandAssetsPage';

describe('BrandAssetsPage', () => {
  it('offers ready-to-use brand files for social profiles, sharing and overlays', () => {
    window.history.replaceState({}, '', '/brand?lang=he');

    render(
      <MemoryRouter initialEntries={['/brand?lang=he']}>
        <LanguageProvider>
          <BrandAssetsPage />
        </LanguageProvider>
      </MemoryRouter>
    );

    const downloads = screen.getAllByRole('link', { name: /הורד/ });
    expect(downloads).toHaveLength(4);
    expect(downloads.map((link) => link.getAttribute('href'))).toEqual([
      '/brand/vasia-profile.png',
      '/brand/vasia-logo-dark.png',
      '/brand/vasia-logo-light.svg',
      '/brand/vasia-share.png',
    ]);
    downloads.forEach((link) => expect(link.getAttribute('download')).not.toBeNull());
  });
});
