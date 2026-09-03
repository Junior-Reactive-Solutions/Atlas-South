import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { requireDb } from '../lib/prisma.js';
import { sendChatLeadConfirmation, sendChatLeadAdminNotification } from '../lib/email.js';

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
    /**
     * The chat as it actually happened, so the visitor's confirmation can include a copy of
     * it. Optional and bounded: it comes from the browser, so it is untrusted input like
     * everything else here, and the caps stop an oversized payload being posted at this
     * endpoint. Not persisted — it is used to compose the email and then discarded, which
     * keeps a verbatim conversation transcript out of the database.
     */
    transcript: z
      .array(
        z.object({
          from: z.enum(['bot', 'user']),
          text: z.string().max(2000),
        }),
      )
      .max(100)
      .optional(),
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
    // `transcript` is deliberately not a ChatLead column — it is only used to compose the
    // visitor's copy of the conversation, so it is split off before the row is written.
    const { transcript, ...leadFields } = req.body;
    const lead = await db.chatLead.create({ data: leadFields });

    // Fire-and-forget, matching the enquiry route: the lead is already saved, so a mail
    // failure must not turn a successful capture into an error for the visitor. Failures
    // are recorded to the operations log and surface in /admin/system-logs.
    Promise.all([
      // Only when they actually gave an email — the chatbot asks for one only if they chose
      // email as their preferred contact method.
      leadFields.email
        ? sendChatLeadConfirmation({ ...leadFields, transcript, leadId: lead.id })
        : Promise.resolve(),
      sendChatLeadAdminNotification({ ...leadFields, transcript, leadId: lead.id }),
    ]).catch((err) => {
      console.error('Failed to send chat lead emails:', err);
    });

    return res.status(201).json({ ok: true, id: lead.id });
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      return res.status(503).json({ error: 'Database not yet configured.' });
    }
    console.error('Failed to create chat lead:', err);
    return res.status(500).json({ error: 'Something went wrong — please try again.' });
  }
});
