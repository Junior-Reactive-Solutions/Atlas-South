import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';
import { requireDb } from '../../lib/prisma.js';

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
  status: z.enum(['new', 'contacted', 'quoted', 'won', 'lost']),
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const { status } = UpdateEnquirySchema.parse(req.body);

    const enquiry = await db.enquiry.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Audit trail: every enquiry status change is logged with the acting admin
    await db.adminAuditLog.create({
      data: {
        event: `enquiry_status_updated:${req.params.id}:${status}`,
        ip: req.ip ?? 'unknown',
        adminUserId: req.adminId,
      },
    });

    res.json(enquiry);
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(400).json({ error: 'Failed to update enquiry' });
  }
});

export default router;
