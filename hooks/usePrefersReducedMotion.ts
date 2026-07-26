import { useMediaQuery } from './useMediaQuery';

/**
 * Reactive hook: `true` if the user has set `prefers-reduced-motion: reduce`.
 * Recomputes when the OS preference changes.
 */
export const usePrefersReducedMotion = (): boolean =>
  useMediaQuery('(prefers-reduced-motion: reduce)');

/**
 * Non-reactive snapshot for use outside React (module-scope guards, etc).
 * Prefer the hook inside components.
 */
export const getPrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
