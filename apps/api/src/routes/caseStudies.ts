import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { requireDb } from '../lib/prisma.js';

/**
 * Public case-study listing.
 *
 * The existing /api/content/:slug endpoint serves a single page by slug, which covers the
 * detail view — but a listing needs "every published case study", and nothing exposed that
 * publicly. This is that, and only that.
 *
 * Published only, never drafts. That distinction carries real weight for this page type:
 * a case study makes factual claims about a named client, so draft is where one sits until
 * somebody has verified it. Serving drafts here would route around that check entirely.
 */
export const caseStudiesRouter = Router();

caseStudiesRouter.get('/case-studies', async (_req, res) => {
  try {
    const db = requireDb();

    const pages = await db.contentPage.findMany({
      // Prisma.DbNull, not plain null: a Json column distinguishes SQL NULL from the JSON
      // value null, so a bare null here is a type error rather than the filter you meant.
      where: { type: 'caseStudy', status: 'published', publishedData: { not: Prisma.DbNull } },
      select: { slug: true, path: true, publishedData: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    });

    res.set('Cache-Control', 'public, max-age=300');
    res.json({ caseStudies: pages });
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      // Same failure shape the content endpoint uses. The listing page falls back to the
      // bundled (currently empty) set, so a missing database renders an honest empty state
      // rather than an error.
      return res.status(503).json({ error: 'Content service unavailable' });
    }
    console.error('Failed to fetch case studies:', err);
    res.status(500).json({ error: 'Failed to fetch case studies' });
  }
});
