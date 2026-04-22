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

// For Arabic, split by words to preserve letter connections.
// For other languages, split by characters.
export const splitForAnimation = (text: string, language: string): string[] => {
  if (language === 'ar') return text.split(' ');
  return Array.from(text);
};
