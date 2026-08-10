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

export default router;
