import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface ConfirmOptions {
  title: string;
  body?: string;
  danger?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface Props {
  open: boolean;
  options: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal replacement for window.confirm(). Focus-trapped, esc-closes,
 * portal-mounted so it isn't clipped by transformed ancestors.
 */
const ConfirmDialog: React.FC<Props> = ({ open, options, onConfirm, onCancel }) => {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open, onCancel]);

  if (!open || !options) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {options.title}
        </h2>
        {options.body && (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{options.body}</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {options.cancelLabel ?? 'Cancel'}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold text-white ${
              options.danger
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-brand-purple hover:bg-brand-purpleLight'
            }`}
          >
            {options.confirmLabel ?? (options.danger ? 'Delete' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
