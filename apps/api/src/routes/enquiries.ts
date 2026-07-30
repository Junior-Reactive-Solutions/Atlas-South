import { Router } from 'express';
import { CreateEnquirySchema } from '@atlas-south/shared';
import { validateBody } from '../middleware/validate.js';
import { enquiryLimiter } from '../middleware/rateLimiters.js';
import { requireDb } from '../lib/prisma.js';

/**
 * Every quote/contact form on the site posts here — docs/build/08-ADMIN-PANEL-SPEC.md §5.
 * Rate-limited (5/10min/IP) and honeypot-checked per docs/build/07-SECURITY.md §3.
 */
export const enquiriesRouter = Router();

enquiriesRouter.post('/enquiries', enquiryLimiter, validateBody(CreateEnquirySchema), async (req, res) => {
  // agreedToPrivacyPolicy is intentionally destructured out and discarded: zod already
  // validated it's `true` (CreateEnquirySchema), and the Enquiry table has no matching
  // column — it must not reach Prisma's `data`, but there's nothing further to do with
  // the value itself.
  const { companyWebsite, agreedToPrivacyPolicy: _agreedToPrivacyPolicy, ...data } = req.body;

  // Honeypot: a real visitor never fills this hidden field in.
  if (companyWebsite) {
    // Respond as if successful so a bot doesn't learn its submission was rejected.
    return res.status(201).json({ ok: true });
  }

  try {
    const db = requireDb();
    const enquiry = await db.enquiry.create({ data });
    // TODO (docs/build/12-HOSTING-DEPLOYMENT.md §6): fire the Resend confirmation +
    // admin-notification emails here once RESEND_API_KEY is configured.
    return res.status(201).json({ ok: true, id: enquiry.id });
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      return res.status(503).json({ error: 'Database not yet configured for this environment.' });
    }
    // eslint-disable-next-line no-console
    console.error('Failed to create enquiry:', err);
    return res.status(500).json({ error: 'Something went wrong — please try again.' });
  }
});
