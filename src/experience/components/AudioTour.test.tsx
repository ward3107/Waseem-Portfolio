import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AudioTour from './AudioTour';
import AudioHeaderControl from './AudioHeaderControl';
import { audioTourStore } from '../audioTourStore';

const locale = vi.hoisted(() => ({ language: 'he' }));
vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => locale }));
let current: MockAudio;
let observerCallback: IntersectionObserverCallback;
class MockAudio extends EventTarget {
  src = '';
  muted = false;
  paused = true;
  currentTime = 0;
  ended = false;
  preload = '';
  defaultPlaybackRate = 1;
  playbackRate = 1;
  play = vi.fn(() => {
    this.paused = false;
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  pause = vi.fn(() => {
    this.paused = true;
  });
  constructor() {
    super();
    // Keep the latest mock element available to playback assertions.
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    current = this;
  }
}
beforeEach(() => {
  vi.useFakeTimers();
  sessionStorage.clear();
  locale.language = 'he';
  vi.stubGlobal('Audio', MockAudio);
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe() {}
      disconnect() {}
    }
  );
});
afterEach(() => {
  cleanup();
  audioTourStore.reset();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('Hebrew audio tour and mobile activation', () => {
  it('uses one direct button to play, mute and play again without a menu', async () => {
    render(
      <>
        <AudioTour />
        <AudioHeaderControl />
      </>
    );
    await act(async () => {
      vi.runOnlyPendingTimers();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'הפעל קריינות' }));
    });
    expect(current.muted).toBe(false);
    expect(screen.queryByRole('menu')).toBeNull();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'השתק קריינות' }));
    });
    expect(current.muted).toBe(true);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'הפעל קריינות' }));
    });
    expect(current.muted).toBe(false);
    expect(current.paused).toBe(false);
  });
  it('registers Hebrew controls and plays the approved clip at natural speed', async () => {
    render(<AudioTour />);
    await act(async () => {
      vi.runOnlyPendingTimers();
    });
    expect(audioTourStore.get().present).toBe(true);
    expect(current.src).toBe('/audio/he/hero.mp3');
    expect(current.playbackRate).toBe(1);
  });
  it('recovers a blocked scroll attempt on touch release', async () => {
    render(<AudioTour />);
    await act(async () => {
      vi.runOnlyPendingTimers();
    });
    current.play.mockRejectedValueOnce(new DOMException('blocked', 'NotAllowedError'));
    await act(async () => {
      window.dispatchEvent(new Event('wheel'));
    });
    expect(current.muted).toBe(true);
    await act(async () => {
      window.dispatchEvent(new Event('pointerup'));
    });
    expect(current.muted).toBe(false);
    expect(current.play).toHaveBeenCalledTimes(3);
  });
  it('restarts playback inside the manual sound button gesture', async () => {
    render(<AudioTour />);
    await act(async () => {
      vi.runOnlyPendingTimers();
    });
    current.paused = true;
    await act(async () => {
      audioTourStore.toggleMute();
    });
    expect(current.muted).toBe(false);
    expect(current.paused).toBe(false);
  });
  it('honours session dismissal until the visitor explicitly starts it', async () => {
    sessionStorage.setItem('audioTourDismissed', '1');
    render(<AudioTour />);
    await act(async () => {
      vi.runOnlyPendingTimers();
      window.dispatchEvent(new Event('pointerup'));
    });
    expect(current.play).not.toHaveBeenCalled();
    await act(async () => {
      audioTourStore.start();
    });
    expect(current.play).toHaveBeenCalledOnce();
    expect(current.muted).toBe(false);
  });
  it.each(['he', 'en', 'ar'])('narrates video and social sections in %s', async (language) => {
    locale.language = language;
    const videoSection = document.createElement('section');
    videoSection.id = 'video-ads';
    const socialSection = document.createElement('section');
    socialSection.id = 'social-media';
    document.body.append(videoSection, socialSection);
    render(<AudioTour />);
    await act(async () => {
      vi.runOnlyPendingTimers();
      window.dispatchEvent(new Event('pointerup'));
    });
    await act(async () => {
      observerCallback(
        [
          { target: videoSection, isIntersecting: true, intersectionRatio: 1 },
        ] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    expect(current.src).toBe(`/audio/${language}/videos.mp3`);
    expect(current.playbackRate).toBe(1);
    await act(async () => {
      observerCallback(
        [
          { target: videoSection, isIntersecting: false, intersectionRatio: 0 },
          { target: socialSection, isIntersecting: true, intersectionRatio: 1 },
        ] as unknown as IntersectionObserverEntry[],
        {} as IntersectionObserver
      );
    });
    expect(current.src).toBe(`/audio/${language}/social.mp3`);
    videoSection.remove();
    socialSection.remove();
  });
  it('pauses narration when an audible video starts', async () => {
    render(<AudioTour />);
    await act(async () => {
      vi.runOnlyPendingTimers();
      window.dispatchEvent(new Event('pointerup'));
    });
    const video = document.createElement('video');
    document.body.append(video);
    await act(async () => {
      video.dispatchEvent(new Event('play'));
    });
    expect(current.paused).toBe(true);
    video.remove();
  });
});
