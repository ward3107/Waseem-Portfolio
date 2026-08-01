import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ShieldCheck, ShieldAlert, Loader2, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

// Standalone /admin/mfa route (deliberately sits OUTSIDE the RequireAuth
// gate so it can host both the "logged in but not yet aal2" challenge and
// the "logged in at aal2, want to manage" flow without redirect loops).
//
// Three states, decided from the auth context every render:
//  1. `challenge`    — session is aal1 but user has a verified factor.
//     Show a 6-digit input and call mfa.verify() to upgrade to aal2.
//  2. `enroll`       — user has no verified factor. Show a QR code and let
//     them scan + verify to add a factor. Any leftover unverified factor
//     is cleaned up first so re-enrollment never gets stuck at "unique
//     friendly name" errors.
//  3. `manage`       — session is aal2 and user has a verified factor.
//     Show status + a destructive "Remove factor" button.
//
// All errors surface inline. Supabase's error messages are usually
// user-friendly ("Invalid code", "Rate limit exceeded", etc.).

const OTP_LENGTH = 6;
const isOtp = (s: string) => /^\d{6}$/.test(s);

const MfaPage: React.FC = () => {
  const {
    user,
    loading: authLoading,
    aalCurrent,
    verifiedTotpFactorId,
    refreshMfa,
  } = useAdminAuth();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enrollment artifacts. `null` until the user clicks "Start setup".
  const [enrollment, setEnrollment] = useState<{
    factorId: string;
    qrCode: string;
    uri: string;
    secret: string;
  } | null>(null);

  // Reset any input error when the user starts typing again.
  useEffect(() => {
    if (error) setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;

  const hasVerified = Boolean(verifiedTotpFactorId);
  const mode: 'challenge' | 'enroll' | 'manage' = (() => {
    if (hasVerified && aalCurrent !== 'aal2') return 'challenge';
    if (hasVerified && aalCurrent === 'aal2') return 'manage';
    return 'enroll';
  })();

  const cleanUpUnverified = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const all: Array<{ id: string; factor_type?: string; status?: string }> =
      (data as { all?: Array<{ id: string; factor_type?: string; status?: string }> })?.all ?? [];
    for (const f of all) {
      if (f.factor_type === 'totp' && f.status !== 'verified') {
        try {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        } catch {
          // Best effort — the enrollment call itself will surface any
          // hard error from Supabase.
        }
      }
    }
  };

  const startEnrollment = async () => {
    setBusy(true);
    setError(null);
    try {
      await cleanUpUnverified();
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      if (enrollError) throw enrollError;
      setEnrollment({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        uri: data.totp.uri,
        secret: data.totp.secret,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start MFA setup');
    } finally {
      setBusy(false);
    }
  };

  const cancelEnrollment = async () => {
    if (!enrollment) return;
    setBusy(true);
    try {
      await supabase.auth.mfa.unenroll({ factorId: enrollment.factorId });
    } finally {
      setEnrollment(null);
      setCode('');
      setBusy(false);
    }
  };

  const verifyEnrollment = async () => {
    if (!enrollment) return;
    if (!isOtp(code)) {
      setError('Enter the 6-digit code from your authenticator');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({
        factorId: enrollment.factorId,
      });
      if (chalErr) throw chalErr;
      const { error: verErr } = await supabase.auth.mfa.verify({
        factorId: enrollment.factorId,
        challengeId: chal.id,
        code,
      });
      if (verErr) throw verErr;
      toast.success('MFA is now enabled on your account');
      setEnrollment(null);
      setCode('');
      await refreshMfa();
      navigate('/admin', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not verify code');
    } finally {
      setBusy(false);
    }
  };

  const submitChallenge = async () => {
    if (!verifiedTotpFactorId) return;
    if (!isOtp(code)) {
      setError('Enter the 6-digit code from your authenticator');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({
        factorId: verifiedTotpFactorId,
      });
      if (chalErr) throw chalErr;
      const { error: verErr } = await supabase.auth.mfa.verify({
        factorId: verifiedTotpFactorId,
        challengeId: chal.id,
        code,
      });
      if (verErr) throw verErr;
      await refreshMfa();
      navigate('/admin', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code');
    } finally {
      setBusy(false);
    }
  };

  const removeFactor = async () => {
    if (!verifiedTotpFactorId) return;
    if (
      !window.confirm(
        'Remove MFA from your account? Your next login will only require an email + password.'
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: unenrollErr } = await supabase.auth.mfa.unenroll({
        factorId: verifiedTotpFactorId,
      });
      if (unenrollErr) throw unenrollErr;
      toast.success('MFA removed');
      await refreshMfa();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove factor');
    } finally {
      setBusy(false);
    }
  };

  const copySecret = async () => {
    if (!enrollment) return;
    try {
      await navigator.clipboard.writeText(enrollment.secret);
      toast.success('Secret copied — you can paste it into your authenticator manually');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4 gap-4">
      <div className="w-full max-w-sm bg-gray-900 p-6 rounded-2xl space-y-5">
        <header className="flex items-center gap-2">
          {mode === 'manage' ? (
            <ShieldCheck size={20} className="text-emerald-400" />
          ) : (
            <ShieldAlert size={20} className="text-brand-purple" />
          )}
          <h1 className="text-lg font-bold">
            {mode === 'challenge' && 'Two-factor sign-in'}
            {mode === 'enroll' && 'Enable two-factor'}
            {mode === 'manage' && 'Two-factor is on'}
          </h1>
        </header>

        {mode === 'challenge' && (
          <>
            <p className="text-sm text-gray-300">
              Enter the 6-digit code from your authenticator app to finish signing in.
            </p>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              aria-label="Authenticator code"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 outline-none text-center text-2xl font-mono tracking-widest"
            />
            {error && (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              disabled={busy || !isOtp(code)}
              onClick={submitChallenge}
              className="w-full py-2 rounded-lg bg-brand-purple font-bold disabled:opacity-50"
            >
              {busy ? 'Verifying…' : 'Verify'}
            </button>
          </>
        )}

        {mode === 'enroll' && !enrollment && (
          <>
            <p className="text-sm text-gray-300">
              You&rsquo;ll scan a QR code with an authenticator app (Google Authenticator,
              1Password, Authy, …). After setup, every admin login needs a code from the app.
            </p>
            {error && (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={startEnrollment}
              className="w-full py-2 rounded-lg bg-brand-purple font-bold disabled:opacity-50"
            >
              {busy ? 'Preparing…' : 'Start setup'}
            </button>
          </>
        )}

        {mode === 'enroll' && enrollment && (
          <>
            <p className="text-sm text-gray-300">
              Scan this QR with your authenticator app, then enter the 6-digit code it shows.
            </p>
            <div className="bg-white rounded-lg p-3 flex items-center justify-center">
              {/* Supabase returns `qr_code` as an SVG string — safe to inline. */}
              <div
                aria-label="MFA QR code"
                dangerouslySetInnerHTML={{ __html: enrollment.qrCode }}
              />
            </div>
            <div className="text-[11px] text-gray-400 space-y-2">
              <p>Can&rsquo;t scan? Paste this secret manually:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 break-all bg-gray-800 rounded px-2 py-1 font-mono">
                  {enrollment.secret}
                </code>
                <button
                  type="button"
                  onClick={copySecret}
                  className="p-1.5 bg-gray-800 rounded hover:bg-gray-700"
                  aria-label="Copy secret"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              aria-label="Verification code"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 outline-none text-center text-2xl font-mono tracking-widest"
            />
            {error && (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={cancelEnrollment}
                className="flex-1 py-2 rounded-lg bg-gray-800 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !isOtp(code)}
                onClick={verifyEnrollment}
                className="flex-1 py-2 rounded-lg bg-brand-purple font-bold disabled:opacity-50"
              >
                {busy ? 'Verifying…' : 'Enable'}
              </button>
            </div>
          </>
        )}

        {mode === 'manage' && (
          <>
            <p className="text-sm text-gray-300">
              Your account is protected by an authenticator app. Every login requires a
              6-digit code.
            </p>
            {error && (
              <p className="text-red-400 text-sm" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={removeFactor}
              className="w-full py-2 rounded-lg bg-red-900/40 border border-red-500/40 text-red-200 font-semibold disabled:opacity-50 hover:bg-red-900/60"
            >
              {busy ? 'Removing…' : 'Remove MFA'}
            </button>
            <Link
              to="/admin"
              className="block text-center text-sm text-gray-400 hover:text-white"
            >
              Back to dashboard
            </Link>
          </>
        )}
      </div>

      {mode !== 'manage' && (
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to the site
        </Link>
      )}
    </div>
  );
};

export default MfaPage;
