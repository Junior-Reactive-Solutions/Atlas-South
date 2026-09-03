/**
 * Creates ContentPage rows for any page that exists in the code but NOT in the database.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT seed-content.ts:
 * `seed-content.ts` upserts every page, overwriting publishedData with the code snapshot.
 * That is correct pre-launch and destructive afterwards — its own header warns not to run
 * it once an admin has edited anything through the panel. So it cannot be part of a deploy,
 * which means nothing kept the database in step with the code, and pages drifted:
 *
 *   - `rail-facilities` was added to the nav, the router and the components on 2026-08-26
 *     with no content record anywhere. It rendered "Page not found" from both the header
 *     and the footer until 2026-09-03.
 *   - Seven more (parking-lot-management, interior-painting, government-public-sector,
 *     oil-gas, manufacturing, data-centres, venues) had no database row either. Those
 *     survived only because the frontend falls back to the copy bundled in
 *     packages/shared — so they looked fine to visitors while being invisible in
 *     Admin → Content, and therefore uneditable by the client.
 *
 * This script fixes both problems permanently and safely, because it is strictly
 * INSERT-IF-ABSENT:
 *   - A slug that already has a row is skipped entirely. Nothing an admin has written
 *     through the panel is ever read, touched or overwritten.
 *   - A slug with no row gets one, published, from the bundled content — which is exactly
 *     what the site was already rendering for it, so publishing changes nothing a visitor
 *     sees. It only makes the page appear in the admin panel so it can be edited.
 *
 * Being insert-only is what makes it safe to run on every deploy (see render.yaml), which
 * is the point: any page added to the code from now on gets a database row automatically,
 * instead of silently becoming the next rail-facilities.
 */
import { PrismaClient, type Prisma } from '@prisma/client';
import {
  EXTRACTED_PAGES,
  HOME_CONTENT,
  COMPANY_CONTENT,
  CAREERS_CONTENT,
} from '@atlas-south/shared';

const prisma = new PrismaClient();

/** The hand-authored pages, with the type/path metadata the table needs. */
const SINGLETON_PAGES = [
  { slug: 'home', type: 'home', path: '/', data: HOME_CONTENT },
  { slug: 'company', type: 'company', path: '/company', data: COMPANY_CONTENT },
  { slug: 'careers', type: 'careers', path: '/company/join-us', data: CAREERS_CONTENT },
] as const;

async function createIfMissing(slug: string, type: string, path: string, data: unknown) {
  const existing = await prisma.contentPage.findUnique({
    where: { slug },
    select: { slug: true },
  });
  if (existing) return false;

  const json = data as Prisma.InputJsonValue;
  await prisma.contentPage.create({
    data: {
      slug,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ContentPageType enum, and every value passed here is a literal from the two lists below
      type: type as any,
      path,
      status: 'published',
      draftData: json,
      publishedData: json,
      publishedAt: new Date(),
    },
  });
  return true;
}

async function main() {
  const created: string[] = [];

  for (const page of [...EXTRACTED_PAGES, ...SINGLETON_PAGES]) {
    if (await createIfMissing(page.slug, page.type, page.path, page.data)) {
      created.push(page.slug);
    }
  }

  const total = EXTRACTED_PAGES.length + SINGLETON_PAGES.length;
  if (created.length === 0) {
    console.log(`seed-missing-content: all ${total} pages already present, nothing to do.`);
  } else {
    console.log(
      `seed-missing-content: created ${created.length} missing page(s) — ${created.join(', ')}. ` +
        `${total - created.length} already present and left untouched.`,
    );
  }
}

main()
  .catch((e) => {
    console.error('seed-missing-content failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
