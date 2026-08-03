import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { verifyPassword, hashPassword, generateTokens, verifyRefreshToken } from '../../lib/auth.js';

const router = Router();
const prisma = new PrismaClient();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour
const MAX_LOCKOUT_ATTEMPTS = 10;

// In-memory rate limiting (in production, use Redis)
const attemptMap = new Map<string, { count: number; timestamp: number }>();

function isRateLimited(ip: string): boolean {
  const attempt = attemptMap.get(ip);
  if (!attempt) return false;

  const now = Date.now();
  if (now - attempt.timestamp > RATE_LIMIT_WINDOW) {
    attemptMap.delete(ip);
    return false;
  }

  return attempt.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const attempt = attemptMap.get(ip);

  if (!attempt || now - attempt.timestamp > RATE_LIMIT_WINDOW) {
    attemptMap.set(ip, { count: 1, timestamp: now });
  } else {
    attempt.count++;
  }
}

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || 'unknown';

    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    }

    const { email, password } = LoginSchema.parse(req.body);

    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin) {
      recordAttempt(ip);
      await prisma.adminAuditLog.create({
        data: { event: 'login_failed', ip, adminUserId: undefined },
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.lockedUntil && new Date() < admin.lockedUntil) {
      await prisma.adminAuditLog.create({
        data: { event: 'login_failed_account_locked', ip, adminUserId: admin.id },
      });
      return res.status(401).json({ error: 'Account is locked. Try again later.' });
    }

    const isValid = await verifyPassword(password, admin.passwordHash);

    if (!isValid) {
      recordAttempt(ip);
      const failedAttempts = admin.failedAttempts + 1;

      // Lock account after 10 failed attempts in an hour
      let lockedUntil = admin.lockedUntil;
      if (failedAttempts >= MAX_LOCKOUT_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
      }

      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { failedAttempts, lockedUntil },
      });

      await prisma.adminAuditLog.create({
        data: { event: 'login_failed', ip, adminUserId: admin.id },
      });

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts on successful login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    const { accessToken, refreshToken } = generateTokens(admin.id);

    await prisma.adminAuditLog.create({
      data: { event: 'login_success', ip, adminUserId: admin.id },
    });

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken,
      mustChangePassword: admin.mustChangePassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Invalid request' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ success: true });
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.adminId },
    });

    if (!admin) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Admin not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(admin.id);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(400).json({ error: 'Invalid request' });
  }
});

export default router;
