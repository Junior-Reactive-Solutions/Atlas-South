import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';
import { requireDb } from '../../lib/prisma.js';

/**
 * Admin read surfaces for the two logs added alongside the cookie-consent system:
 *
 *   GET /api/admin/consent-log   — the consent audit trail (UK GDPR Art. 7(1) evidence)
 *   GET /api/admin/system-events — API and client errors, plus operational events
 *
 * Both are authenticated. The consent log in particular must not be public: individually
 * the rows are non-identifying, but the whole set is a record of how many people refused,
 * which is nobody's business but the operator's.
 */
const router = Router();
router.use(authMiddleware);

/** Matches the AdminAuditLog route's cap — enough to review, small enough to render. */
const PAGE_SIZE = 200;

router.get('/consent-log', async (_req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();

    const [entries, total, granted] = await Promise.all([
      db.consentLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: PAGE_SIZE,
        select: { id: true, consentId: true, version: true, choices: true, decidedAt: true, createdAt: true },
      }),
      db.consentLog.count(),
      // Counted server-side rather than derived from the 200-row page, so the summary
      // describes the whole log rather than just the most recent slice.
      db.consentLog.count({ where: { choices: { path: ['analytics'], equals: true } } }),
    ]);

    res.json({
      entries,
      summary: { total, analyticsGranted: granted, analyticsRefused: total - granted },
    });
  } catch (error) {
    console.error('Failed to load consent log:', error);
    res.status(500).json({ error: 'Failed to load consent log' });
  }
});

router.get('/system-events', async (req: AuthRequest, res: Response) => {
  try {
    const db = requireDb();

    // Optional level filter, validated against the enum rather than passed through — this
    // value reaches a database query.
    const rawLevel = typeof req.query.level === 'string' ? req.query.level : undefined;
    const level = rawLevel && ['info', 'warning', 'error'].includes(rawLevel) ? rawLevel : undefined;

    const [entries, errors, warnings] = await Promise.all([
      db.systemEvent.findMany({
        where: level ? { level: level as 'info' | 'warning' | 'error' } : undefined,
        orderBy: { createdAt: 'desc' },
        take: PAGE_SIZE,
        select: {
          id: true,
          level: true,
          source: true,
          event: true,
          message: true,
          path: true,
          context: true,
          createdAt: true,
        },
      }),
      db.systemEvent.count({ where: { level: 'error' } }),
      db.systemEvent.count({ where: { level: 'warning' } }),
    ]);

    res.json({ entries, summary: { errors, warnings } });
  } catch (error) {
    console.error('Failed to load system events:', error);
    res.status(500).json({ error: 'Failed to load system events' });
  }
});

export { router as adminLogsRouter };
