import { Router } from 'express';
import { TrackEventSchema, PageViewEventSchema, InteractionEventSchema } from '@atlas-south/shared';
import { validateBody } from '../middleware/validate.js';
import { requireDb } from '../lib/prisma.js';

/**
 * Interaction event tracking — docs/build/08-ADMIN-PANEL-SPEC.md §4. Feeds the admin
 * analytics dashboard. Deliberately collects no PII — session id is a client-generated,
 * anonymous UUID (see apps/web src/lib/analytics.ts, added when the analytics dashboard
 * ships in a later sprint).
 */
export const eventsRouter = Router();

// Legacy endpoint (generic event tracking)
eventsRouter.post('/events', validateBody(TrackEventSchema), async (req, res) => {
  try {
    const db = requireDb();
    if (req.body.type === 'page_view') {
      await db.pageView.create({
        data: { path: req.body.path, referrer: req.body.referrer, sessionId: req.body.sessionId },
      });
    } else {
      await db.event.create({
        data: {
          type: req.body.type,
          path: req.body.path,
          label: req.body.label,
          sessionId: req.body.sessionId,
        },
      });
    }
    return res.status(202).json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      // Analytics failing open (202 regardless) is deliberate — a missing DB in an
      // early dev environment should never block or error out the page the visitor is
      // actually trying to use.
      return res.status(202).json({ ok: true, tracked: false });
    }
    // eslint-disable-next-line no-console
    console.error('Failed to record event:', err);
    return res.status(202).json({ ok: true, tracked: false });
  }
});

// Page view tracking endpoint (used by usePageTracking hook). Previously accepted
// unvalidated, unbounded path/referrer/sessionId via a bare String(...) cast — a
// security-audit finding (2026-08-27), unauthenticated and inconsistent with every other
// public write endpoint on the site. validateBody rejects malformed input with a plain
// 400; the caller (apps/web/src/lib/analytics.ts) never inspects the response status, so
// this doesn't change the "analytics never breaks the page" contract the DB-error handling
// below still upholds.
eventsRouter.post('/events/page-view', validateBody(PageViewEventSchema), async (req, res) => {
  try {
    const db = requireDb();
    const { path, referrer, sessionId } = req.body;

    await db.pageView.create({
      data: { path, referrer: referrer ?? null, sessionId },
    });

    return res.status(202).json({ ok: true });
  } catch (err) {
    // Fail open — analytics should never block the app
    return res.status(202).json({ ok: true, tracked: false });
  }
});

// Interaction event tracking endpoint (CTA clicks, form submissions, etc.) — same
// validation fix as page-view above.
eventsRouter.post('/events/interaction', validateBody(InteractionEventSchema), async (req, res) => {
  try {
    const db = requireDb();
    const { type, label, path, sessionId } = req.body;

    await db.event.create({
      data: { type, label, path, sessionId },
    });

    return res.status(202).json({ ok: true });
  } catch (err) {
    // Fail open
    return res.status(202).json({ ok: true, tracked: false });
  }
});
