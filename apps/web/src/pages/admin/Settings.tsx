import { useState } from 'react';
import { Lock, Key } from 'lucide-react';

export function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to change password');
        return;
      }

      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-8 text-3xl font-black text-navy">Settings</h1>

      {/* Password Change Section */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <Lock className="h-6 w-6 text-navy" />
          <h2 className="text-xl font-semibold text-navy">Change Password</h2>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-slate-700">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
              required
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
              required
            />
            <p className="mt-2 text-xs text-slate-600">Minimum 12 characters</p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 rounded-lg bg-accent-blue px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 2FA Section */}
      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <Key className="h-6 w-6 text-navy" />
          <h2 className="text-xl font-semibold text-navy">Two-Factor Authentication</h2>
        </div>

        <p className="text-slate-700">
          Two-factor authentication adds an extra layer of security to your account. When enabled, you'll need to provide a code from your
          authenticator app in addition to your password when logging in.
        </p>

        <button className="mt-4 rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300 disabled:opacity-50">
          Coming Soon
        </button>
      </div>

      {/* Security Info */}
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
