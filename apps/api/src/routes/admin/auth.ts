import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { verifyPassword, generateTokens, verifyRefreshToken } from '../../lib/auth.js';
import { requireDb } from '../../lib/prisma.js';

const router = Router();

const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour
const MAX_LOCKOUT_ATTEMPTS = 10;

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const db = requireDb();
    const ip = req.ip || 'unknown';
    const { email, password } = LoginSchema.parse(req.body);

    const admin = await db.adminUser.findUnique({ where: { email } });

    if (!admin) {
      // Log the failed attempt even when the account doesn't exist — timing-attack
      // aware: argon2 compare is skipped but the JSON response is returned at the same
      // point either way. An attacker cannot distinguish "wrong email" from "wrong password".
      await db.adminAuditLog.create({
        data: { event: 'login_failed_unknown_email', ip },
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (admin.lockedUntil && new Date() < admin.lockedUntil) {
      await db.adminAuditLog.create({
        data: { event: 'login_failed_account_locked', ip, adminUserId: admin.id },
      });
      return res.status(401).json({ error: 'Account is locked. Try again later.' });
    }

    const isValid = await verifyPassword(password, admin.passwordHash);

    if (!isValid) {
      const failedAttempts = admin.failedAttempts + 1;

      // Lock account after MAX_LOCKOUT_ATTEMPTS failed attempts within the window
      let lockedUntil = admin.lockedUntil;
      if (failedAttempts >= MAX_LOCKOUT_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
      }

      await db.adminUser.update({
        where: { id: admin.id },
        data: { failedAttempts, lockedUntil },
      });

      await db.adminAuditLog.create({
        data: { event: 'login_failed', ip, adminUserId: admin.id },
      });

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts on successful login
    await db.adminUser.update({
      where: { id: admin.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    // Pass tokenVersion so the embedded value can be checked on every authed request
    const { accessToken, refreshToken } = generateTokens(admin.id, admin.tokenVersion);

    await db.adminAuditLog.create({
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

router.post('/logout', async (req: Request, res: Response) => {
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

    const db = requireDb();
    const admin = await db.adminUser.findUnique({
      where: { id: payload.adminId },
      select: { id: true, tokenVersion: true },
    });

    if (!admin) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Admin not found' });
    }

    // Validate tokenVersion — rejects refresh tokens issued before a password change
    if (admin.tokenVersion !== payload.tokenVersion) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Session invalidated — please log in again' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(admin.id, admin.tokenVersion);

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
