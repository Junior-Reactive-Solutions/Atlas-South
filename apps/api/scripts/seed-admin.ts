import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import { requireDb } from '../src/lib/prisma.js';
import { env } from '../src/lib/env.js';

/**
 * One-time "break-glass" admin account creation — docs/build/08-ADMIN-PANEL-SPEC.md §3.
 *
 * Run manually, ONCE, against production: `npm run seed:admin --workspace=apps/api`
 * Never runs as part of normal app startup, so it can't accidentally re-run and reset
 * the account. The generated password is shown ONLY in this terminal's output — it is
 * never written to a log file, never emailed, never committed anywhere. Capture it
 * immediately and change it on first login (the account is created with
 * mustChangePassword: true, which the admin panel must enforce before granting access
 * to any data).
 */
async function main() {
  const db = requireDb();

  if (!env.ADMIN_SEED_EMAIL) {
    console.error('Set ADMIN_SEED_EMAIL in the environment before running this script.');
    process.exit(1);
  }

  const existing = await db.adminUser.findUnique({ where: { email: env.ADMIN_SEED_EMAIL } });
  if (existing) {
    console.error(`An admin account already exists for ${env.ADMIN_SEED_EMAIL} — refusing to overwrite it.`);
    console.error('If you need to reset the password, use the admin panel\'s own reset flow, not this script.');
    process.exit(1);
  }

  const tempPassword = randomBytes(18).toString('base64url'); // cryptographically random
  const passwordHash = await argon2.hash(tempPassword, { type: argon2.argon2id });

  await db.adminUser.create({
    data: {
      email: env.ADMIN_SEED_EMAIL,
      passwordHash,
      mustChangePassword: true,
    },
  });

  console.log('\n=== Admin account created ===');
  console.log(`Email:    ${env.ADMIN_SEED_EMAIL}`);
  console.log(`Password: ${tempPassword}`);
  console.log('\nThis password is shown ONLY here, ONCE. Capture it now and change it');
  console.log('immediately on first login — it will not be shown or recoverable again.');
  console.log('===============================\n');
}

main()
  .catch((err) => {
    console.error('Seed script failed:', err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
