import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoIndex } from '../../hooks/useNoIndex.js';
import { useAuth } from '../../contexts/AuthContext.js';

/**
 * Two-step login:
 *  Step 1 — email + password
 *  Step 2 — TOTP code (only shown when 2FA is enabled on the account)
 */
export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [step, setStep] = useState<'credentials' | 'totp'>('credentials');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, loginWithTotp } = useAuth();

  useNoIndex();

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if ('requiresTotp' in result && result.requiresTotp) {
        // Credentials valid — account has 2FA, show the code step
        setStep('totp');
        return;
      }

      if (result.mustChangePassword) {
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

  const handleTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { mustChangePassword } = await loginWithTotp(email, password, totpCode);
      if (mustChangePassword) {
        navigate('/admin/change-password');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
      setTotpCode('');
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

        {/* ── Step 1: email + password ──────────────────────────────────────── */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input
                id="email" type="email" autoComplete="username"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input
                id="password" type="password" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                required
              />
            </div>
            <button type="submit" disabled={isLoading}
              className="mt-6 w-full rounded-lg bg-accent-blue px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Checking…' : 'Continue'}
            </button>
          </form>
        )}

        {/* ── Step 2: TOTP code ─────────────────────────────────────────────── */}
        {step === 'totp' && (
          <form onSubmit={handleTotp} className="space-y-4">
            <p className="text-sm text-slate-600">
              Enter the 6-digit code from your authenticator app to complete sign-in.
            </p>
            <div>
              <label htmlFor="totp-code" className="block text-sm font-medium text-slate-700">
                Authenticator Code
              </label>
              <input
                id="totp-code" type="text" inputMode="numeric"
                pattern="\d{6}" maxLength={6}
                value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-2xl tracking-[0.4em] focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
                required
              />
            </div>
            <button type="submit" disabled={isLoading || totpCode.length !== 6}
              className="w-full rounded-lg bg-accent-blue px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Verifying…' : 'Verify Code'}
            </button>
            <button type="button" onClick={() => { setStep('credentials'); setError(''); setTotpCode(''); }}
              className="w-full text-sm text-slate-500 hover:text-slate-700">
              ← Back to sign in
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          Protected area. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
