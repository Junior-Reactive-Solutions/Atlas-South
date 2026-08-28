import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';
import { requireDb } from '../../lib/prisma.js';
import { sendAdminReply } from '../../lib/email.js';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const enquiries = await db.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const enquiry = await db.enquiry.findUnique({
      where: { id: req.params.id },
    });

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    res.json(enquiry);
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({ error: 'Failed to fetch enquiry' });
  }
});

const UpdateEnquirySchema = z.object({
  status: z.enum(['new', 'contacted', 'quoted', 'won', 'lost']).optional(),
  notes: z.string().max(5000).optional(),
}).refine((v) => v.status !== undefined || v.notes !== undefined, {
  message: 'At least one of status or notes must be provided',
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const patch = UpdateEnquirySchema.parse(req.body);

    const enquiry = await db.enquiry.update({
      where: { id: req.params.id },
      data: patch,
    });

    // Audit trail — log status changes and note saves separately so the Security
    // view can distinguish between them without parsing a compound event string.
    if (patch.status) {
      await db.adminAuditLog.create({
        data: {
          event: `enquiry_status_updated:${req.params.id}:${patch.status}`,
          ip: req.ip ?? 'unknown',
          adminUserId: req.adminId,
        },
      });
    }
    if (patch.notes !== undefined) {
      await db.adminAuditLog.create({
        data: {
          event: `enquiry_note_saved:${req.params.id}`,
          ip: req.ip ?? 'unknown',
          adminUserId: req.adminId,
        },
      });
    }

    res.json(enquiry);
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(400).json({ error: 'Failed to update enquiry' });
  }
});

const ReplySchema = z.object({
  subject: z.string().trim().min(1).max(200).optional(),
  message: z.string().trim().min(1).max(5000),
});

/** POST /api/admin/enquiries/:id/reply — send a themed reply email to the enquirer. */
router.post('/:id/reply', async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const enquiry = await db.enquiry.findUnique({ where: { id: req.params.id } });
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    const { subject, message } = ReplySchema.parse(req.body);
    const sent = await sendAdminReply({
      to: enquiry.email,
      recipientFirstName: enquiry.fullName.split(' ')[0],
      subject: subject || 'Re: your enquiry with Atlas South',
      message,
    });

    if (!sent) {
      return res.status(503).json({ error: 'Email is not configured for this environment.' });
    }

    await db.adminAuditLog.create({
      data: {
        event: `enquiry_reply_sent:${req.params.id}`,
        ip: req.ip ?? 'unknown',
        adminUserId: req.adminId,
      },
    });

    res.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.flatten() });
    }
    console.error('Error sending enquiry reply:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

export default router;
