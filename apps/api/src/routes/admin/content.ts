import { Router, Response } from 'express';
import { PrismaClient, ContentPageType, type Prisma } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// List all content pages — for the admin content list view.
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const typeParam = req.query.type as string | undefined;
    const type =
      typeParam && (Object.values(ContentPageType) as string[]).includes(typeParam)
        ? (typeParam as ContentPageType)
        : undefined;

    const pages = await prisma.contentPage.findMany({
      where: type ? { type } : undefined,
      select: {
        id: true,
        slug: true,
        type: true,
        path: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        // draftData/publishedData deliberately excluded from the list view —
        // this can be a few KB of JSON per page and the list doesn't need it.
      },
      orderBy: [{ type: 'asc' }, { slug: 'asc' }],
    });

    res.json(pages);
  } catch (error) {
    console.error('Error fetching content pages:', error);
    res.status(500).json({ error: 'Failed to fetch content pages' });
  }
});

/**
 * Slug rules for a created article. This value becomes a public URL segment
 * (/insights/<slug>), so it is constrained rather than sanitised: lowercase letters,
 * digits and single hyphens only. Rejecting a bad slug outright is safer than silently
 * rewriting one, which would leave the author looking at a URL they didn't choose.
 */
const ARTICLE_SLUG = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens only');

const CreateArticleSchema = z.object({
  slug: ARTICLE_SLUG,
  title: z.string().trim().min(3).max(200),
});

/**
 * Create a new article page.
 *
 * Restricted to `article` and nothing else, deliberately. Every other page type is seeded
 * from code and bound to a route that already exists in the frontend router — letting this
 * endpoint create a `service` row would produce a page the router has no route for, or
 * shadow one that it does. Articles are the only type designed to be created at runtime,
 * because they are the only type the client authors themselves.
 *
 * Created as a draft with empty content: publishing is a separate, explicit action
 * (POST /:slug/publish), so a new article cannot reach the public site by being created.
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { slug, title } = CreateArticleSchema.parse(req.body);

    const existing = await prisma.contentPage.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ error: `A page with the slug "${slug}" already exists.` });
    }

    const page = await prisma.contentPage.create({
      data: {
        slug,
        type: 'article',
        path: `/insights/${slug}`,
        status: 'draft',
        // Title only. The rest is filled in through the editor — seeding placeholder body
        // text here would be exactly the fabricated-content failure this content type's
        // documentation exists to prevent.
        draftData: { title } as Prisma.InputJsonValue,
      },
    });

    res.status(201).json(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.flatten() });
    }
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Get one page's full draft + published data — for the admin edit view.
router.get('/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const page = await prisma.contentPage.findUnique({
      where: { slug: req.params.slug },
    });

    if (!page) {
      return res.status(404).json({ error: 'Content page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching content page:', error);
    res.status(500).json({ error: 'Failed to fetch content page' });
  }
});

const UpdateDraftSchema = z.object({
  draftData: z.record(z.any()),
});

// Save draft edits — never touches publishedData, so the live site is unaffected
// until an explicit Publish call.
router.put('/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const { draftData } = UpdateDraftSchema.parse(req.body);

    const page = await prisma.contentPage.update({
      where: { slug: req.params.slug },
      data: {
        draftData,
        status: 'draft',
      },
    });

    res.json(page);
  } catch (error) {
    console.error('Error updating content page draft:', error);
    res.status(400).json({ error: 'Failed to update draft' });
  }
});

// Publish — copies draftData into publishedData. This is the only action that
// changes what the public site renders.
router.post('/:slug/publish', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.contentPage.findUnique({
      where: { slug: req.params.slug },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Content page not found' });
    }

    const page = await prisma.contentPage.update({
      where: { slug: req.params.slug },
      data: {
        publishedData: existing.draftData as Prisma.InputJsonValue,
        status: 'published',
        publishedAt: new Date(),
      },
    });

    res.json(page);
  } catch (error) {
    console.error('Error publishing content page:', error);
    res.status(500).json({ error: 'Failed to publish' });
  }
});

// Discard draft changes — reverts draftData back to the last published snapshot.
// No-op (400) if the page has never been published, since there's nothing to revert to.
router.post('/:slug/discard', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.contentPage.findUnique({
      where: { slug: req.params.slug },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Content page not found' });
    }

    if (!existing.publishedData) {
      return res.status(400).json({ error: 'This page has never been published, so there is no version to revert to' });
    }

    const page = await prisma.contentPage.update({
      where: { slug: req.params.slug },
      data: {
        draftData: existing.publishedData as Prisma.InputJsonValue,
        status: 'published',
      },
    });

    res.json(page);
  } catch (error) {
    console.error('Error discarding content page draft:', error);
    res.status(500).json({ error: 'Failed to discard draft' });
  }
});

/**
 * Delete an article.
 *
 * Restricted to `article` for the mirror of the reason create is: every other page type is
 * seeded from code and has a route in the frontend expecting it to exist, so deleting one
 * would break a live page with no way back short of re-seeding. Articles are created at
 * runtime, so they must also be removable at runtime — otherwise a typo'd slug is
 * permanent.
 *
 * A hard delete, not a soft one, and that is the right call here: an unpublished article
 * has no public URL to preserve, and a published one being taken down is usually taken
 * down for a reason (a wrong claim, a legal problem) where leaving a hidden copy in the
 * table is a liability rather than a safety net. The admin audit log records that it
 * happened, and who did it.
 */
router.delete('/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.contentPage.findUnique({
      where: { slug: req.params.slug },
      select: { slug: true, type: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Content page not found' });
    }

    if (existing.type !== 'article') {
      return res.status(403).json({
        error: 'Only articles can be deleted. Every other page type is part of the site structure — hide it from the Visibility screen instead.',
      });
    }

    await prisma.contentPage.delete({ where: { slug: req.params.slug } });

    await prisma.adminAuditLog.create({
      data: {
        event: `article_deleted:${existing.slug}`,
        ip: req.ip ?? 'unknown',
        adminUserId: req.adminId,
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
