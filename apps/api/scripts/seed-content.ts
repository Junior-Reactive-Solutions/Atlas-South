/**
 * Seeds every page's content into the ContentPage table — both draftData and
 * publishedData set to the same snapshot, so switching the public pages over to reading
 * from this table causes zero regression.
 *
 * The content itself is NOT defined here any more. It lives in `@atlas-south/shared`
 * (packages/shared/src/content/), because apps/web needs the identical records to render
 * pages when the Content API is unreachable — see the note in that module. This script is
 * now purely the DB-write half; edit the content there.
 *
 * Safe to re-run: uses upsert, so it won't duplicate rows. Re-running WILL overwrite
 * publishedData with the current snapshot, so don't run this again after an admin has made
 * real edits through the panel.
 */
import { PrismaClient, type Prisma } from '@prisma/client';
import {
  EXTRACTED_PAGES,
  HOME_CONTENT,
  COMPANY_CONTENT,
  CAREERS_CONTENT,
} from '@atlas-south/shared';

const prisma = new PrismaClient();

/** The three hand-authored pages, with the type/path metadata the table needs. */
const SINGLETON_PAGES = [
  { slug: 'home', type: 'home', path: '/', data: HOME_CONTENT },
  { slug: 'company', type: 'company', path: '/company', data: COMPANY_CONTENT },
  { slug: 'careers', type: 'careers', path: '/company/join-us', data: CAREERS_CONTENT },
] as const;

async function upsertPage(slug: string, type: string, path: string, data: unknown) {
  const json = data as Prisma.InputJsonValue;
  await prisma.contentPage.upsert({
    where: { slug },
    create: {
      slug,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ContentPageType enum, validated by the call sites below
      type: type as any,
      path,
      status: 'published',
      draftData: json,
      publishedData: json,
      publishedAt: new Date(),
    },
    update: {
      // Re-running the seed refreshes both draft and published to the current snapshot —
      // intentional for pre-launch use, see file header.
      draftData: json,
      publishedData: json,
      publishedAt: new Date(),
      status: 'published',
    },
  });
}

async function main() {
  for (const page of EXTRACTED_PAGES) {
    await upsertPage(page.slug, page.type, page.path, page.data);
  }

  for (const page of SINGLETON_PAGES) {
    await upsertPage(page.slug, page.type, page.path, page.data);
  }

  const count = EXTRACTED_PAGES.length + SINGLETON_PAGES.length;
  console.log(`Seeded ${count} content pages (${EXTRACTED_PAGES.length} service/industry/area + ${SINGLETON_PAGES.length} singleton).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
