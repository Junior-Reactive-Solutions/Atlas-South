import jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { env } from './env.js';

// Validated at boot by env.ts (min 32 chars) when present. The dev-only fallback strings
// below let the server start locally before secrets are provisioned — every admin session
// signed with a fallback is invalidated the moment a real secret is set (different key ->
// verify fails), so a weak secret can never silently carry over once one IS set. What was
// missing (a security-audit finding, 2026-08-27) was any check that one WAS set in
// production: previously this fell back to the same hardcoded dev string silently, with
// nothing to catch an env var that went missing on a future deploy.
//
// The first version of this fix threw here, at module load — and that shipped a real
// production incident: Render's rolling deploy briefly raced ahead of env var propagation
// on its first boot attempt, the throw killed the *entire* process (not just auth — every
// public route, health checks, everything) before Express ever started listening, and
// Render's deploy health check correctly rolled the release back. The fix for that isn't
// "don't check" — it's checking at the one place a missing secret actually matters
// (generateTokens, the only function that would ever sign a token with the weak
// fallback) instead of at import time, so a transient env-propagation hiccup degrades to
// "logins loudly fail for a moment" rather than "the whole API is down."
const usingFallbackSecrets = !env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET;
if (env.NODE_ENV === 'production' && usingFallbackSecrets) {
  // eslint-disable-next-line no-console
  console.error(
    'JWT_ACCESS_SECRET/JWT_REFRESH_SECRET missing in production — falling back to the ' +
      'hardcoded dev secret. Login will be refused until this is fixed. Check the env var ' +
      'is actually set on this service — this can also be a one-off boot-order race right ' +
      'after a deploy; if it persists past the first request, it is not that.',
  );
}

const JWT_SECRET = env.JWT_ACCESS_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';

// Every token this app issues is signed with jwt.sign(payload, secretString), which only
// ever produces HS256 — there is no RSA/EC keypair anywhere in this codebase for an
// algorithm-confusion attack to exploit today. Pinning it explicitly here is still worth
// doing (a security-audit hardening recommendation): it costs nothing, and it means this
// stays true even if a signing scheme ever changes later, rather than relying on nobody
// ever adding a second, more permissive verify call.
const JWT_ALGORITHM = 'HS256' as const;

export interface JWTPayload {
  adminId: string;
  /** tokenVersion is embedded in the JWT and checked against AdminUser.tokenVersion on
   * every authenticated request. Incrementing the DB value (e.g. on password change)
   * immediately invalidates all previously issued tokens for that account. */
  tokenVersion: number;
  iat: number;
  exp: number;
}

export function generateTokens(adminId: string, tokenVersion: number) {
  // The actual enforcement point: refuse to mint a session under a known, publicly-visible
  // fallback secret in production, rather than crashing the process (see the note above
  // JWT_SECRET) or — the original bug — silently succeeding. The login route's existing
  // try/catch turns this into a generic error response; it doesn't take any other route
  // on the API down with it.
  if (env.NODE_ENV === 'production' && usingFallbackSecrets) {
    throw new Error('Refusing to issue an admin session: JWT secret is not configured in production.');
  }

  const accessToken = jwt.sign({ adminId, tokenVersion }, JWT_SECRET, {
    expiresIn: '15m',
    algorithm: JWT_ALGORITHM,
  });
  const refreshToken = jwt.sign({ adminId, tokenVersion }, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    algorithm: JWT_ALGORITHM,
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): JWTPayload | null {
  // Once generateTokens refuses to sign anything under a fallback secret in production
  // (above), no legitimate token can ever exist that would need this secret to verify —
  // so a token that DOES verify against it here can only be one forged with the publicly-
  // known fallback string. Reject outright rather than accept it.
  if (env.NODE_ENV === 'production' && usingFallbackSecrets) return null;
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] }) as JWTPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  if (env.NODE_ENV === 'production' && usingFallbackSecrets) return null;
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: [JWT_ALGORITHM] }) as JWTPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 2 ** 16,
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}
