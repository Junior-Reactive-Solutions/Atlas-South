import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';
import { TOGGLEABLE_NAV_IDS, isToggleableNavId } from '../../lib/navIds.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

/**
 * Admin page-visibility management — lets the client temporarily take a page off the
 * public site without deleting its content.
 *
 * Toggleable ids are constrained to the shared navigation constants (see lib/navIds.ts).
 * Company, contact and legal pages are intentionally absent from that allowlist and so
 * cannot be hidden through this API at all.
 */

// List every toggleable page with its current visibility. Absence of a row means visible,
// so the response is built from the allowlist rather than from the table — otherwise the
// UI would only ever show pages that had already been toggled once.
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.pageVisibility.findMany({
      select: { navId: true, visible: true, updatedAt: true },
    });
    const byId = new Map(rows.map((row) => [row.navId, row]));

    const items = [...TOGGLEABLE_NAV_IDS].map((navId) => ({
      navId,
      visible: byId.get(navId)?.visible ?? true,
      updatedAt: byId.get(navId)?.updatedAt ?? null,
    }));

    res.json(items);
  } catch (error) {
    console.error('Error fetching page visibility:', error);
    res.status(500).json({ error: 'Failed to fetch page visibility' });
  }
});

const UpdateVisibilitySchema = z.object({
  visible: z.boolean(),
});

router.patch('/:navId', async (req: AuthRequest, res: Response) => {
  try {
    const { navId } = req.params;

    // Allowlist check before any database write. Rejecting unknown ids keeps an
    // authenticated caller from creating arbitrary rows and keeps legal/company pages
    // un-hideable even if a request is crafted by hand rather than through the UI.
    if (!isToggleableNavId(navId)) {
      return res.status(400).json({ error: 'Unknown or non-toggleable page' });
    }

    const { visible } = UpdateVisibilitySchema.parse(req.body);

    await prisma.pageVisibility.upsert({
      where: { navId },
      create: { navId, visible },
      update: { visible },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: req.adminId ?? null,
        event: `page_visibility_${visible ? 'shown' : 'hidden'}:${navId}`,
        ip: req.ip,
      },
    });

    res.json({ navId, visible });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.flatten() });
    }
    console.error('Error updating page visibility:', error);
    res.status(500).json({ error: 'Failed to update page visibility' });
  }
});

export default router;
