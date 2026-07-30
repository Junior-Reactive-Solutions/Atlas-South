import { z } from 'zod';
import { ALL_SERVICES } from '../constants/navigation.js';

/**
 * Every quote/contact form submission across the site validates against this schema
 * before it reaches any handler — see docs/build/07-SECURITY.md §2 ("counting for all
 * manner of website URL passes"). Shared between apps/web (client-side validation,
 * same rules the server enforces) and apps/api (server-side, authoritative).
 */

const SERVICE_IDS = ALL_SERVICES.map((s) => s.id) as [string, ...string[]];

export const PropertyType = z.enum(['residential', 'commercial', 'industrial', 'other']);
export type PropertyType = z.infer<typeof PropertyType>;

export const Urgency = z.enum(['emergency', 'within-a-week', 'planning-ahead']);
export type Urgency = z.infer<typeof Urgency>;

export const EnquiryStatus = z.enum(['new', 'contacted', 'quoted', 'won', 'lost']);
export type EnquiryStatus = z.infer<typeof EnquiryStatus>;

export const CreateEnquirySchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(20)
    .regex(/^[0-9+()\s-]+$/, 'Phone number contains invalid characters'),
  serviceId: z.enum(SERVICE_IDS).optional(),
  propertyType: PropertyType.optional(),
  urgency: Urgency.optional(),
  message: z.string().trim().min(1).max(2000),
  sourcePage: z.string().trim().max(200),
  /**
   * Honeypot field — docs/build/07-SECURITY.md §3. Deliberately NOT constrained to an
   * empty string here: rejecting a non-empty value at the validation layer would return
   * a 400 naming this exact field, which hands a bot the answer ("this is the honeypot")
   * instead of silently absorbing the submission. The check happens in the route
   * handler (apps/api/src/routes/enquiries.ts), which accepts-but-drops instead.
   */
  companyWebsite: z.string().max(200).optional(),
  /** Consent checkbox — required, not assumed. */
  agreedToPrivacyPolicy: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Privacy Policy to submit this form' }),
  }),
});
export type CreateEnquiryInput = z.infer<typeof CreateEnquirySchema>;
