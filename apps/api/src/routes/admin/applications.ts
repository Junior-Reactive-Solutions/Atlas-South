import { Router, Response } from 'express';
import { z } from 'zod';
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
