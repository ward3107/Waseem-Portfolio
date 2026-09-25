import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

export type QualityTier = 'high' | 'low';

/**
 * Picks a rendering quality tier for the 3D experience.
 *
 *   - 'high' — desktop/laptop (≥1024px): full effects (glass transmission
 *     material, richer environment, higher DPR, the projects fly-through).
 *   - 'low'  — phones/tablets: cheaper materials, capped DPR, fewer particles,
 *     while preserving the live 3D project gallery, morphs and touch interaction.
 *     Reduces the cost of the experience on battery-powered GPUs.
 *
 * Reactive, so rotating a tablet or resizing a window re-tiers on the fly.
 */
export function useQualityTier(): QualityTier {
  const hasLargeFinePointer = useMediaQuery('(min-width: 1024px) and (pointer: fine)');
  if (!hasLargeFinePointer || typeof navigator === 'undefined') return 'low';

  const device = navigator as Navigator & { deviceMemory?: number };
  const enoughMemory = device.deviceMemory === undefined || device.deviceMemory >= 4;
  const enoughCores = navigator.hardwareConcurrency === undefined || navigator.hardwareConcurrency >= 6;
  return enoughMemory && enoughCores ? 'high' : 'low';
}
