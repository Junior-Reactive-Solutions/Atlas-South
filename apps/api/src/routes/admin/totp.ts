import { Router, Response } from 'express';
import { z } from 'zod';
import { generateSecret, verify, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';
import { verifyPassword } from '../../lib/auth.js';
import { requireDb } from '../../lib/prisma.js';

/**
 * TOTP 2FA routes — docs/build/08-ADMIN-PANEL-SPEC.md §2.
 * Uses otplib (RFC 6238 TOTP, compatible with Google Authenticator, Authy, 1Password).
 *
 * Flow:
 *  1. POST /setup   → generates a new secret + QR code URI (not saved yet)
 *  2. POST /verify  → confirms the user scanned it correctly; saves to DB
 *  3. POST /disable → removes the secret (requires password + valid TOTP code)
 */

const router = Router();
router.use(authMiddleware);

const APP_NAME = 'Atlas South Admin';

// ── Setup ──────────────────────────────────────────────────────────────────────
// Generates a fresh TOTP secret and returns the QR code data URI.
// Does NOT save to the DB — the user must confirm they can produce a valid code
// via POST /verify first, otherwise they can lock themselves out.
router.post('/setup', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.adminId) return res.status(401).json({ error: 'Unauthorized' });

    const db = requireDb();
    const admin = await db.adminUser.findUnique({
      where: { id: req.adminId },
      select: { email: true, totpSecret: true },
    });

    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    if (admin.totpSecret) {
      return res.status(400).json({ error: '2FA is already enabled. Disable it first.' });
    }

    const secret = generateSecret();
    const otpauthUrl = generateURI({ label: admin.email, issuer: APP_NAME, secret });
    const qrCodeDataUri = await QRCode.toDataURL(otpauthUrl);

    // Return secret in plain text too — some users prefer typing it manually
    // into their authenticator app rather than scanning the QR.
    res.json({ secret, qrCodeDataUri });
  } catch (err) {
    console.error('TOTP setup error:', err);
    res.status(500).json({ error: 'Failed to generate TOTP setup' });
  }
});

// ── Verify & Enable ────────────────────────────────────────────────────────────
// Confirms the user scanned the QR code successfully by checking a live TOTP code,
// then saves the secret to the DB to enable 2FA.
const VerifySchema = z.object({
  secret: z.string().min(16),
  totpCode: z.string().length(6).regex(/^\d+$/),
});

router.post('/verify', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.adminId) return res.status(401).json({ error: 'Unauthorized' });

    const { secret, totpCode } = VerifySchema.parse(req.body);

    // Validate the code against the secret BEFORE saving it
    const result = await verify({ token: totpCode, secret });
    const isValid = result.valid;
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid code — check your authenticator app and try again.' });
    }

    const db = requireDb();
    await db.adminUser.update({
      where: { id: req.adminId },
      data: { totpSecret: secret },
    });

    await db.adminAuditLog.create({
      data: { event: 'totp_enabled', ip: req.ip ?? 'unknown', adminUserId: req.adminId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('TOTP verify error:', err);
    res.status(400).json({ error: 'Failed to enable 2FA' });
  }
});

// ── Disable ────────────────────────────────────────────────────────────────────
// Disables 2FA. Requires the current password AND a valid TOTP code so that
// neither a stolen session nor a stolen password alone can disable 2FA.
const DisableSchema = z.object({
  currentPassword: z.string().min(1),
  totpCode: z.string().length(6).regex(/^\d+$/),
});

router.post('/disable', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.adminId) return res.status(401).json({ error: 'Unauthorized' });

    const { currentPassword, totpCode } = DisableSchema.parse(req.body);

    const db = requireDb();
    const admin = await db.adminUser.findUnique({ where: { id: req.adminId } });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    if (!admin.totpSecret) {
      return res.status(400).json({ error: '2FA is not currently enabled.' });
    }

    const passwordValid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const verifyResult = await verify({ token: totpCode, secret: admin.totpSecret });
    const codeValid = verifyResult.valid;
    if (!codeValid) {
      return res.status(400).json({ error: 'Invalid authenticator code' });
    }

    await db.adminUser.update({
      where: { id: req.adminId },
      data: { totpSecret: null },
    });

    await db.adminAuditLog.create({
      data: { event: 'totp_disabled', ip: req.ip ?? 'unknown', adminUserId: req.adminId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('TOTP disable error:', err);
    res.status(400).json({ error: 'Failed to disable 2FA' });
  }
});

// ── Status ─────────────────────────────────────────────────────────────────────
// Returns whether 2FA is currently enabled — used by the Settings page on load.
router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.adminId) return res.status(401).json({ error: 'Unauthorized' });

    const db = requireDb();
    const admin = await db.adminUser.findUnique({
      where: { id: req.adminId },
      select: { totpSecret: true },
    });

    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    res.json({ enabled: !!admin.totpSecret });
  } catch (err) {
    console.error('TOTP status error:', err);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
});

export default router;
