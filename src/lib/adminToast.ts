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

// Supabase's PostgrestError is a plain object, not an Error instance, so
// `String(err)` used to render as the useless "[object Object]" and hide
// the real reason (RLS, missing row, network). Unwrap `.message` from any
// object that carries one, then fall back to JSON.stringify for anything
// exotic — never surface a stringified object to the user.
export const toastError = (err: unknown, prefix = 'Something went wrong'): void => {
  let msg: string;
  if (err instanceof Error) {
    msg = err.message;
  } else if (typeof err === 'string') {
    msg = err;
  } else if (
    err !== null &&
    typeof err === 'object' &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string'
  ) {
    msg = (err as { message: string }).message;
  } else {
    try {
      msg = JSON.stringify(err);
    } catch {
      msg = 'Unknown error';
    }
  }
  toast.error(prefix, { description: msg });
};
