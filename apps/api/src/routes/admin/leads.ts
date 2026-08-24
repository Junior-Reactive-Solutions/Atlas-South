import { Router } from 'express';
import { requireDb } from '../../lib/prisma.js';
import { authMiddleware } from '../../middleware/auth.js';

export const adminLeadsRouter = Router();

/** GET /api/admin/leads — list all chatbot-captured leads, newest first */
adminLeadsRouter.get('/leads', authMiddleware, async (_req, res) => {
  try {
    const db = requireDb();
    const leads = await db.chatLead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return res.json({ leads });
  } catch (err) {
    console.error('Failed to fetch chat leads:', err);
    return res.status(500).json({ error: 'Failed to fetch leads.' });
  }
});

/** DELETE /api/admin/leads/:id — remove a single lead */
adminLeadsRouter.delete('/leads/:id', authMiddleware, async (req, res) => {
  try {
    const db = requireDb();
    await db.chatLead.delete({ where: { id: req.params.id } });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete chat lead:', err);
    return res.status(500).json({ error: 'Failed to delete lead.' });
  }
});
