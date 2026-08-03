import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // Get stats for this week and month
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const enquiriesThisWeek = await prisma.enquiry.count({
      where: { createdAt: { gte: weekAgo } },
    });

    const enquiriesThisMonth = await prisma.enquiry.count({
      where: { createdAt: { gte: monthAgo } },
    });

    // Calculate conversion rate (won / total)
    const totalEnquiries = await prisma.enquiry.count();
    const wonEnquiries = await prisma.enquiry.count({
      where: { status: 'won' },
    });
    const conversionRate = totalEnquiries > 0 ? (wonEnquiries / totalEnquiries) * 100 : 0;

    // Get top pages by views
    const topPages = await prisma.pageView.groupBy({
      by: ['path'],
      _count: true,
      orderBy: { _count: { path: 'desc' } },
      take: 5,
    });

    res.json({
      enquiriesThisWeek,
      enquiriesThisMonth,
      conversionRate,
      topPages: topPages.map((p) => ({
        path: p.path,
        views: p._count,
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
