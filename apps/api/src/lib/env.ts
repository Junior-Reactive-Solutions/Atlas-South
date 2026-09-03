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

  // Mailgun HTTP API — replaced direct SMTP on 2026-09-03. Render's free web services
  // block ALL outbound traffic to SMTP ports (25/465/587) as of their September 2025
  // policy change (https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports),
  // which made the previous SMTP-to-the-domain's-own-mail-server design (see git history
  // on this file, and docs/build/17-DOMAIN-CUTOVER-RUNBOOK.md §1.2) fundamentally
  // undeliverable from this host — every send failed with a connection timeout no matter
  // what was fixed on the DNS/TLS side, because the platform itself was blocking the
  // connection before it could be made. HTTPS isn't blocked, so Mailgun's REST API (POST
  // over HTTPS, see lib/email.ts) works where a raw SMTP socket cannot.
  //
  // Sends from a subdomain (mg.<domain>), not the apex, so Mailgun's own SPF/DKIM records
  // stay fully isolated from the domain's existing mail server records (A/MX/DKIM/DMARC
  // on the apex, untouched) — no risk of the two configurations colliding. All optional
  // so the API still boots without them; email degrades to a logged warning.
  MAILGUN_API_KEY: z.string().optional(),
  /** The Mailgun sending domain, e.g. `mg.atlassouthes.com` — NOT the business domain. */
  MAILGUN_DOMAIN: z.string().optional(),
  /** Mailgun's US API host. Change to https://api.eu.mailgun.net if the domain is ever recreated in the EU region. */
  MAILGUN_BASE_URL: z.string().default('https://api.mailgun.net'),
  /** Full From header, e.g. `Atlas South <noreply@atlassouthes.com>`. Can stay on the business domain even though Mailgun sends via the mg. subdomain — DMARC's relaxed alignment (the default) accepts a DKIM signature from a subdomain of the From address's organizational domain. */
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
  // Turns on the one-time /api/admin/bootstrap route (routes/admin/bootstrap.ts).
  // Unset in the normal running state — only present on Render while actually being
  // used to create or reset an admin account, then removed. See that file for the full
  // set of safeguards this alone is not relied on for.
  ADMIN_BOOTSTRAP_TOKEN: z.string().min(20).optional(),
  // Comma-separated list of allowed origins — plural since the 2026-09-03 DNS cutover:
  // both the live domain (www.atlassouthes.com, the canonical URL the apex redirects to)
  // and the original Vercel URL need to keep working, the latter for admin access and
  // testing independent of DNS. See lib/cors.ts for how this is parsed.
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
