import { toast } from 'sonner';

/**
 * Thin wrappers so every admin page uses the same copy + tone for the same
 * events. Callers still have full toast API available via `import { toast }`.
 */

export const toastSaved = (what = 'Changes'): void => {
  toast.success(`${what} saved`);
};

/**
 * Delete with a 5-second undo affordance. If the user clicks Undo, `onUndo`
 * runs and the toast dismisses immediately.
 */
export const toastDeleted = (what: string, onUndo?: () => void): void => {
  toast.success(`${what} deleted`, {
    duration: 5000,
    action: onUndo
      ? { label: 'Undo', onClick: onUndo }
      : undefined,
  });
};

export const toastError = (err: unknown, prefix = 'Something went wrong'): void => {
  const msg = err instanceof Error ? err.message : String(err);
  toast.error(prefix, { description: msg });
};
