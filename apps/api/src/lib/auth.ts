import jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { env } from './env.js';

// Validated at boot by env.ts (min 32 chars). Dev-only fallbacks let the server start
// before secrets are provisioned, but every admin session signed with a fallback secret
// is invalidated the moment a real secret is set (different key -> verify fails), so
// this can never silently carry a weak secret into production.
const JWT_SECRET = env.JWT_ACCESS_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';

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
  const accessToken = jwt.sign({ adminId, tokenVersion }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ adminId, tokenVersion }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
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
