import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import ConfirmProvider from '../primitives/ConfirmProvider';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';

/**
 * Workspace layout for every admin route. Sidebar on md+, bottom nav under.
 * A single <Toaster/> at the shell level so any admin page can call
 * `toast.success(...)`; a single sign-out handler mirrors the v1 layout's
 * teardown flow (navigate to login, no setState-on-unmount).
 */
const AdminShell: React.FC = () => {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      navigate('/admin/login', { replace: true });
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <ConfirmProvider>
      <div className="relative min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        {/* Subtle brand-color wash so the dark theme isn't just black. Two
            large blurred blobs anchored at opposite corners, low opacity —
            gives the workspace warmth without competing with the content. */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0" aria-hidden="true">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-purple/10 dark:bg-brand-purple/15 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-cyan/5 dark:bg-brand-cyan/10 blur-[120px]" />
        </div>
        <Sidebar onSignOut={handleSignOut} email={user?.email ?? null} />
        {/* Content column offsets by the sidebar width on md+, and by the
            bottom-nav height on < md so nothing sits under the fixed bar. */}
        <div className="relative md:pl-60 pb-16 md:pb-0">
          <Outlet />
        </div>
        <MobileNav />
        <Toaster position="bottom-right" richColors closeButton theme="system" />
      </div>
    </ConfirmProvider>
  );
};

export default AdminShell;
