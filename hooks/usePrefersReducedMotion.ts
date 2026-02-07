import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the user prefers reduced motion
 * This helps improve accessibility and performance for users who dislike animations
 *
 * @returns boolean - true if user prefers reduced motion, false otherwise
 */
export const usePrefersReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes in preference
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

/**
 * Simplified version that doesn't listen for changes (for static checks)
 * Use this when you only need to check once on mount
 *
 * @returns boolean - true if user prefers reduced motion, false otherwise
 */
export const getPrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
