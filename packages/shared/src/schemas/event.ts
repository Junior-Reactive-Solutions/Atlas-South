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
