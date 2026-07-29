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
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Sidebar onSignOut={handleSignOut} email={user?.email ?? null} />
        {/* Content column offsets by the sidebar width on md+, and by the
            bottom-nav height on < md so nothing sits under the fixed bar. */}
        <div className="md:pl-60 pb-16 md:pb-0">
          <Outlet />
        </div>
        <MobileNav />
        <Toaster position="bottom-right" richColors closeButton />
      </div>
    </ConfirmProvider>
  );
};

export default AdminShell;
