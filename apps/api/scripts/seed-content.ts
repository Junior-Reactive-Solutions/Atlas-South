/**
 * One-time seed: loads extracted-content.json (produced by apps/web/scripts/
 * extract-content.tsx from the site's existing hardcoded pages) plus the Home page's
 * hero copy, and upserts each as a ContentPage row — both draftData and publishedData
 * set to the current live content, so switching the public pages over to reading from
 * this table causes zero regression.
 *
 * Safe to re-run: uses upsert, so it won't duplicate rows. Re-running WILL overwrite
 * publishedData with the current extracted snapshot, so don't run this again after an
 * admin has made real edits through the panel.
 */
import { PrismaClient, type Prisma } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

interface ExtractedPage {
  slug: string;
  type: 'service' | 'industry' | 'area';
  path: string;
  data: Record<string, unknown>;
}

const HOME_CONTENT = {
  headlineLines: ['Trades and facilities services', 'you can trust —', 'for your home or your business.'],
  subcopy:
    'Atlas South has delivered {jobsCompleted} jobs across London and the South East since {foundedYear}, from emergency call-outs to fully managed facilities contracts.',
  primaryCtaLabel: 'Get a Free Quote',
  homeCtaLabel: 'For Your Home',
  businessCtaLabel: 'For Your Business',
};

async function main() {
  const extractedPages: ExtractedPage[] = JSON.parse(
    readFileSync(resolve(__dirname, 'extracted-content.json'), 'utf-8'),
  );

  let count = 0;

  for (const page of extractedPages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        type: page.type,
        path: page.path,
        status: 'published',
        draftData: page.data as Prisma.InputJsonValue,
        publishedData: page.data as Prisma.InputJsonValue,
        publishedAt: new Date(),
      },
      update: {
        // Re-running the seed refreshes both draft and published to the extracted
        // snapshot — intentional for pre-launch use, see file header.
        draftData: page.data as Prisma.InputJsonValue,
        publishedData: page.data as Prisma.InputJsonValue,
        publishedAt: new Date(),
        status: 'published',
      },
    });
    count++;
  }

  await prisma.contentPage.upsert({
    where: { slug: 'home' },
    create: {
      slug: 'home',
      type: 'home',
      path: '/',
      status: 'published',
      draftData: HOME_CONTENT,
      publishedData: HOME_CONTENT,
      publishedAt: new Date(),
    },
    update: {
      draftData: HOME_CONTENT,
      publishedData: HOME_CONTENT,
      publishedAt: new Date(),
      status: 'published',
    },
  });
  count++;

  console.log(`Seeded ${count} content pages (${extractedPages.length} from extraction + 1 home).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
