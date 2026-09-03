import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { requireDb } from '../lib/prisma.js';

/**
 * Public insight-article listing for /insights.
 *
 * Mirrors routes/caseStudies.ts exactly, for the same reason it exists: /api/content/:slug
 * serves one page by slug, which covers an article's detail view, but a library page needs
 * "every published article" and nothing exposed that publicly.
 *
 * Published only, never drafts. An article goes out under the company's name and is read
 * as its professional position, so draft is where one sits until somebody has checked its
 * claims — serving drafts here would route around that check entirely.
 */
export const articlesRouter = Router();

articlesRouter.get('/articles', async (_req, res) => {
  try {
    const db = requireDb();

    const pages = await db.contentPage.findMany({
      // Prisma.DbNull, not plain null: a Json column distinguishes SQL NULL from the JSON
      // value null, so a bare null here is a type error rather than the filter you meant.
      where: { type: 'article', status: 'published', publishedData: { not: Prisma.DbNull } },
      select: { slug: true, path: true, publishedData: true, publishedAt: true },
      // Newest first. publishedAt is the DB's own timestamp rather than a date typed into
      // the article body, so re-ordering can't be broken by a typo in an authored field.
      orderBy: { publishedAt: 'desc' },
    });

    res.set('Cache-Control', 'public, max-age=300');
    res.json({ articles: pages });
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      // Same failure shape as the content endpoint. The listing page falls back to the
      // bundled (currently empty) set, so a missing database renders an honest empty
      // state rather than an error.
      return res.status(503).json({ error: 'Content service unavailable' });
    }
    console.error('Failed to fetch articles:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});
