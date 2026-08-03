import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';
import { verifyPassword, hashPassword } from '../../lib/auth.js';

const router = Router();
const prisma = new PrismaClient();

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

    const admin = await prisma.adminUser.findUnique({
      where: { id: req.adminId },
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, admin.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and save new password
    const newHash = await hashPassword(newPassword);

    await prisma.adminUser.update({
      where: { id: req.adminId },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(400).json({ error: 'Failed to change password' });
  }
});

export default router;
