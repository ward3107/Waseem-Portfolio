import { createContext, useContext } from 'react';
import type { ConfirmOptions } from '@/features/admin/primitives/ConfirmDialog';

/**
 * Promise-based confirm hook. Any admin page can do:
 *   if (!(await confirm({ title: 'Delete project?', danger: true }))) return;
 *
 * The provider (ConfirmProvider) lives in AdminShell so every admin route
 * shares one dialog instance.
 */
type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(null);

export const useConfirm = (): ConfirmFn => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used inside <ConfirmProvider> (AdminShell).');
  }
  return ctx;
};
