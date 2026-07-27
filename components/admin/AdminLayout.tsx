import React from 'react';
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
  const { signOut } = useAdminAuth();
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="font-bold">Portfolio Admin</h1>
        <button onClick={signOut} className="text-sm text-gray-400 hover:text-white">
          Sign out
        </button>
      </header>
      <nav className="flex gap-2 px-6 py-3 border-b border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm ${
              tab === t.key ? 'bg-brand-purple font-bold' : 'bg-gray-800 text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="p-6 max-w-4xl mx-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
