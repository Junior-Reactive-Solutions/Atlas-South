import { Router } from 'express';
import { requireDb } from '../lib/prisma.js';

/**
 * Public, unauthenticated content endpoint — docs/build/08-ADMIN-PANEL-SPEC.md content
 * management scope. Returns publishedData ONLY, never draftData — an in-progress admin
 * edit must never be visible to a site visitor before it's explicitly published.
 */
export const contentRouter = Router();

contentRouter.get('/content/:slug', async (req, res) => {
  try {
    const db = requireDb();
    const page = await db.contentPage.findUnique({
      where: { slug: req.params.slug },
      select: {
        slug: true,
        type: true,
        path: true,
        publishedData: true,
        publishedAt: true,
      },
    });

    if (!page || !page.publishedData) {
      return res.status(404).json({ error: 'Page not found or not yet published' });
    }

    // Cache content responses for 5 minutes (content rarely changes mid-session)
    res.set('Cache-Control', 'public, max-age=300');
    res.json(page);
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      return res.status(503).json({ error: 'Content service unavailable' });
    }
    console.error('Failed to fetch content:', err);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});
