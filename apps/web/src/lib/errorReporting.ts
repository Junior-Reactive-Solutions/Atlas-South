/**
 * Reports client-side faults to the operations log so they're visible in the admin panel.
 *
 * NOT analytics, and not consent-gated. The distinction is what the visitor's refusal
 * actually covers: analytics is about building a picture of what a person browses, and is
 * refusable. Recording that a page threw an exception is operational necessity — the
 * ordinary business of knowing your own software is broken (UK GDPR Art. 6(1)(f)), which is
 * what the Cookie Policy describes as "the ordinary server record every website keeps in
 * order to serve a page at all".
 *
 * That distinction only holds if this stays scrupulously non-identifying, so it is:
 *   - no session id, no consent id, no visitor identifier of any kind
 *   - query strings stripped before sending, since they carry user input
 *   - reports are never correlated into a per-visitor trail; each row stands alone
 *
 * If a future change wants to attach anything visitor-specific here, it stops being an
 * operations log and needs to go behind consent instead.
 */

/** Matches the server's ClientErrorSchema. */
type ClientErrorEvent = 'client_render_error' | 'client_unhandled_rejection' | 'client_window_error';

/**
 * A broken page can throw continuously — a render loop emits as fast as the browser runs.
 * Reporting each one would flood the log and the network, so this caps what one page
 * session will ever send. The server rate-limits per IP as well; this is the polite half.
 */
const MAX_REPORTS_PER_SESSION = 5;
let reportsSent = 0;

/** Identical errors repeat constantly; only the first of each is worth a row. */
const seen = new Set<string>();

export function reportClientError(
  event: ClientErrorEvent,
  error: unknown,
  extra?: { path?: string }
): void {
  if (reportsSent >= MAX_REPORTS_PER_SESSION) return;

  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown client error';
  const stack = error instanceof Error ? error.stack : undefined;

  // Query strings are stripped: they routinely carry user input, which has no place in a
  // log an admin reads.
  const rawPath = extra?.path ?? (typeof window !== 'undefined' ? window.location.pathname : undefined);
  const path = rawPath?.split('?')[0]?.split('#')[0];

  const key = `${event}:${message}:${path ?? ''}`;
  if (seen.has(key)) return;
  seen.add(key);
  reportsSent += 1;

  try {
    void fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        message: message.slice(0, 500),
        path: path?.slice(0, 200),
        stack: stack?.slice(0, 2000),
      }),
      keepalive: true,
    }).catch(() => {
      /* Reporting a failure must never itself produce a visible failure. */
    });
  } catch {
    /* fetch unavailable */
  }
}

/**
 * Catches the two classes of fault React's error boundary cannot see: exceptions outside
 * the render tree, and rejected promises nobody handled. Installed once, from main.tsx.
 */
export function installGlobalErrorReporting(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (e: ErrorEvent) => {
    reportClientError('client_window_error', e.error ?? e.message);
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    reportClientError('client_unhandled_rejection', e.reason);
  });
}
