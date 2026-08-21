import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { useWebGLSupport } from './useWebGLSupport';

export type ExperienceMode = 'classic' | '3d';

/**
 * Whether capable desktop visitors get the 3D experience by default.
 *
 * Now `true`: every chapter renders real content (hero glass monogram, real
 * services / AI / projects / trust / contact copy sourced from the same
 * translations and data as the classic site), so the experience is the default
 * homepage for capable desktops. The richer per-chapter 3D scenes (projects
 * fly-through, particle AI field, …) continue to land in later phases.
 *
 * The classic site remains the guaranteed fallback for everyone else —
 * reduced-motion, no-WebGL, small/touch viewports, search crawlers (mobile-
 * first, so they fail the desktop gate and get the crawlable classic content),
 * and anyone who appends `?classic`.
 */
const ENABLED_BY_DEFAULT = true;

function readFlag(name: string): boolean {
  if (typeof window === 'undefined') return false;
  const v = new URLSearchParams(window.location.search).get(name);
  return v !== null && v !== '0' && v !== 'false';
}

/**
 * Decides whether to render the WebGL storytelling experience or the classic
 * DOM site. The classic site is the guaranteed fallback and is chosen whenever
 * the 3D path would be inappropriate or unsupported:
 *
 *   - `prefers-reduced-motion: reduce` → always classic (accessibility).
 *   - no usable WebGL context → always classic (graceful degradation).
 *   - small / touch-first viewports → classic for now (a dedicated lighter
 *     mobile path lands in a later phase; until then phones get the full 2D site).
 *   - `?classic` query flag → force classic (debugging / opt-out / A-B).
 *
 * Only when the visitor is on a capable desktop AND the experience is enabled
 * (by default or via `?experience`) do we return '3d'. The gate is intentionally
 * conservative: any doubt resolves to the classic site.
 */
export function useExperienceMode(): ExperienceMode {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const hasWebGL = useWebGLSupport();

  // URL flags are read once on mount — they don't change without a reload.
  const [flags, setFlags] = useState({ forceClassic: false, request3D: false });
  useEffect(() => {
    setFlags({
      forceClassic: readFlag('classic'),
      request3D: readFlag('experience') || readFlag('3d'),
    });
  }, []);

  if (flags.forceClassic) return 'classic';

  const capable = hasWebGL && !prefersReducedMotion && isDesktop;
  if (!capable) return 'classic';

  return ENABLED_BY_DEFAULT || flags.request3D ? '3d' : 'classic';
}
