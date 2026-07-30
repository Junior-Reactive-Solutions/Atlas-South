import 'dotenv/config';
import { z } from 'zod';

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
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  ADMIN_SEED_EMAIL: z.string().email().optional(),
  CORS_ALLOWED_ORIGIN: z.string().default('http://localhost:9000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(600_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
