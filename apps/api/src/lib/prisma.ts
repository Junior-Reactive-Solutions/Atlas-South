import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * Single Prisma client instance. All DB access goes through Prisma's parameterised
 * queries — no raw SQL string concatenation anywhere, per docs/build/07-SECURITY.md §2
 * ("no raw SQL... eliminates SQL injection by construction").
 */
export const prisma = env.DATABASE_URL ? new PrismaClient() : null;

export function requireDb(): PrismaClient {
  if (!prisma) {
    throw new Error(
      'DATABASE_URL is not configured — see docs/build/12-HOSTING-DEPLOYMENT.md §4 (Neon setup).',
    );
  }
  return prisma;
}
