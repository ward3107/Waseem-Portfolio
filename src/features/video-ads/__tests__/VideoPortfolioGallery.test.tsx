import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import VideoPortfolioGallery from '../VideoPortfolioGallery';
import VideoReels from '../VideoReels';
import { VIDEO_PORTFOLIO } from '../portfolio';

beforeEach(() => {
  window.history.replaceState({}, '', '/video-ads?lang=en');
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      },
    },
    close: {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      },
    },
  });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mount = () =>
  render(
    <LanguageProvider>
      <VideoPortfolioGallery />
    </LanguageProvider>
  );

describe('the selected video collection', () => {
  it('keeps one selected version of each work on the homepage', () => {
    const { container } = render(
      <LanguageProvider>
        <VideoReels />
      </LanguageProvider>
    );
    const cards = screen.getAllByRole('button', { name: /^Watch video:/ });
    expect(cards).toHaveLength(VIDEO_PORTFOLIO.length);
    expect(VIDEO_PORTFOLIO.map((video) => video.id)).toEqual([
      'greentouch',
      'ninnyo-friday',
      'english-4-all',
      'culinary-experience',
      'fashion-store',
      'souvlaki-2',
    ]);
    expect(cards[0]).toHaveAccessibleName('Watch video: GreenTouch');
    expect(screen.getByRole('button', { name: 'Watch video: NINNYO FLOWERS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Watch video: English 4 All/ })).toBeInTheDocument();
    expect(container.querySelector('video')).toBeNull();
  });

  it('shows only selected films without downloading video before selection', () => {
    const { container } = mount();
    const cards = screen.getAllByRole('button', { name: /^Watch video:/ });
    expect(cards).toHaveLength(VIDEO_PORTFOLIO.length);
    expect(new Set(VIDEO_PORTFOLIO.map((video) => video.src)).size).toBe(cards.length);
    expect(
      screen.queryByRole('button', { name: /OneTap|Chrome|Night Drive|AI presenter/ })
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Automotive' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Motion & digital' })).toBeNull();
    expect(container.querySelector('video')).toBeNull();
  });

  it('combines category and language filters and recovers from an empty selection', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Education' }));
    expect(screen.getAllByRole('button', { name: /^Watch video:/ })).toHaveLength(1);
    fireEvent.change(screen.getByLabelText('Video language'), { target: { value: 'he' } });
    expect(screen.queryByRole('button', { name: /^Watch video:/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Show all videos' }));
    expect(screen.getAllByRole('button', { name: /^Watch video:/ })).toHaveLength(
      VIDEO_PORTFOLIO.length
    );
  });

  it('plays the selected restaurant reel at its native dimensions and restores scrolling on close', () => {
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Watch video: Souvlaki · Made fresh' }));
    const dialog = screen.getByRole('dialog');
    const video = dialog.querySelector('video')!;
    expect(video.getAttribute('src')).toContain('1000333189.mp4');
    expect(video.getAttribute('width')).toBe('478');
    expect(video.getAttribute('height')).toBe('850');
    expect(video.controls).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close video' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('does not reopen an excluded version from an old share link', () => {
    window.history.replaceState({}, '', '/video-ads?lang=en&video=chrome-drift');
    mount();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getAllByRole('button', { name: /^Watch video:/ })).toHaveLength(6);
  });

  it('opens a film from a share link without requiring a login', () => {
    window.history.replaceState({}, '', '/video-ads?lang=en&video=english-4-all');
    mount();
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('video')?.getAttribute('src')).toContain('english-4-all.mp4');
    expect(
      within(dialog.querySelector('footer')!).getByRole('link', { name: /video file/ })
    ).toHaveAttribute('href', expect.stringContaining('english-4-all.mp4'));
  });
});
