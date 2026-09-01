import { Router } from 'express';
import { RecordConsentSchema, ClientErrorSchema } from '@atlas-south/shared';
import { validateBody } from '../middleware/validate.js';
import { consentLimiter, clientErrorLimiter } from '../middleware/rateLimiters.js';
import { prisma } from '../lib/prisma.js';
import { logSystemEvent, sanitisePath } from '../lib/systemLog.js';

/**
 * Two public write endpoints that exist for compliance and operations, not for tracking.
 *
 * Both follow the same contract as the analytics endpoints: they always answer 2xx, and a
 * database problem is never allowed to surface to the visitor. Neither is something the
 * person browsing asked for, so neither may degrade their experience — a failure to record
 * a consent decision must not block the banner from closing, and a failure to record a
 * crash report must not produce a second error on an already-broken page.
 */
export const telemetryRouter = Router();

/**
 * POST /api/consent — records a cookie-consent decision for the audit trail.
 *
 * Called once when the visitor answers the banner, and again whenever they change their
 * mind. Never called on page views, which is what keeps it from being a tracking channel.
 *
 * Note this is recorded for refusals too. That is the point: "this visitor declined
 * analytics on this date, under version N of the policy" is precisely the record that
 * demonstrates the refusal was honoured, and it is as important to hold as a grant.
 */
telemetryRouter.post('/consent', consentLimiter, validateBody(RecordConsentSchema), async (req, res) => {
  const { consentId, version, choices, decidedAt } = req.body;

  try {
    if (!prisma) {
      // No database configured (local dev). The visitor's own stored choice is still
      // authoritative for what actually runs, so this is not an error for them.
      return res.status(202).json({ ok: true, recorded: false });
    }

    await prisma.consentLog.create({
      data: { consentId, version, choices, decidedAt: new Date(decidedAt) },
    });

    return res.status(201).json({ ok: true, recorded: true });
  } catch (err) {
    // Logged, not surfaced: the enforcement of consent happens on the visitor's device and
    // does not depend on this write succeeding. Losing an audit row is a problem for the
    // operator to see, not something to show the person who just answered a banner.
    logSystemEvent({
      source: 'api',
      event: 'consent_log_write_failed',
      message: err instanceof Error ? err.message : 'Unknown error recording consent',
      path: '/api/consent',
    });
    return res.status(202).json({ ok: true, recorded: false });
  }
});

/**
 * POST /api/errors — client-side crash reports.
 *
 * Deliberately narrow: the schema pins `event` to a known set and caps every string, so
 * this cannot be used to write arbitrary content into the operations log. The client strips
 * query strings before sending, and nothing here records who the visitor was.
 */
telemetryRouter.post('/errors', clientErrorLimiter, validateBody(ClientErrorSchema), async (req, res) => {
  const { event, message, path, stack } = req.body;

  logSystemEvent({
    level: 'error',
    source: 'web',
    event,
    message,
    path: sanitisePath(path),
    context: stack ? { stack } : null,
  });

  // 202, not 201: logSystemEvent is fire-and-forget, so this acknowledges receipt rather
  // than claiming the row is committed.
  return res.status(202).json({ ok: true });
});
