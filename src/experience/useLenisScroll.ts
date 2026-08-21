import { useEffect } from 'react';
import Lenis from 'lenis';
import { scrollStore } from './scrollStore';
import { resolveChapter } from './storyboard';

/**
 * Installs Lenis smooth/inertial scrolling for as long as the experience is
 * mounted, and republishes normalized scroll progress into the scrollStore on
 * every frame. The 3D render loop and the DOM widgets both read from that store
 * rather than listening to scroll directly, so there is exactly one source of
 * truth for "where are we in the journey".
 *
 * Lifecycle: Lenis is created on mount and destroyed on unmount (e.g. when the
 * visitor navigates away from the homepage, or the mode flips back to classic),
 * which restores native scrolling for the rest of the site. The store is reset
 * so a later remount starts from the top.
 *
 * `enabled` lets the caller keep the hook mounted but inert — when false, no
 * Lenis instance is created and native scrolling is untouched. We never smooth-
 * scroll reduced-motion users.
 */
export function useLenisScroll(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      // A touch of weight without feeling sluggish. Tuned further in polish.
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    const publish = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const progress = max > 0 ? el.scrollTop / max : 0;
      const { chapter, chapterProgress } = resolveChapter(progress);
      scrollStore.set({ progress, chapter, chapterProgress });
    };

    // Drive Lenis from a single rAF loop and publish progress each tick.
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      publish();
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    publish();

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      scrollStore.reset();
    };
  }, [enabled]);
}
