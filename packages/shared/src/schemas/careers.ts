import { z } from 'zod';

/**
 * Job application submissions (POST /api/careers/apply) — a security-audit finding
 * (2026-08-27): this was the one public write endpoint on the site with no schema
 * validation at all, checking only that fullName/email/phone were non-empty. Brought in
 * line with the same rigor CreateEnquirySchema (enquiry.ts) already applies — same
 * length bounds, same phone pattern, a real email() check.
 *
 * multer parses every multipart text field as a string, so no coercion is needed here —
 * this validates req.body the same way validateBody validates a JSON body anywhere else.
 */
export const JobApplicationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(20)
    .regex(/^[0-9+()\s-]+$/, 'Phone number contains invalid characters'),
  roleTitle: z.string().trim().max(200).optional(),
  coverLetter: z.string().trim().max(5000).optional(),
});
export type JobApplicationInput = z.infer<typeof JobApplicationSchema>;
