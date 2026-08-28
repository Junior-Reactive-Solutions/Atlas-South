import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Key, LogIn, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

interface AuditEntry {
  id: string;
  event: string;
  ip: string | null;
  createdAt: string;
  admin: { email: string } | null;
}

/**
 * Admin Security view — docs/build/08-ADMIN-PANEL-SPEC.md §6 "Security".
 * Shows the full AdminAuditLog: login successes/failures, password changes,
 * enquiry status moves, and reply events. Gives the site owner visibility into
 * all admin actions without needing to trawl server logs.
 */

function eventIcon(event: string) {
  if (event.startsWith('login_success')) return <LogIn className="h-4 w-4 text-green-600" />;
  if (event.startsWith('login_failed')) return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (event.startsWith('password_changed') || event.startsWith('totp_')) return <Key className="h-4 w-4 text-yellow-600" />;
  if (event.startsWith('enquiry_reply_sent')) return <Mail className="h-4 w-4 text-accent-blue" />;
  return <ShieldCheck className="h-4 w-4 text-slate-400" />;
}

function eventLabel(event: string): string {
  if (event === 'login_success') return 'Login — success';
  if (event === 'login_failed') return 'Login — failed attempt';
  if (event === 'login_locked') return 'Account locked after failed attempts';
  if (event === 'password_changed') return 'Password changed';
  if (event === 'totp_enabled') return '2FA enabled';
  if (event === 'totp_disabled') return '2FA disabled';
  if (event.startsWith('enquiry_status_updated:')) {
    const [, id, status] = event.split(':');
    return `Enquiry ${id?.slice(0, 8)}… moved to ${status}`;
  }
  if (event.startsWith('enquiry_reply_sent:')) {
    const id = event.split(':')[1];
    return `Reply sent on enquiry ${id?.slice(0, 8)}…`;
  }
  if (event.startsWith('enquiry_note_saved:')) {
    const id = event.split(':')[1];
    return `Note saved on enquiry ${id?.slice(0, 8)}…`;
  }
  return event;
}

function severityClass(event: string): string {
  if (event.startsWith('login_failed') || event.startsWith('login_locked'))
    return 'border-l-4 border-red-400 bg-red-50';
  if (event.startsWith('login_success'))
    return 'border-l-4 border-green-400 bg-green-50';
  return 'border-l-4 border-slate-200 bg-white';
}

export function AdminSecurity() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useAuth();

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch('/api/admin/audit-log');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setLogs(data);
    } catch {
      setError('Could not load security log. Try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-navy">Security Log</h1>
          <p className="mt-1 text-sm text-slate">
            All admin actions — logins, status changes, replies. Retained for 12 months.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          aria-label="Refresh security log"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary chips */}
      {!isLoading && !error && (
        <div className="flex flex-wrap gap-3">
          {(['login_success', 'login_failed', 'login_locked'] as const).map((type) => {
            const count = logs.filter((l) => l.event.startsWith(type)).length;
            return (
              <span
                key={type}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  type === 'login_success'
                    ? 'bg-green-100 text-green-800'
                    : type === 'login_failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-orange-100 text-orange-800'
                }`}
              >
                {eventIcon(type)}
                {type === 'login_success' ? 'Successful logins' : type === 'login_failed' ? 'Failed attempts' : 'Account locks'}: {count}
              </span>
            );
          })}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-slate">Loading security log…</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!isLoading && !error && logs.length === 0 && (
        <div className="rounded-lg bg-slate-50 p-8 text-center text-sm text-slate">
          No events recorded yet.
        </div>
      )}

      {!isLoading && !error && logs.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="hidden px-4 py-3 sm:table-cell">Admin</th>
                <th className="hidden px-4 py-3 md:table-cell">IP</th>
                <th className="px-4 py-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((entry) => (
                <tr key={entry.id} className={`${severityClass(entry.event)} transition-colors`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {eventIcon(entry.event)}
                      <span className="font-medium text-navy">{eventLabel(entry.event)}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                    {entry.admin?.email ?? <span className="italic text-slate-400">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-slate-500 md:table-cell">
                    {entry.ip ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-slate-500">
                    {new Date(entry.createdAt).toLocaleString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
