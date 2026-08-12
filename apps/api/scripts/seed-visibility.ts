/**
 * Seeds the initial hidden-page set: every nav item still marked `placeholder: true`.
 *
 * These are the ten pages that were advertising themselves as "Coming soon" in the live
 * navigation — five service lines and five industries with no real content yet. Showing a
 * visitor a third of the offering as unbuilt undercuts the whole site, so they start
 * hidden and the client can reveal each one from Admin → Visibility as its content lands.
 *
 * Safe to re-run: upserts by navId. Re-running will re-hide anything an admin has since
 * revealed, so this is a one-time bootstrap, not something to wire into deploys.
 */
import { PrismaClient } from '@prisma/client';
import { HARD_SERVICES, SOFT_SERVICES, INDUSTRIES, SERVICE_AREAS } from '@atlas-south/shared';

const prisma = new PrismaClient();

async function main() {
  const placeholderIds = [...HARD_SERVICES, ...SOFT_SERVICES, ...INDUSTRIES, ...SERVICE_AREAS]
    .filter((item) => item.placeholder)
    .map((item) => item.id);

  for (const navId of placeholderIds) {
    await prisma.pageVisibility.upsert({
      where: { navId },
      create: { navId, visible: false },
      update: { visible: false },
    });
  }

  console.log(`Hid ${placeholderIds.length} placeholder pages: ${placeholderIds.join(', ')}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
