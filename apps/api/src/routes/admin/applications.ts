import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';
import { requireDb } from '../../lib/prisma.js';
import { sendAdminReply } from '../../lib/email.js';

export const adminApplicationsRouter = Router();

// authMiddleware is applied per-route below, NOT via a blanket `.use()` here — this router
// is mounted at the bare '/api/admin' prefix (index.ts), shared with six other routers
// (adminUsersRouter, adminStatsRouter, adminTotpRouter, ...). A blanket `.use()` on a
// router sharing that prefix intercepts every request under it, not just this router's own
// four routes — including ones this file has never heard of, like
// '/api/admin/users/change-password'.
//
// That's exactly how this broke (2026-09-02): authMiddleware's mustChangePassword
// exemption checks `req.baseUrl === '/api/admin/users'` to let the change-password request
// itself through. With this mounted first at the shared prefix, THIS copy of authMiddleware
// ran for that request, computed `req.baseUrl === '/api/admin'` (this router's own mount
// point, not the specific one the check expected), failed the exemption, and returned 403
// — for every account with mustChangePassword set, not just one. adminUsersRouter's own
// copy of the same check never ran; this router answered first and the request never
// reached it. Confirmed by instrumenting a local reproduction and reading the actual
// runtime baseUrl.
//
// Scoping the middleware to each literal route means it only ever runs for a request that
// actually matches THIS router's own paths, so it can no longer intercept a sibling route
// mounted under the same prefix — matching the pattern adminLeadsRouter already uses
// correctly.

/**
 * List all job applications sorted by newest first
 * Protected by JWT authentication
 */
adminApplicationsRouter.get('/applications', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const applications = await db.jobApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(applications);
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      return res.status(503).json({ error: 'Database not yet configured for this environment.' });
    }
    console.error('Failed to fetch applications:', err);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * Get a single job application by ID
 * Protected by JWT authentication
 */
adminApplicationsRouter.get('/applications/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const application = await db.jobApplication.findUnique({
      where: { id: req.params.id },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    return res.status(200).json(application);
  } catch (err) {
    console.error('Failed to fetch application:', err);
    return res.status(500).json({ error: 'Failed to fetch application' });
  }
});

/**
 * GET /api/admin/applications/:id/cv and .../cover-letter
 *
 * RETIRED 2026-09-02. Uploads are no longer stored on the server at all: they are attached
 * to the notification email sent to the careers mailbox at submission time
 * (routes/careers.ts). There is therefore no file for these routes to serve.
 *
 * They answer 410 Gone rather than being deleted outright, because the admin UI and any
 * bookmarked links would otherwise get an unexplained 404 — a specific message pointing at
 * the careers inbox is far more useful to whoever hits it than a dead route.
 *
 * This also closes the data-loss problem the old routes carried a long note about: files
 * were written to Render local disk, which is wiped on every deploy, so a CV was reliably
 * unreachable within days of being received. Emailing them means the copy lands somewhere
 * durable and monitored instead.
 */
for (const suffix of ['cv', 'cover-letter']) {
  adminApplicationsRouter.get(`/applications/:id/${suffix}`, authMiddleware, async (_req: AuthRequest, res: Response) => {
    return res.status(410).json({
      error:
        'Documents are no longer stored on the server. The CV and cover letter were emailed to the careers inbox when the application was submitted.',
    });
  });
}

const ReplySchema = z.object({
  subject: z.string().trim().min(1).max(200).optional(),
  message: z.string().trim().min(1).max(5000),
});

/** POST /api/admin/applications/:id/reply — send a themed reply email to the candidate. */
adminApplicationsRouter.post('/applications/:id/reply', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const application = await db.jobApplication.findUnique({ where: { id: req.params.id } });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const { subject, message } = ReplySchema.parse(req.body);
    const sent = await sendAdminReply({
      to: application.email,
      recipientFirstName: application.fullName.split(' ')[0],
      subject: subject || `Re: your application — ${application.roleTitle ?? 'Atlas South Careers'}`,
      message,
    });

    if (!sent) {
      return res.status(503).json({ error: 'Email is not configured for this environment.' });
    }

    await db.adminAuditLog.create({
      data: {
        event: `application_reply_sent:${req.params.id}`,
        ip: req.ip ?? 'unknown',
        adminUserId: req.adminId,
      },
    });

    return res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.flatten() });
    }
    console.error('Error sending application reply:', error);
    return res.status(500).json({ error: 'Failed to send reply' });
  }
});

/**
 * Permanently delete a job application.
 *
 * Same reasoning as the enquiry delete (routes/admin/enquiries.ts): UK GDPR's right to
 * erasure applies squarely to an application record, which holds a candidate's name,
 * email and phone number. Without this the only way to honour an erasure request was to
 * edit the production database directly.
 *
 * It matters slightly more here than for enquiries. Candidate data is a category people
 * are more likely to ask to have removed, and unsuccessful applications should not be kept
 * indefinitely by default. Note that the CV and cover letter are NOT held here — since
 * 2026-09-02 they are emailed to the careers inbox and never written to the server — so
 * deleting this row removes the record, and clearing the documents means deleting that
 * email. Anyone honouring a full erasure request needs to do both.
 *
 * A hard delete, for the same reason: a soft-deleted row still holds the personal data the
 * request exists to remove. The audit log keeps the accountability trail without it.
 */
adminApplicationsRouter.delete('/applications/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const existing = await db.jobApplication.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await db.jobApplication.delete({ where: { id: req.params.id } });

    await db.adminAuditLog.create({
      data: {
        event: `application_deleted:${req.params.id}`,
        ip: req.ip ?? 'unknown',
        adminUserId: req.adminId,
      },
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return res.status(500).json({ error: 'Failed to delete application' });
  }
});
