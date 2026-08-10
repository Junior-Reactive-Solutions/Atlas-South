import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/auth.js';
import { requireDb } from '../lib/prisma.js';

export interface AuthRequest extends Request {
  adminId?: string;
}

/**
 * Verifies the JWT Bearer token and, critically, checks that the token's embedded
 * tokenVersion matches the current value in the database. If an admin's password is
 * changed (or their account is compromised and an admin revokes access), tokenVersion
 * in the DB is incremented, immediately invalidating all previously issued JWTs for
 * that account without needing a token blacklist.
 */
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Verify tokenVersion against the database — this is the session-invalidation check.
  try {
    const db = requireDb();
    const admin = await db.adminUser.findUnique({
      where: { id: payload.adminId },
      select: { tokenVersion: true },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Admin account not found' });
    }

    if (admin.tokenVersion !== payload.tokenVersion) {
      // Token was issued before a password change or forced logout — reject it.
      return res.status(401).json({ error: 'Session invalidated — please log in again' });
    }
  } catch (err) {
    // If the DB is unavailable, reject rather than allow through (fail-closed).
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      return res.status(503).json({ error: 'Authentication service unavailable' });
    }
    console.error('Auth middleware DB error:', err);
    return res.status(500).json({ error: 'Authentication check failed' });
  }

  req.adminId = payload.adminId;
  next();
}
