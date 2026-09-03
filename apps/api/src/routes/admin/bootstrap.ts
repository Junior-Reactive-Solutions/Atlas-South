import { Router } from 'express';
import { z } from 'zod';
import { timingSafeEqual } from 'crypto';
import rateLimit from 'express-rate-limit';
import { requireDb } from '../../lib/prisma.js';
import { hashPassword } from '../../lib/auth.js';
import { env } from '../../lib/env.js';
import { logSystemEvent } from '../../lib/systemLog.js';

/**
 * ONE-TIME admin account bootstrap — exists ONLY because the current Render plan has no
 * Shell access, so `npm run seed:admin` (its normal path) can't be run. Every safeguard
 * below is there because this route, unlike anything else public in the API, can hand out
 * admin access if it's ever misused.
 *
 * WHO TYPES THE PASSWORD: the human operating this route, from their own terminal — never
 * this codebase, never an agent, never a log. The server never sees a plaintext password
 * except for the single request that sets it, and never echoes it back.
 *
 * Layered defences, each independently sufficient to block misuse:
 *   1. Off by default. Requires ADMIN_BOOTSTRAP_TOKEN to be set on Render — an env var only
 *      the account owner controls. Unset (the normal state), this route always 404s, so
 *      merging it changes nothing about what's live until someone deliberately turns it on.
 *   2. Constant-time token comparison — a naive `===` leaks timing information an attacker
 *      could use to guess the token character by character.
 *   3. Self-disabling after one successful use (checked against SystemEvent, not memory,
 *      so it survives a redeploy): even if the token is never removed from Render, the
 *      route stops functioning the moment it's used once.
 *   4. Hard rate limit (3 attempts/hour, shared across all callers) — deliberately far
 *      stricter than the login endpoint, since this bypasses login entirely.
 *   5. Every attempt is written to the operations log, successful or not, so there's a
 *      record independent of whether the token leaked.
 *
 * REMOVE ADMIN_BOOTSTRAP_TOKEN FROM RENDER as soon as this has been used once. Safeguard 3
 * means the route is already inert at that point, but deleting the token removes the
 * possibility entirely rather than relying on a database check.
 */

const bootstrapLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts.' },
});

const BootstrapSchema = z.object({
  email: z.string().trim().email(),
  // 16, not the login form's lower bar — this account is being created outside the normal
  // flow, so it should not also be a weak password. mustChangePassword still forces a
  // change on first real login regardless.
  password: z.string().min(16).max(200),
});

export const adminBootstrapRouter = Router();

function tokenMatches(provided: string | undefined): boolean {
  if (!env.ADMIN_BOOTSTRAP_TOKEN || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(env.ADMIN_BOOTSTRAP_TOKEN);
  // timingSafeEqual throws on mismatched lengths rather than returning false — a wrong
  // length is still a mismatch, just one that has to be handled explicitly.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

adminBootstrapRouter.post('/admin/bootstrap', bootstrapLimiter, async (req, res) => {
  // Route is invisible (404, not 401/403) unless explicitly turned on — see safeguard 1.
  // A 401 would confirm to a prober that this route exists at all; a 404 gives nothing away.
  if (!env.ADMIN_BOOTSTRAP_TOKEN) {
    return res.status(404).json({ error: 'Not found' });
  }

  const providedToken = req.header('x-bootstrap-token');
  if (!tokenMatches(providedToken)) {
    logSystemEvent({
      level: 'warning',
      source: 'api',
      event: 'admin_bootstrap_bad_token',
      message: 'Bootstrap attempted with an invalid or missing token.',
      path: '/api/admin/bootstrap',
    });
    return res.status(404).json({ error: 'Not found' });
  }

  // Validated before anything touches the database: cheap, free checks go first so a
  // malformed request never costs a DB round-trip, and so this still returns a useful 400
  // rather than a confusing 500 if the database happens to be unreachable at that instant.
  const parsed = BootstrapSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  try {
    const db = requireDb();

    // Self-disable: refuse if this route has ever succeeded before, regardless of whether
    // the token was removed afterward. Checked in the database, not in memory, so it holds
    // across a redeploy or a restart.
    const alreadyUsed = await db.systemEvent.findFirst({
      where: { event: 'admin_bootstrap_succeeded' },
    });
    if (alreadyUsed) {
      logSystemEvent({
        level: 'warning',
        source: 'api',
        event: 'admin_bootstrap_reuse_blocked',
        message: 'Bootstrap attempted again after already succeeding once.',
        path: '/api/admin/bootstrap',
      });
      return res.status(410).json({
        error: 'This bootstrap route has already been used once and is now permanently disabled. Remove ADMIN_BOOTSTRAP_TOKEN from Render.',
      });
    }

    const passwordHash = await hashPassword(password);

    // Upsert rather than create-only: covers both "no admin account exists at all" and
    // "the seeded account's temp password was lost and needs resetting" (the actual
    // situation this was built for, 2026-09-02) with one code path.
    await db.adminUser.upsert({
      where: { email },
      create: { email, passwordHash, mustChangePassword: true },
      update: {
        passwordHash,
        mustChangePassword: true,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    logSystemEvent({
      level: 'warning', // warning, not info: a privileged account was just created/reset
      source: 'api',
      event: 'admin_bootstrap_succeeded',
      message: `Admin account bootstrapped for ${email}. This route is now permanently disabled.`,
      path: '/api/admin/bootstrap',
    });

    return res.status(200).json({
      ok: true,
      message: 'Admin account ready. Log in at /admin/login — you will be required to change this password immediately. Now remove ADMIN_BOOTSTRAP_TOKEN from Render.',
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      return res.status(503).json({ error: 'Database not yet configured for this environment.' });
    }
    console.error('Bootstrap failed:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
});
