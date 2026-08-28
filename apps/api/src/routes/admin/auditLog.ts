import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';
import { requireDb } from '../../lib/prisma.js';

/**
 * GET /api/admin/audit-log — admin login and action events.
 * Docs: docs/build/08-ADMIN-PANEL-SPEC.md §6 "Security" view.
 * Returns the 200 most recent entries, newest first, per the 12-month rolling
 * retention window defined in docs/build/10-LEGAL-CONTENT-PLAN.md §2.
 */
const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();
    const logs = await db.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        event: true,
        ip: true,
        createdAt: true,
        // include email of the acting admin if available
        admin: { select: { email: true } },
      },
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

export default router;
