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
// nothing to catch an env var that went missing on a future deploy. Fail loudly instead —
// a crash on boot is far preferable to an admin panel quietly signing every session with a
// secret that's sitting in this file in plain text.
if (env.NODE_ENV === 'production' && (!env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET)) {
  throw new Error(
    'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in production — refusing to start with a fallback secret.',
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
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] }) as JWTPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
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
