import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

export type QualityTier = 'high' | 'low';

/**
 * Picks a rendering quality tier for the 3D experience.
 *
 *   - 'high' — desktop/laptop (≥1024px): full effects (glass transmission
 *     material, richer environment, higher DPR, the projects fly-through).
 *   - 'low'  — phones/tablets: cheaper materials, capped DPR, fewer particles,
 *     and the DOM project cards instead of the 3D gallery. Keeps the experience
 *     smooth on battery-powered GPUs.
 *
 * Reactive, so rotating a tablet or resizing a window re-tiers on the fly.
 */
export function useQualityTier(): QualityTier {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  return isDesktop ? 'high' : 'low';
}
