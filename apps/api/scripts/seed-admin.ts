/**
 * One-time seed script to create the first admin user.
 * Run once: npm run seed-admin
 * Never run automatically on startup (see §3 of docs/build/08-ADMIN-PANEL-SPEC.md)
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL;

  if (!adminEmail) {
    console.error('❌ ADMIN_SEED_EMAIL environment variable not set');
    console.error('Set ADMIN_SEED_EMAIL=your@email.com and run again');
    process.exit(1);
  }

  // Check if admin already exists
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.error(`❌ Admin user with email ${adminEmail} already exists`);
    process.exit(1);
  }

  // Use ADMIN_SEED_PASSWORD if set, otherwise generate a random temporary password
  const tempPassword = process.env.ADMIN_SEED_PASSWORD || randomBytes(32).toString('hex');
  const passwordHash = await argon2.hash(tempPassword, {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 2 ** 16,
  });

  // Create admin user
  await prisma.adminUser.create({
    data: {
      email: adminEmail,
      passwordHash,
      mustChangePassword: true,
    },
  });

  console.log('\n✅ Admin user created successfully\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email:             ', adminEmail);
  console.log('Temporary password:', tempPassword);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('⚠️  IMPORTANT:');
  console.log('1. Copy the temporary password above (it will not be shown again)');
  console.log('2. Go to http://localhost:9000/admin/login');
  console.log('3. Log in with the email and temporary password');
  console.log('4. You will be forced to change your password on first login');
  console.log('5. We recommend enabling 2FA (TOTP) in Settings after login\n');
}

main()
  .catch((e) => {
    console.error('Error creating admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
