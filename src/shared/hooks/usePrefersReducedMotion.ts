import { useEffect, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';
import { A11Y_CHANGE_EVENT, readA11ySettings } from '@/shared/widgets/accessibilitySettings';

/** Both the OS setting and the toolbar must stop JS/3D motion, not only CSS. */
export const usePrefersReducedMotion = (): boolean => {
  const system = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [chosen, setChosen] = useState(() => readA11ySettings().disableAnimations);
  useEffect(() => {
    const update = () => setChosen(readA11ySettings().disableAnimations);
    window.addEventListener(A11Y_CHANGE_EVENT, update);
    window.addEventListener('storage', update);
    update();
    return () => {
      window.removeEventListener(A11Y_CHANGE_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);
  return system || chosen;
};

export const getPrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches || readA11ySettings().disableAnimations;
};
