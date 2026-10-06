import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CONTACT } from '@/constants';
import BrandPlatforms from './BrandPlatforms';

afterEach(() => {
  cleanup();
  vi.doUnmock('./brandPlatforms');
  vi.resetModules();
});

describe('BrandPlatforms', () => {
  it.each([false, true])('links only Facebook when embedded=%s', (embedded) => {
    render(<BrandPlatforms embedded={embedded} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Vasia Facebook page');
    expect(links[0]).toHaveAttribute('href', CONTACT.facebook);
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    for (const name of ['Instagram', 'TikTok', 'Google Ads']) {
      const card = screen.getByRole('heading', { name }).closest('li')!;
      expect(within(card).queryByRole('link')).toBeNull();
      expect(card).not.toHaveClass('hover:-translate-y-1');
    }

    // Instagram already has a CONTACT URL, but that must not activate its card.
    expect(CONTACT.instagram).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Vasia Instagram page' })).toBeNull();
  });

  it('uses configuration for future connections and ignores enabled cards without a URL', async () => {
    vi.doMock('./brandPlatforms', async (importOriginal) => {
      const original = await importOriginal<typeof import('./brandPlatforms')>();
      return {
        ...original,
        BRAND_PLATFORMS: original.BRAND_PLATFORMS.map((platform) => ({
          ...platform,
          enabled: platform.name === 'Instagram' || platform.name === 'TikTok',
        })),
      };
    });
    vi.resetModules();
    const { default: ConfiguredPlatforms } = await import('./BrandPlatforms');

    render(<ConfiguredPlatforms embedded={false} />);

    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Vasia Instagram page' })).toHaveAttribute(
      'href',
      CONTACT.instagram
    );
    expect(screen.queryByRole('link', { name: 'Vasia Facebook page' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Vasia TikTok page' })).toBeNull();
  });
});
