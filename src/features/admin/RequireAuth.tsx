import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, aalCurrent, aalNext } = useAdminAuth();
  if (loading) return <div className="p-8 text-center">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  // The user is signed in but MFA is enrolled and the session is still at
  // aal1 — Supabase reports nextLevel === 'aal2'. Force the TOTP challenge
  // before the admin surface loads. When no factor is enrolled, next is
  // aal1 and this branch is skipped, so pre-MFA users continue to work.
  if (aalNext === 'aal2' && aalCurrent !== 'aal2') {
    return <Navigate to="/admin/mfa" replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
