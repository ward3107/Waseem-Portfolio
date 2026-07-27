import type { Variants } from 'framer-motion';

export const letterVariants = (reduced: boolean): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: reduced
      ? { duration: 0 }
      : { delay: i * 0.03, type: 'spring', damping: 12, stiffness: 100 },
  }),
});

export const emphasizedVariants = (reduced: boolean): Variants => ({
  hidden: {
    opacity: 0,
    scale: reduced ? 1 : 5,
    y: 0,
    filter: reduced ? 'blur(0px)' : 'blur(10px)',
  },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: reduced
      ? { duration: 0 }
      : {
          delay: 0.4 + i * 0.04,
          type: 'spring',
          damping: 15,
          stiffness: 250,
          mass: 0.5,
          // Spring overshoots — blur can't be negative, so tween it linearly.
          filter: { type: 'tween', duration: 0.6, ease: 'easeOut' },
        },
  }),
});

export const part3Variants = (reduced: boolean): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: reduced
      ? { duration: 0 }
      : { delay: 1.0 + i * 0.02, type: 'spring', damping: 12, stiffness: 100 },
  }),
});

// For Arabic, split by words to preserve letter connections (splitting Arabic
// per-character breaks the cursive joins). We re-insert a non-breaking space
// between words as its own token so the inter-word spacing survives being
// rendered as separate inline-block spans (a plain space collapses there).
// For other languages, split by characters (spaces are kept as their own
// tokens and preserved via `whitespace-pre` on each span).
export const splitForAnimation = (text: string, language: string): string[] => {
  if (language === 'ar') {
    return text
      .split(' ')
      .filter((word) => word.length > 0)
      .flatMap((word, i) => (i === 0 ? [word] : [' ', word]));
  }
  return Array.from(text);
};
