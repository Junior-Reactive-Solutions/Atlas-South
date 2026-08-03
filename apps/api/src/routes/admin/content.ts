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

export default router;
