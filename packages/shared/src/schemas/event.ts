import { z } from 'zod';

/**
 * Interaction event tracking — powers the admin analytics dashboard.
 * See docs/build/08-ADMIN-PANEL-SPEC.md §4 for what's collected and why, and
 * docs/build/10-LEGAL-CONTENT-PLAN.md for the matching retention/disclosure — these two
 * documents and this schema must never drift apart.
 */

export const EventType = z.enum([
  'page_view',
  'cta_click',
  'phone_click',
  'whatsapp_click',
  'form_start',
  'form_submit',
]);
export type EventType = z.infer<typeof EventType>;

export const TrackEventSchema = z.object({
  type: EventType,
  path: z.string().trim().max(300),
  /** Anonymised, client-generated session id — no PII, no cross-device tracking. */
  sessionId: z.string().uuid(),
  /** Free-form label for cta_click events, e.g. "hero-primary-cta". */
  label: z.string().trim().max(100).optional(),
  referrer: z.string().trim().max(300).optional(),
});
export type TrackEventInput = z.infer<typeof TrackEventSchema>;

/**
 * The two schemas below validate what the app's own tracking calls actually send
 * (apps/web/src/lib/analytics.ts) — added as a security-audit fix (2026-08-27): the two
 * live tracking routes (POST /api/events/page-view, POST /api/events/interaction) had no
 * validation at all, unlike every other public write endpoint on the site.
 *
 * They can't just reuse TrackEventSchema above: its `sessionId` requires a UUID, but
 * analytics.ts generates its session id with `nanoid()`, which is not UUID-shaped —
 * validating against TrackEventSchema would have rejected every real, legitimate request.
 * TrackEventSchema itself is left untouched since it's still what the "legacy" /events
 * endpoint validates against.
 */
export const PageViewEventSchema = z.object({
  path: z.string().trim().min(1).max(300),
  referrer: z.string().trim().max(300).nullable().optional(),
  sessionId: z.string().trim().min(1).max(64),
});
export type PageViewEventInput = z.infer<typeof PageViewEventSchema>;

export const InteractionEventSchema = z.object({
  type: EventType,
  label: z.string().trim().min(1).max(100),
  path: z.string().trim().min(1).max(300),
  sessionId: z.string().trim().min(1).max(64),
});
export type InteractionEventInput = z.infer<typeof InteractionEventSchema>;
