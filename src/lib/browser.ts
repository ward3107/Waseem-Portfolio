/**
 * Type-safe global declarations for external APIs
 */

// Google Analytics gtag function
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
    vasiaTrack?: (name: string, data?: Record<string, unknown>) => void;
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
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>): void => {
  // Only successful form submissions count as received leads. Link clicks
  // are captured once by the delegated contact-intent listener.
  if (typeof window === 'undefined') return;
  if (eventName === 'generate_lead') {
    if (parameters?.form_type === 'project_wizard' || parameters?.saved === true) {
      window.vasiaTrack?.('lead_submitted', {
        channel: 'form',
        source: parameters?.form_type || 'discount_game',
      });
    } else if (parameters?.source === 'exit_intent') {
      window.vasiaTrack?.('contact_intent', { channel: 'whatsapp', source: 'exit_intent' });
    }
  } else if (eventName === 'testimonial_submitted') {
    window.vasiaTrack?.('testimonial_submitted');
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
