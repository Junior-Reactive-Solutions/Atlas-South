import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { requireDb } from '../lib/prisma.js';

const CreateLeadSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  services: z.string().min(1).max(500),
  message: z.string().max(1000).optional(),
});

export const leadsRouter = Router();

leadsRouter.post('/leads', validateBody(CreateLeadSchema), async (req, res) => {
  try {
    const db = requireDb();
    const lead = await db.chatLead.create({ data: req.body });
    return res.status(201).json({ ok: true, id: lead.id });
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      return res.status(503).json({ error: 'Database not yet configured.' });
    }
    console.error('Failed to create chat lead:', err);
    return res.status(500).json({ error: 'Something went wrong — please try again.' });
  }
});
