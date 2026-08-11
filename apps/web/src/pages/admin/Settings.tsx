import { useState, useEffect } from 'react';
import { Lock, Key, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

// ── Types ──────────────────────────────────────────────────────────────────────
type TotpStep = 'idle' | 'loading-qr' | 'scan' | 'confirm' | 'done';
type DisableStep = 'idle' | 'confirming';

// ── Component ──────────────────────────────────────────────────────────────────
export function AdminSettings() {
  const { authFetch } = useAuth();

  // ── Password change state ────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // ── 2FA state ────────────────────────────────────────────────────────────────
  const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null);
  const [totpStep, setTotpStep] = useState<TotpStep>('idle');
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeDataUri, setQrCodeDataUri] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');
  const [totpLoading, setTotpLoading] = useState(false);

  const [disableStep, setDisableStep] = useState<DisableStep>('idle');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableTotpCode, setDisableTotpCode] = useState('');
  const [disableError, setDisableError] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);

  // ── Load 2FA status on mount ─────────────────────────────────────────────────
  useEffect(() => {
    authFetch('/api/admin/totp/status')
      .then((r) => r.json())
      .then((d) => setTotpEnabled(d.enabled))
      .catch(() => setTotpEnabled(false));
  }, [authFetch]);

  // ── Password change handler ──────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return; }
    if (newPassword.length < 12) { setPwError('Password must be at least 12 characters'); return; }

    setPwLoading(true);
    try {
      const r = await authFetch('/api/admin/users/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!r.ok) { const d = await r.json(); setPwError(d.error || 'Failed to change password'); return; }
      setPwSuccess('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch {
      setPwError('Network error. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  // ── 2FA: Start setup (generate secret + QR) ──────────────────────────────────
  const handleStartSetup = async () => {
    setTotpError('');
    setTotpStep('loading-qr');
    try {
      const r = await authFetch('/api/admin/totp/setup', { method: 'POST' });
      if (!r.ok) { const d = await r.json(); setTotpError(d.error || 'Setup failed'); setTotpStep('idle'); return; }
      const d = await r.json();
      setTotpSecret(d.secret);
      setQrCodeDataUri(d.qrCodeDataUri);
      setTotpStep('scan');
    } catch {
      setTotpError('Network error. Please try again.');
      setTotpStep('idle');
    }
  };

  // ── 2FA: Confirm code to enable ──────────────────────────────────────────────
  const handleConfirmEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpError('');
    setTotpLoading(true);
    try {
      const r = await authFetch('/api/admin/totp/verify', {
        method: 'POST',
        body: JSON.stringify({ secret: totpSecret, totpCode }),
      });
      if (!r.ok) { const d = await r.json(); setTotpError(d.error || 'Invalid code'); setTotpLoading(false); return; }
      setTotpEnabled(true);
      setTotpStep('done');
      setTotpCode('');
    } catch {
      setTotpError('Network error. Please try again.');
    } finally {
      setTotpLoading(false);
    }
  };

  // ── 2FA: Disable ─────────────────────────────────────────────────────────────
  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableError('');
    setDisableLoading(true);
    try {
      const r = await authFetch('/api/admin/totp/disable', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: disablePassword, totpCode: disableTotpCode }),
      });
      if (!r.ok) { const d = await r.json(); setDisableError(d.error || 'Failed to disable 2FA'); setDisableLoading(false); return; }
      setTotpEnabled(false);
      setDisableStep('idle');
      setDisablePassword(''); setDisableTotpCode('');
    } catch {
      setDisableError('Network error. Please try again.');
    } finally {
      setDisableLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-black text-navy">Settings</h1>

      {/* ── Password Change ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <Lock className="h-6 w-6 text-navy" />
          <h2 className="text-xl font-semibold text-navy">Change Password</h2>
        </div>

        {pwError && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">{pwError}</div>}
        {pwSuccess && <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">{pwSuccess}</div>}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-slate-700">Current Password</label>
            <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20" required />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">New Password</label>
            <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20" required />
            <p className="mt-1 text-xs text-slate-500">Minimum 12 characters</p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">Confirm Password</label>
            <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20" required />
          </div>
          <button type="submit" disabled={pwLoading}
            className="mt-2 rounded-lg bg-accent-blue px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
            {pwLoading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* ── Two-Factor Authentication ───────────────────────────────────────── */}
      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <Key className="h-6 w-6 text-navy" />
          <h2 className="text-xl font-semibold text-navy">Two-Factor Authentication</h2>
          {totpEnabled === null && <Loader2 className="ml-2 h-4 w-4 animate-spin text-slate-400" />}
          {totpEnabled === true && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Enabled
            </span>
          )}
          {totpEnabled === false && totpStep === 'idle' && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              <ShieldOff className="h-3.5 w-3.5" /> Disabled
            </span>
          )}
        </div>

        <p className="text-sm text-slate-600">
          Adds a one-time code from your authenticator app (Google Authenticator, Authy, 1Password) as a
          second login step. Strongly recommended — this panel holds all client enquiry data.
        </p>

        {totpError && <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">{totpError}</div>}

        {/* ── Not enabled: prompt to set up ─────────────────────────────────── */}
        {totpEnabled === false && totpStep === 'idle' && (
          <button onClick={handleStartSetup}
            className="mt-5 rounded-lg bg-accent-blue px-5 py-2 font-semibold text-white transition-colors hover:bg-blue-700">
            Enable Two-Factor Authentication
          </button>
        )}

        {/* ── Loading QR ────────────────────────────────────────────────────── */}
        {totpStep === 'loading-qr' && (
          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Generating setup code…
          </div>
        )}

        {/* ── Scan QR ───────────────────────────────────────────────────────── */}
        {totpStep === 'scan' && (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-slate-700 font-medium">Step 1 — Scan this QR code with your authenticator app</p>
            <img src={qrCodeDataUri} alt="TOTP QR code" className="h-48 w-48 rounded-lg border border-slate-200" />
            <details className="text-xs text-slate-500">
              <summary className="cursor-pointer font-medium">Can't scan? Enter manually</summary>
              <code className="mt-2 block break-all rounded bg-slate-100 p-3 text-xs">{totpSecret}</code>
            </details>
            <button onClick={() => { setTotpStep('confirm'); setTotpCode(''); }}
              className="rounded-lg bg-accent-blue px-5 py-2 font-semibold text-white transition-colors hover:bg-blue-700">
              I've scanned it →
            </button>
          </div>
        )}

        {/* ── Confirm code ──────────────────────────────────────────────────── */}
        {totpStep === 'confirm' && (
          <form onSubmit={handleConfirmEnable} className="mt-5 space-y-4">
            <p className="text-sm text-slate-700 font-medium">Step 2 — Enter the 6-digit code from your authenticator app</p>
            <input
              type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
              value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-40 rounded-lg border border-slate-300 px-4 py-2 text-center text-xl tracking-widest focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
              required
            />
            <div className="flex gap-3">
              <button type="submit" disabled={totpLoading || totpCode.length !== 6}
                className="rounded-lg bg-accent-blue px-5 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                {totpLoading ? 'Verifying…' : 'Confirm & Enable'}
              </button>
              <button type="button" onClick={() => { setTotpStep('scan'); setTotpCode(''); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                ← Back
              </button>
            </div>
          </form>
        )}

        {/* ── Done: just enabled ────────────────────────────────────────────── */}
        {totpStep === 'done' && (
          <div className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-700 flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Two-factor authentication is now active.</p>
              <p className="mt-1">You'll be asked for your authenticator code on every login.</p>
            </div>
          </div>
        )}

        {/* ── Enabled: option to disable ────────────────────────────────────── */}
        {totpEnabled === true && totpStep !== 'done' && (
          <div className="mt-5">
            {disableStep === 'idle' && (
              <button onClick={() => { setDisableStep('confirming'); setDisableError(''); }}
                className="rounded-lg border border-red-300 px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
                Disable Two-Factor Authentication
              </button>
            )}
            {disableStep === 'confirming' && (
              <form onSubmit={handleDisable} className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-medium text-red-700">
                  To disable 2FA, confirm your password and enter a code from your authenticator app.
                </p>
                {disableError && <p className="text-sm text-red-600">{disableError}</p>}
                <div>
                  <label htmlFor="disable-password" className="block text-sm font-medium text-slate-700">Current Password</label>
                  <input id="disable-password" type="password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-accent-blue focus:outline-none"
                    required />
                </div>
                <div>
                  <label htmlFor="disable-totp-code" className="block text-sm font-medium text-slate-700">Authenticator Code</label>
                  <input id="disable-totp-code" type="text" inputMode="numeric" pattern="\d{6}" maxLength={6}
                    value={disableTotpCode} onChange={(e) => setDisableTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="mt-1 w-40 rounded-lg border border-slate-300 px-4 py-2 text-center text-xl tracking-widest focus:border-accent-blue focus:outline-none"
                    required />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={disableLoading}
                    className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                    {disableLoading ? 'Disabling…' : 'Confirm Disable'}
                  </button>
                  <button type="button" onClick={() => { setDisableStep('idle'); setDisablePassword(''); setDisableTotpCode(''); setDisableError(''); }}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ── Security Tips ───────────────────────────────────────────────────── */}
      <div className="mt-8 rounded-lg bg-blue-50 p-6">
        <h3 className="font-semibold text-navy">Security Tips</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>• Use a strong, unique password that you don't use elsewhere</li>
          <li>• Enable two-factor authentication for extra security</li>
          <li>• Never share your admin credentials with anyone</li>
          <li>• Log out when using a shared computer</li>
          <li>• Review login activity regularly in the Security section</li>
        </ul>
      </div>
    </div>
  );
}
