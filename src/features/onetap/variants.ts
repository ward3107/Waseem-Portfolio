/**
 * Public demo variants share a single card implementation and all contact actions.
 * The permanent /card link remains the enhanced Motion experience.
 * Classic has the exact same functional features without decorative animation.
 */
export type OneTapVariant = 'classic' | 'motion';

export function resolveOneTapVariant(search: string): OneTapVariant {
  const value = new URLSearchParams(search).get('variant');
  return value === 'classic' ? 'classic' : 'motion';
}

export function demoUrl(variant: OneTapVariant, language: 'he' | 'ar' | 'en'): string {
  return '/card?variant=' + variant + '&lang=' + language;
}
