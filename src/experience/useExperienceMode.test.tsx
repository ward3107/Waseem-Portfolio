import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useExperienceMode } from './useExperienceMode';
import { useQualityTier } from './useQualityTier';

const capabilities = vi.hoisted(() => ({ webgl: true, reduced: false, desktop: false }));
vi.mock('./useWebGLSupport', () => ({ useWebGLSupport: () => capabilities.webgl }));
vi.mock('@/shared/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => capabilities.reduced,
}));
vi.mock('@/shared/hooks/useMediaQuery', () => ({
  useMediaQuery: () => capabilities.desktop,
}));

beforeEach(() => {
  capabilities.webgl = true;
  capabilities.reduced = false;
  capabilities.desktop = false;
  window.history.replaceState({}, '', '/');
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 iPhone Safari');
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('mobile immersive experience', () => {
  it('enters 3D on a touch phone without URL flags and uses the mobile rendering budget', () => {
    const { result } = renderHook(() => ({ mode: useExperienceMode(), tier: useQualityTier() }));
    expect(result.current).toEqual({ mode: '3d', tier: 'low' });
  });
  it('keeps the experience when switching between desktop and touch layouts', () => {
    capabilities.desktop = true;
    const { result, rerender } = renderHook(() => useExperienceMode());
    expect(result.current).toBe('3d');
    capabilities.desktop = false;
    rerender();
    expect(result.current).toBe('3d');
  });
  it('responds to a reduced-motion preference even with the explicit 3D flag', () => {
    window.history.replaceState({}, '', '/?3d');
    const { result, rerender } = renderHook(() => useExperienceMode());
    capabilities.reduced = true;
    rerender();
    expect(result.current).toBe('classic');
  });
  it('keeps unsupported devices on usable classic content', () => {
    capabilities.webgl = false;
    expect(renderHook(() => useExperienceMode()).result.current).toBe('classic');
  });
  it('honours the classic opt-out before the 3D opt-in', () => {
    window.history.replaceState({}, '', '/?classic&3d');
    expect(renderHook(() => useExperienceMode()).result.current).toBe('classic');
  });
  it('keeps social crawlers on crawlable classic content', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('facebookexternalhit/1.1');
    expect(renderHook(() => useExperienceMode()).result.current).toBe('classic');
  });
});
