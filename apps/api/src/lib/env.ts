import { config as loadDotenv } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { z } from 'zod';

// npm workspace scripts run with cwd set to the workspace dir (apps/api), not the repo
// root — plain `dotenv/config` would only ever find apps/api/.env. The single .env this
// project documents (.env.example) lives at the monorepo root, so resolve it explicitly
// relative to this file rather than relying on cwd.
const __dirname = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(__dirname, '../../../../.env') });

/**
 * Validate process.env once, at boot, rather than trusting `process.env.X!` scattered
 * through the codebase — docs/build/07-SECURITY.md §2 ("every entry point... validated
 * before any handler logic runs" applies to configuration, not just requests).
 *
 * DATABASE_URL/JWT secrets/RESEND_API_KEY are optional at this schema level because
 * Sprint 1 ships before the Neon/Resend accounts exist (docs/build/12-HOSTING-DEPLOYMENT.md
 * is an infrastructure-provisioning task, not a code task) — routes that need them check
 * and fail loudly and specifically at the point of use instead of silently no-op-ing.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(9001),
  DATABASE_URL: z.string().url().optional(),
  JWT_ACCESS_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  RESEND_API_KEY: z.string().optional(),

  // SMTP — transactional mail goes through the domain's own mail server rather than a
  // third party. That is not a preference: this domain publishes SPF ending in `-all`
  // and DMARC `p=reject`, so mail sent from anywhere except this server is rejected
  // outright by the recipient. Sending from the server itself is already authorised by
  // the existing SPF/DKIM records — see docs/build/17-DOMAIN-CUTOVER-RUNBOOK.md §1.2.
  // All optional so the API still boots without them; email degrades to a logged warning.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  /** Full From header, e.g. `Atlas South <noreply@atlassouthes.com>`. */
  MAIL_FROM: z.string().optional(),
  /** Where enquiry notifications land. */
  ADMIN_EMAIL: z.string().email().optional(),
  /** Where job applications land, WITH the CV and cover letter attached. */
  CAREERS_EMAIL: z.string().email().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  ADMIN_SEED_EMAIL: z.string().email().optional(),
  CORS_ALLOWED_ORIGIN: z.string().default('http://localhost:9000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(600_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  // PayPal Subscriptions removed 2026-08-24 at the client's explicit request: no pricing
  // or payment methods are to be part of the site. See git history on this file and on
  // routes/paypal.ts / lib/paypal.ts (both deleted) for the removed integration.
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
