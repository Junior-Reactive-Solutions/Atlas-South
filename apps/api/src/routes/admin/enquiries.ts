import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware to all admin routes
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const enquiry = await prisma.enquiry.findUnique({
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

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status } = UpdateEnquirySchema.parse(req.body);

    const enquiry = await prisma.enquiry.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(enquiry);
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(400).json({ error: 'Failed to update enquiry' });
  }
});

export default router;
