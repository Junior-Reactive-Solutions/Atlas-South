import { Router } from 'express';
import { requireDb } from '../lib/prisma.js';

/**
 * Public, unauthenticated visibility endpoint.
 *
 * Returns ONLY the list of hidden nav item ids — never page content, never any field an
 * admin edits. The ids themselves are not sensitive: they are the site's own navigation
 * keys, already present in the client bundle. Publishing which pages are hidden is
 * therefore not a disclosure, and it is what lets the header, footer and card grids stop
 * linking to a page the client has taken down.
 *
 * Hiding is enforced independently in the content endpoint (a hidden page's content 404s)
 * so this response is a rendering hint, not the access control. A caller that ignores it
 * still cannot read a hidden page.
 */
export const visibilityRouter = Router();

visibilityRouter.get('/nav/visibility', async (_req, res) => {
  try {
    const db = requireDb();
    const hiddenRows = await db.pageVisibility.findMany({
      where: { visible: false },
      select: { navId: true },
    });

    // Short cache only. Visibility is an editorial switch an admin expects to take effect
    // promptly, so this deliberately uses a much shorter TTL than the 5-minute content
    // cache — a page can otherwise stay linked for minutes after being hidden.
    res.set('Cache-Control', 'public, max-age=30');
    res.json({ hidden: hiddenRows.map((row) => row.navId) });
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      // Fail open on visibility only. If the database is unreachable the site should still
      // render its navigation rather than blank it; the content endpoint is what actually
      // withholds hidden pages, and that fails closed.
      return res.json({ hidden: [] });
    }
    console.error('Failed to fetch nav visibility:', err);
    res.json({ hidden: [] });
  }
});
