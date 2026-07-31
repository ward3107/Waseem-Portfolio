import { useEffect, useState, type RefObject } from 'react';

/**
 * True while any part of `ref.current` is inside the viewport (with an
 * optional `rootMargin`). Uses IntersectionObserver — no scroll listeners —
 * so it's cheap. Starts `false` and flips to `true` on first observation.
 *
 * Combine with `animation-play-state` or a conditional-render to stop work
 * when a section scrolls off-screen (marquees, blur animations, etc.).
 */
export function useInView(
  ref: RefObject<Element | null>,
  rootMargin: string = '0px'
): boolean {
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true); // Safety: SSR / very old browser → don't hide anything
      return;
    }
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
