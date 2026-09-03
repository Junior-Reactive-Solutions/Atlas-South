import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';
import { verifyPassword, hashPassword } from '../../lib/auth.js';
import { requireDb } from '../../lib/prisma.js';

const router = Router();

router.use(authMiddleware);

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(12),
});

router.post('/change-password', async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);

    if (!req.adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = requireDb();
    const admin = await db.adminUser.findUnique({
      where: { id: req.adminId },
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, admin.passwordHash);

    if (!isValid) {
      await db.adminAuditLog.create({
        data: { event: 'password_change_failed_wrong_current', ip: req.ip ?? 'unknown', adminUserId: admin.id },
      });
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Prevent reuse of the current password
    const isSamePassword = await verifyPassword(newPassword, admin.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({ error: 'New password must differ from your current password' });
    }

    const newHash = await hashPassword(newPassword);

    // Increment tokenVersion — this immediately invalidates all existing sessions
    // (access tokens and refresh tokens) that were issued with the old tokenVersion.
    await db.adminUser.update({
      where: { id: req.adminId },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
        tokenVersion: { increment: 1 },
      },
    });

    await db.adminAuditLog.create({
      data: { event: 'password_changed', ip: req.ip ?? 'unknown', adminUserId: admin.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(400).json({ error: 'Failed to change password' });
  }
});

const ChangeEmailSchema = z.object({
  // The current password, not just a live session. Changing the login address changes
  // WHO can get back in, so it is treated as a credential change and re-authenticated
  // the same way a password change is — a borrowed unlocked laptop should not be enough.
  currentPassword: z.string().min(8),
  newEmail: z.string().trim().toLowerCase().email().max(254),
});

/**
 * Change the admin account's login email.
 *
 * Added 2026-09-03 for handover. There was previously no way to change it at all: the
 * address was fixed at whatever the account was seeded or bootstrapped with, so an account
 * created against a developer's personal address stayed that way permanently. That is a
 * real problem at the point a site is handed to its owner — the person who can log in is
 * defined by an address the business does not control.
 *
 * Deliberately does NOT bump tokenVersion. A password change invalidates every session
 * because the old credential may be compromised; changing which address you sign in with
 * says nothing about the current session's trustworthiness, and logging the user out of
 * the screen they just used would be surprising rather than safer.
 */
router.post('/change-email', async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newEmail } = ChangeEmailSchema.parse(req.body);

    if (!req.adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = requireDb();
    const admin = await db.adminUser.findUnique({ where: { id: req.adminId } });

    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    const isValid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!isValid) {
      await db.adminAuditLog.create({
        data: { event: 'email_change_failed_wrong_password', ip: req.ip ?? 'unknown', adminUserId: admin.id },
      });
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    if (newEmail === admin.email) {
      return res.status(400).json({ error: 'That is already your login email' });
    }

    // The email is unique across admin accounts — check explicitly so this returns a clear
    // message rather than surfacing a raw database constraint error.
    const taken = await db.adminUser.findUnique({ where: { email: newEmail } });
    if (taken) {
      return res.status(409).json({ error: 'Another admin account already uses that email' });
    }

    await db.adminUser.update({ where: { id: req.adminId }, data: { email: newEmail } });

    // The OLD address is recorded, not the new one. If this change was made by someone who
    // should not have had access, the audit trail needs to show what it was changed away
    // from — the new value is visible on the account itself.
    await db.adminAuditLog.create({
      data: { event: `email_changed_from:${admin.email}`, ip: req.ip ?? 'unknown', adminUserId: admin.id },
    });

    res.json({ success: true, email: newEmail });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.flatten() });
    }
    console.error('Error changing email:', error);
    res.status(400).json({ error: 'Failed to change email' });
  }
});

export default router;
