import type { PrismaClient, Prisma } from '@prisma/client';
import {
  EXTRACTED_PAGES,
  HOME_CONTENT,
  COMPANY_CONTENT,
  CAREERS_CONTENT,
} from '@atlas-south/shared';
import { logSystemEvent } from './systemLog.js';

/**
 * Creates ContentPage rows for pages that exist in the code but not in the database.
 *
 * WHY THIS EXISTS: nothing kept the two sources in step. `scripts/seed-content.ts` upserts
 * everything, overwriting publishedData with the code snapshot — correct pre-launch,
 * destructive afterwards (its own header warns not to run it once an admin has edited
 * anything), so it could never run on a deploy. Drift therefore went unnoticed until a page
 * broke: `rail-facilities` shipped with a route, a nav entry and no content record, and
 * rendered "Page not found" from the header and footer for a week. Seven more pages had no
 * row either — invisible in Admin → Content and so uneditable by the client, while looking
 * fine to visitors because the frontend falls back to the bundled copy.
 *
 * SAFETY: strictly INSERT-IF-ABSENT. A slug that already has a row is skipped entirely —
 * existing content is never read, updated or overwritten, so an admin's edits cannot be
 * clobbered. A slug with no row gets one, published, from the bundled content, which is
 * already what the site renders for it; publishing changes nothing a visitor sees, it only
 * makes the page editable in the panel.
 *
 * That property is what makes it safe to run unattended on every boot.
 */
const SINGLETON_PAGES = [
  { slug: 'home', type: 'home', path: '/', data: HOME_CONTENT },
  { slug: 'company', type: 'company', path: '/company', data: COMPANY_CONTENT },
  { slug: 'careers', type: 'careers', path: '/company/join-us', data: CAREERS_CONTENT },
] as const;

export async function seedMissingContent(prisma: PrismaClient): Promise<string[]> {
  const created: string[] = [];

  for (const page of [...EXTRACTED_PAGES, ...SINGLETON_PAGES]) {
    const existing = await prisma.contentPage.findUnique({
      where: { slug: page.slug },
      select: { slug: true },
    });
    if (existing) continue;

    const json = page.data as Prisma.InputJsonValue;
    await prisma.contentPage.create({
      data: {
        slug: page.slug,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ContentPageType enum; every value here is a literal from the two lists above
        type: page.type as any,
        path: page.path,
        status: 'published',
        draftData: json,
        publishedData: json,
        publishedAt: new Date(),
      },
    });
    created.push(page.slug);
  }

  return created;
}

/**
 * Boot-time wrapper. Deliberately never throws and never blocks: it is called after the
 * server is already listening, so a database that is slow or briefly unreachable delays
 * nothing and takes nothing down — the site keeps serving from its bundled content exactly
 * as it does today, and the next boot tries again.
 *
 * Runs on startup rather than in the build command because the build command lives in
 * Render's dashboard rather than in this repo, so a code-only change cannot reach it. The
 * work is ~30 indexed lookups and, after the first successful run, zero writes.
 */
export function seedMissingContentOnBoot(prisma: PrismaClient | null): void {
  if (!prisma) return;

  void seedMissingContent(prisma)
    .then((created) => {
      if (created.length === 0) return;
      logSystemEvent({
        level: 'info',
        source: 'api',
        event: 'content_pages_seeded',
        message: `Created ${created.length} missing content page(s): ${created.join(', ')}.`,
      });
    })
    .catch((err) => {
      logSystemEvent({
        level: 'warning',
        source: 'api',
        event: 'content_seed_failed',
        message: err instanceof Error ? err.message : 'Unknown error seeding content pages',
      });
    });
}
