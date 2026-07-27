import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const LoginPage: React.FC = () => {
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-gray-900 p-6 rounded-2xl">
        <h1 className="text-xl font-bold">Admin login</h1>
        <input
          type="email" required placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 outline-none"
        />
        <input
          type="password" required placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 outline-none"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit" disabled={busy}
          className="w-full py-2 rounded-lg bg-brand-purple font-bold disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
