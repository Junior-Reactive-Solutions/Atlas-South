import { Router, Response } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';
import { requireDb } from '../../lib/prisma.js';
import { sendAdminReply } from '../../lib/email.js';

export const adminApplicationsRouter = Router();

// Apply auth middleware to all routes in this router
adminApplicationsRouter.use(authMiddleware);

/**
 * List all job applications sorted by newest first
 * Protected by JWT authentication
 */
adminApplicationsRouter.get('/applications', async (req: AuthRequest, res: Response) => {
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
adminApplicationsRouter.get('/applications/:id', async (req: AuthRequest, res: Response) => {
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
 * GET /api/admin/applications/:id/cv — lets an admin actually retrieve a submitted CV.
 * No such route existed before (a security-audit finding, 2026-08-27): every CV was
 * accepted, confirmed by email, and then permanently unreachable — nothing ever served
 * the upload directory back out. This closes that for as long as the file still exists
 * on disk.
 *
 * It does NOT fix the underlying data-loss problem: Render's free-tier disk is ephemeral
 * and wipes on every deploy or restart, so a CV uploaded before the next deploy is still
 * gone regardless of this route existing. A real fix needs persistent storage (Cloudinary
 * is an already-present but unconfigured dependency — CLOUDINARY_* env vars are unset —
 * or S3-compatible object storage); provisioning that needs a decision and credentials
 * only the client can supply, so it's tracked as a separate follow-up rather than
 * silently deferred here.
 */
adminApplicationsRouter.get('/applications/:id/cv', async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const application = await db.jobApplication.findUnique({
      where: { id: req.params.id },
      select: { cvFilePath: true, cvFileName: true },
    });

    if (!application?.cvFilePath) {
      return res.status(404).json({ error: 'No CV on file for this application.' });
    }

    // cvFilePath is never derived from user input at read time — it's the exact path
    // this server itself wrote the file to (routes/careers.ts), read back from the
    // database, so no path-traversal input reaches this call.
    if (!fs.existsSync(application.cvFilePath)) {
      return res.status(410).json({
        error: 'This CV is no longer available — it was likely lost in a subsequent deploy (see the note on this route).',
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${(application.cvFileName || 'cv.pdf').replace(/"/g, '')}"`,
    );
    return res.sendFile(path.resolve(application.cvFilePath));
  } catch (err) {
    console.error('Failed to serve CV:', err);
    return res.status(500).json({ error: 'Something went wrong — please try again.' });
  }
});

/**
 * GET /api/admin/applications/:id/cover-letter — same pattern as the CV route above, for
 * the separate Cover Letter file added 2026-08-31. Same ephemeral-disk caveat applies.
 */
adminApplicationsRouter.get('/applications/:id/cover-letter', async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const application = await db.jobApplication.findUnique({
      where: { id: req.params.id },
      select: { coverLetterFilePath: true, coverLetterFileName: true },
    });

    if (!application?.coverLetterFilePath) {
      return res.status(404).json({ error: 'No cover letter file on file for this application.' });
    }

    // coverLetterFilePath is never derived from user input at read time — same guarantee
    // as cvFilePath above.
    if (!fs.existsSync(application.coverLetterFilePath)) {
      return res.status(410).json({
        error: 'This cover letter is no longer available — it was likely lost in a subsequent deploy.',
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${(application.coverLetterFileName || 'cover-letter.pdf').replace(/"/g, '')}"`,
    );
    return res.sendFile(path.resolve(application.coverLetterFilePath));
  } catch (err) {
    console.error('Failed to serve cover letter:', err);
    return res.status(500).json({ error: 'Something went wrong — please try again.' });
  }
});

const ReplySchema = z.object({
  subject: z.string().trim().min(1).max(200).optional(),
  message: z.string().trim().min(1).max(5000),
});

/** POST /api/admin/applications/:id/reply — send a themed reply email to the candidate. */
adminApplicationsRouter.post('/applications/:id/reply', async (req: AuthRequest, res: Response) => {
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
