import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { requireDb } from '../lib/prisma.js';

// Email is only required when the visitor picked "Email" as their preferred contact
// method — the chatbot never asks for it otherwise, so requiring it unconditionally here
// would reject a perfectly valid phone-preference submission. superRefine cross-checks
// the two fields together rather than each field validating in isolation.
const CreateLeadSchema = z
  .object({
    firstName: z.string().min(1).max(60),
    lastName: z.string().min(1).max(60),
    company: z.string().min(1).max(160),
    phone: z.string().min(1).max(30),
    preferredContact: z.enum(['email', 'phone']),
    email: z.string().email().max(254).optional(),
    services: z.string().min(1).max(500),
    message: z.string().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.preferredContact === 'email' && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'Email is required when the preferred contact method is email.',
      });
    }
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
