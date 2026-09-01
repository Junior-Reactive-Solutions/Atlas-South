import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

/**
 * Admin view over the two logs that sit alongside the cookie-consent system:
 *
 *   • Consent record — evidence of who agreed to what, and when. UK GDPR Art. 7(1) puts the
 *     burden of demonstrating consent on the operator, and a choice held only in a
 *     visitor's own browser can't be produced when asked for.
 *   • System & errors — API faults and client-side crashes, so a problem is visible here
 *     rather than only in a hosting log that rolls over within hours.
 *
 * Neither log identifies a visitor. That is deliberate and load-bearing: the consent log
 * covers people who may have *refused* tracking, so building it from anything that could
 * follow them would defeat the thing it exists to evidence. What you get is "a decision of
 * this shape was made at this time under this policy version", not "this person did X".
 */

interface ConsentEntry {
  id: string;
  consentId: string;
  version: number;
  choices: Record<string, boolean>;
  decidedAt: string;
  createdAt: string;
}

interface SystemEntry {
  id: string;
  level: 'info' | 'warning' | 'error';
  source: string;
  event: string;
  message: string;
  path: string | null;
  context: Record<string, unknown> | null;
  createdAt: string;
}

type LevelFilter = 'all' | 'error' | 'warning' | 'info';

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

function levelIcon(level: SystemEntry['level']) {
  if (level === 'error') return <XCircle className="h-4 w-4 shrink-0 text-red-500" />;
  if (level === 'warning') return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />;
  return <Info className="h-4 w-4 shrink-0 text-slate-400" />;
}

export function AdminSystemLogs() {
  const { authFetch } = useAuth();

  const [consent, setConsent] = useState<ConsentEntry[]>([]);
  const [consentSummary, setConsentSummary] = useState<{
    total: number;
    analyticsGranted: number;
    analyticsRefused: number;
  } | null>(null);

  const [events, setEvents] = useState<SystemEntry[]>([]);
  const [eventSummary, setEventSummary] = useState<{ errors: number; warnings: number } | null>(null);
  const [level, setLevel] = useState<LevelFilter>('all');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = level === 'all' ? '' : `?level=${level}`;
      const [cRes, sRes] = await Promise.all([
        authFetch('/api/admin/consent-log'),
        authFetch(`/api/admin/system-events${query}`),
      ]);
      if (!cRes.ok || !sRes.ok) throw new Error('Failed to fetch');

      const cData = await cRes.json();
      const sData = await sRes.json();
      setConsent(cData.entries ?? []);
      setConsentSummary(cData.summary ?? null);
      setEvents(sData.entries ?? []);
      setEventSummary(sData.summary ?? null);
    } catch {
      setError('Could not load logs. Try refreshing.');
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, level]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy">System &amp; Consent Logs</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate">
            Cookie consent evidence and the error log. Neither records anything that identifies a
            visitor — see the Cookie Policy for what the site collects and why.
          </p>
        </div>
        <button
          onClick={load}
          disabled={isLoading}
          aria-label="Refresh logs"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* ── Consent evidence ─────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent-blue" />
          <h2 className="text-xl font-bold text-navy">Cookie consent record</h2>
        </div>

        {consentSummary && (
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
              Total decisions: {consentSummary.total}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Analytics allowed: {consentSummary.analyticsGranted}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
              Analytics refused: {consentSummary.analyticsRefused}
            </span>
          </div>
        )}

        {!isLoading && consent.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate">
            No consent decisions recorded yet.
          </p>
        )}

        {consent.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Decided</th>
                  <th className="px-4 py-3 font-semibold">Choices</th>
                  <th className="px-4 py-3 font-semibold">Policy version</th>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consent.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatWhen(row.decidedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(row.choices).map(([cat, granted]) => (
                          <span
                            key={cat}
                            className={`rounded px-1.5 py-0.5 text-xs ${
                              granted ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {cat}: {granted ? 'yes' : 'no'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">v{row.version}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-400">
                      {row.consentId.slice(0, 12)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Errors and system events ─────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold text-navy">Errors &amp; system events</h2>
          </div>
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
            {(['all', 'error', 'warning', 'info'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`rounded px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  level === l ? 'bg-navy text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {eventSummary && (
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
              <XCircle className="h-3.5 w-3.5" /> Errors: {eventSummary.errors}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5" /> Warnings: {eventSummary.warnings}
            </span>
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate">
            Nothing logged{level !== 'all' ? ` at "${level}" level` : ''} — which is the good outcome.
          </p>
        )}

        <div className="space-y-2">
          {events.map((row) => (
            <details
              key={row.id}
              className={`rounded-lg border bg-white p-3 ${
                row.level === 'error'
                  ? 'border-l-4 border-l-red-400 border-slate-200'
                  : row.level === 'warning'
                    ? 'border-l-4 border-l-amber-400 border-slate-200'
                    : 'border-slate-200'
              }`}
            >
              <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm">
                {levelIcon(row.level)}
                <span className="font-medium text-navy">{row.event}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                  {row.source}
                </span>
                {row.path && <code className="text-xs text-slate-500">{row.path}</code>}
                <span className="ml-auto whitespace-nowrap text-xs text-slate-400">
                  {formatWhen(row.createdAt)}
                </span>
              </summary>
              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                <p className="text-sm text-slate-700">{row.message}</p>
                {row.context && (
                  <pre className="max-h-60 overflow-auto rounded bg-slate-50 p-3 text-xs text-slate-600">
                    {JSON.stringify(row.context, null, 2)}
                  </pre>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
