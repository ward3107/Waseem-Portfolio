import { describe, expect, it } from 'vitest';
import { demoUrl, resolveOneTapVariant } from './variants';

describe('OneTap sales demo variants', () => {
  it('preserves the existing card URL as Motion by default', () => {
    expect(resolveOneTapVariant('')).toBe('motion');
    expect(resolveOneTapVariant('?lang=he')).toBe('motion');
  });
  it('keeps Classic explicitly static and ignores unknown variants', () => {
    expect(resolveOneTapVariant('?variant=classic&lang=ar')).toBe('classic');
    expect(resolveOneTapVariant('?variant=motion')).toBe('motion');
    expect(resolveOneTapVariant('?variant=other')).toBe('motion');
  });
  it.each(['he', 'ar', 'en'] as const)('creates localized Classic and Motion demos in %s', (lang) => {
    expect(demoUrl('classic', lang)).toBe('/card?variant=classic&lang=' + lang);
    expect(demoUrl('motion', lang)).toBe('/card?variant=motion&lang=' + lang);
  });
});
