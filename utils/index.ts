/**
 * Type-safe global declarations for external APIs
 */

// Google Analytics gtag function
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, any>) => void;
    webkitAudioContext?: typeof AudioContext;
  }
}

/**
 * Safely check if gtag is available on the window object
 */
export const hasGtag = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Safely call gtag with proper type checking
 */
export const trackEvent = (eventName: string, parameters?: Record<string, any>): void => {
  if (hasGtag() && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

/**
 * Get AudioContext with webkit fallback for Safari
 */
export const getAudioContext = (): typeof AudioContext | undefined => {
  if (typeof window === 'undefined') return undefined;
  return window.AudioContext || window.webkitAudioContext;
};

/**
 * Safely get document active element as HTMLElement
 * Returns null if activeElement is null or not an HTMLElement
 */
export const getActiveElement = (): HTMLElement | null => {
  if (typeof document === 'undefined' || !document.activeElement) {
    return null;
  }
  // Check if the active element is an HTMLElement
  return document.activeElement instanceof HTMLElement ? document.activeElement : null;
};
