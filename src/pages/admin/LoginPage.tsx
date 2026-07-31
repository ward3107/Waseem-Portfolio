import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const LoginPage: React.FC = () => {
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await signIn(email, password);
    setBusy(false);
    if (res.error) setError(res.error);
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4 gap-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-gray-900 p-6 rounded-2xl">
        <h1 className="text-xl font-bold">Admin login</h1>
        <input
          type="email"
          required
          placeholder="Email"
          aria-label="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 outline-none"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 rounded-lg bg-gray-800 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-2 rounded-lg bg-brand-purple font-bold disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {/* Escape hatch: without this the login page is a dead end for
          anyone who reached it by accident (e.g. from the footer link). */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to the site
      </Link>
    </div>
  );
};

export default LoginPage;
