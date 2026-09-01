import { prisma } from './prisma.js';

/**
 * Writes to the SystemEvent table — the operations/error log the admin panel surfaces.
 *
 * Two rules make this safe to call from anywhere, including inside error handlers:
 *
 * 1. It never throws. A logger that can fail turns a handled 500 into an unhandled crash,
 *    and a logger called from the global error handler could loop. Every failure path here
 *    degrades to console output and returns.
 *
 * 2. It never blocks the response. Callers deliberately do not await it; persistence is
 *    fire-and-forget so a slow or unreachable database cannot add latency to a request that
 *    has already failed.
 *
 * Nothing written here identifies a visitor — see the note on the SystemEvent model. Do not
 * add an IP, session id or consent id to this table: it is read by the same admin screen as
 * the consent log, and the moment it carries a visitor identifier it stops being an
 * operations log and becomes the tracking the consent system exists to gate.
 */

export type SystemLogLevel = 'info' | 'warning' | 'error';

/** Storage caps, applied here rather than trusting callers. */
const MAX_MESSAGE = 500;
const MAX_STACK = 2000;
const MAX_PATH = 200;

export interface SystemLogInput {
  level?: SystemLogLevel;
  /** "api" | "web" */
  source: string;
  event: string;
  message: string;
  path?: string | null;
  context?: Record<string, unknown> | null;
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/**
 * Strips the query string from a path. Query strings routinely carry user input (search
 * terms, tokens), none of which belongs in a log that admins read.
 */
export function sanitisePath(path?: string | null): string | null {
  if (!path) return null;
  const withoutQuery = path.split('?')[0].split('#')[0];
  return truncate(withoutQuery, MAX_PATH);
}

export function logSystemEvent(input: SystemLogInput): void {
  const level = input.level ?? 'error';

  // Always emit to stdout too: Render's own log stream is what you have during an incident
  // where the database itself is the thing that's broken.
  const line = `[${level}] ${input.source}:${input.event} — ${input.message}`;
  if (level === 'error') console.error(line);
  else if (level === 'warning') console.warn(line);
  else console.log(line);

  // The nullable `prisma` export, not requireDb(): requireDb throws when DATABASE_URL is
  // unset, and this function must never throw. A dev environment without a database still
  // gets the console line above.
  if (!prisma) return;

  const context = input.context ? truncateContext(input.context) : null;

  void prisma.systemEvent
    .create({
      data: {
        level,
        source: truncate(input.source, 32),
        event: truncate(input.event, 64),
        message: truncate(input.message, MAX_MESSAGE),
        path: sanitisePath(input.path),
        context: context as never,
      },
    })
    .catch((err: unknown) => {
      // Swallowed on purpose. If the log write fails there is nowhere left to log it to
      // except stdout, and re-throwing would escalate a logging problem into an outage.
      console.error('systemLog: failed to persist event', err);
    });
}

/** Caps the one field likely to be large (a stack) without dropping the rest. */
function truncateContext(context: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    out[key] = typeof value === 'string' ? truncate(value, MAX_STACK) : value;
  }
  return out;
}
