import { z } from 'zod';

/**
 * Public write endpoints for the consent audit trail and client-side error reporting.
 *
 * Both are unauthenticated by necessity — a visitor recording a cookie choice has no
 * account, and a page that has just crashed cannot be relied on to authenticate. So both
 * are validated tightly here and rate-limited at the route, exactly as the enquiry form is:
 * an open endpoint that writes to the database is a flooding target, and an unbounded
 * string field is a storage-exhaustion one.
 */

/** Matches CONSENT_VERSION in apps/web/src/lib/cookieRegistry.ts. */
export const RecordConsentSchema = z.object({
  /**
   * Random per-decision reference generated on the visitor's device. Bounded and
   * charset-restricted so it can only ever be an opaque token — this is never rendered as
   * HTML, but a log field an attacker controls should not accept arbitrary content.
   */
  consentId: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, 'consentId must be an opaque token'),
  version: z.number().int().min(1).max(1000),
  /**
   * Category id → granted. Keys are bounded in count and length rather than pinned to a
   * fixed enum, so adding a category to the registry doesn't require a coordinated deploy
   * of web and api to keep consent recordable.
   */
  choices: z.record(z.string().trim().min(1).max(64), z.boolean()).refine(
    (c) => Object.keys(c).length > 0 && Object.keys(c).length <= 20,
    'choices must contain between 1 and 20 categories'
  ),
  /** When the visitor answered, per their own clock. */
  decidedAt: z.string().datetime(),
});
export type RecordConsentInput = z.infer<typeof RecordConsentSchema>;

export const ClientErrorSchema = z.object({
  /**
   * Short machine-readable kind. Constrained to a known set rather than free text so this
   * endpoint can't be used to write arbitrary labels into the operations log.
   */
  event: z.enum(['client_render_error', 'client_unhandled_rejection', 'client_window_error']),
  message: z.string().trim().min(1).max(500),
  /**
   * Page path only. The client strips query strings before sending — those routinely carry
   * user input, and an error log is not a place for it.
   */
  path: z.string().trim().max(200).optional(),
  /** Truncated stack. Capped well below anything that could bloat a row. */
  stack: z.string().trim().max(2000).optional(),
});
export type ClientErrorInput = z.infer<typeof ClientErrorSchema>;
