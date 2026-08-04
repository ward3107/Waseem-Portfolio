import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

type AAL = 'aal1' | 'aal2' | null;

interface AdminAuthContextType {
  user: User | null;
  loading: boolean;
  // Authenticator Assurance Level (Supabase MFA). `current` is what the
  // session is at now; `next` is what it *could* be at, after solving any
  // pending factors. If they differ and next === 'aal2', an MFA challenge
  // is required to fully authenticate.
  aalCurrent: AAL;
  aalNext: AAL;
  // Id of the first verified TOTP factor on the user, or null. Present ⇒
  // MFA is enabled on the account.
  verifiedTotpFactorId: string | null;
  refreshMfa: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [aalCurrent, setAalCurrent] = useState<AAL>(null);
  const [aalNext, setAalNext] = useState<AAL>(null);
  const [verifiedTotpFactorId, setVerifiedTotpFactorId] = useState<string | null>(null);

  const refreshMfa = useCallback(async () => {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal) {
      setAalCurrent((aal.currentLevel ?? null) as AAL);
      setAalNext((aal.nextLevel ?? null) as AAL);
    }
    const { data: factors } = await supabase.auth.mfa.listFactors();
    // `totp` on this response is verified factors only, per Supabase docs.
    const first = factors?.totp?.[0];
    setVerifiedTotpFactorId(first?.id ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    const loadMfaFor = async (sessionUser: User | null) => {
      if (!sessionUser) {
        if (active) {
          setAalCurrent(null);
          setAalNext(null);
          setVerifiedTotpFactorId(null);
        }
        return;
      }
      await refreshMfa();
    };

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        const u = data.session?.user ?? null;
        setUser(u);
        await loadMfaFor(u);
        if (!active) return;
        setLoading(false);
      })
      .catch(() => {
        // getSession can reject (e.g. a token-refresh network failure). Without
        // this, `loading` stays true forever and RequireAuth is stuck on the
        // loading screen. Fail closed: no user, stop loading.
        if (!active) return;
        setUser(null);
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (!active) return;
      const u = session?.user ?? null;
      setUser(u);
      await loadMfaFor(u);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshMfa]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        aalCurrent,
        aalNext,
        verifiedTotpFactorId,
        refreshMfa,
        signIn,
        signOut,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
