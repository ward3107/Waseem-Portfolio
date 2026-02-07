import { useEffect, RefObject } from 'react';

/**
 * Custom hook to trap focus within a modal or dialog
 * This ensures accessibility by keeping keyboard navigation within the modal
 *
 * @param modalRef - Reference to the modal element
 * @param isOpen - Whether the modal is open
 */
export const useFocusTrap = (
  modalRef: RefObject<HTMLElement>,
  isOpen: boolean
): void => {
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Find all focusable elements within the modal
    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), ' +
      'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus the first element when modal opens
    firstFocusable?.focus();

    // Handle Tab key to trap focus within modal
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [modalRef, isOpen]);
};

/**
 * Custom hook to handle Escape key for closing modals
 *
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback to close the modal
 */
export const useEscapeKey = (
  isOpen: boolean,
  onClose: () => void
): void => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
};
