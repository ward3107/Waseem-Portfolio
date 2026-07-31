import React, { useCallback, useRef, useState } from 'react';
import ConfirmDialog, { type ConfirmOptions } from './ConfirmDialog';
import { ConfirmContext } from '@/shared/hooks/useConfirm';

/**
 * Owns the single dialog instance and resolves the pending confirm() promise
 * when the user picks a button. Mounted once in AdminShell.
 */
const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{ open: boolean; options: ConfirmOptions | null }>({
    open: false,
    options: null,
  });
  const resolverRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        // If a dialog is still awaiting a decision, resolve it as cancelled
        // before starting a new one — otherwise the previous await hangs
        // forever and the caller sits in whatever pre-confirm state it set up.
        if (resolverRef.current) {
          resolverRef.current(false);
        }
        resolverRef.current = resolve;
        setState({ open: true, options });
      }),
    []
  );

  const finish = (value: boolean) => {
    setState({ open: false, options: null });
    resolverRef.current?.(value);
    resolverRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state.open}
        options={state.options}
        onConfirm={() => finish(true)}
        onCancel={() => finish(false)}
      />
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
