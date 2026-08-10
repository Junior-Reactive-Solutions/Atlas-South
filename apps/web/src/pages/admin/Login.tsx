import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoIndex } from '../../hooks/useNoIndex.js';
import { useAuth } from '../../contexts/AuthContext.js';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useNoIndex();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // login() stores the access token in React state (never localStorage).
      const { mustChangePassword } = await login(email, password);

      if (mustChangePassword) {
        navigate('/admin/change-password');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-navy">Atlas South</h1>
          <p className="mt-2 text-sm text-slate-600">Admin Portal</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-lg bg-accent-blue px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Protected area. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
