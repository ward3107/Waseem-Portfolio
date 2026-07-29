import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, ArrowLeft, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export type AdminTab = 'projects' | 'certifications' | 'reviews';

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'certifications', label: 'Certificates' },
  { key: 'reviews', label: 'Reviews' },
];

const AdminLayout: React.FC<{
  tab: AdminTab;
  onTab: (t: AdminTab) => void;
  children: React.ReactNode;
}> = ({ tab, onTab, children }) => {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      // Send them to the login screen (not the public site) so it's clear
      // the session ended. RequireAuth would redirect anyway, but doing it
      // explicitly avoids a brief flash of admin content mid-teardown.
      navigate('/admin/login', { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-bold text-base sm:text-lg truncate">Portfolio Admin</h1>
          {user?.email && (
            <span className="hidden sm:inline text-xs text-gray-500 truncate">
              · {user.email}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
            title="Open the public site in this tab"
          >
            <ExternalLink size={14} aria-hidden="true" />
            <span className="hidden sm:inline">View site</span>
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold disabled:opacity-60"
          >
            <LogOut size={14} aria-hidden="true" />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>
      <nav className="flex gap-2 overflow-x-auto px-4 sm:px-6 py-3 border-b border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
              tab === t.key ? 'bg-brand-purple font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="p-4 sm:p-6 max-w-4xl mx-auto">{children}</main>
      <footer className="mt-8 px-4 sm:px-6 py-4 border-t border-gray-800 text-xs text-gray-500 flex items-center gap-2">
        <ArrowLeft size={12} aria-hidden="true" />
        <Link to="/" className="hover:text-white">Back to the public site</Link>
      </footer>
    </div>
  );
};

export default AdminLayout;
