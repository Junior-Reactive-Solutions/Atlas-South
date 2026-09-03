/**
 * Manual runner for the same insert-if-absent content seeding the API performs on boot
 * (src/lib/seedMissingContent.ts — see that file for why this exists and why it is safe).
 *
 * The API does this automatically on startup, so this script is not needed in normal
 * operation. It stays because there are two cases where running it by hand is the right
 * move: verifying the behaviour against a scratch database without booting the server, and
 * populating a freshly restored database before pointing traffic at it.
 *
 * Safe to run any number of times: it only ever creates rows that are missing, and never
 * touches a slug that already has one.
 */
import { PrismaClient } from '@prisma/client';
import { seedMissingContent } from '../src/lib/seedMissingContent.js';

const prisma = new PrismaClient();

async function main() {
  const created = await seedMissingContent(prisma);
  if (created.length === 0) {
    console.log('seed-missing-content: every page already has a row, nothing to do.');
  } else {
    console.log(
      `seed-missing-content: created ${created.length} missing page(s) — ${created.join(', ')}.`,
    );
  }
}

main()
  .catch((e) => {
    console.error('seed-missing-content failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
