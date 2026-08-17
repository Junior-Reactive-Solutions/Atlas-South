/**
 * One-time setup: creates the PayPal catalog product and the three monthly billing plans
 * (Starter £75, Professional £180, Enterprise £450) that back /packages' Subscribe
 * buttons — see docs/build/15-PAYPAL-INTEGRATION.md.
 *
 * Requires PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET to already be set (sandbox credentials
 * for testing, or the client's live credentials once they have a PayPal Business account
 * — see PAYPAL_ENV in .env.example). Prints the three resulting plan ids at the end;
 * paste them into PAYPAL_PLAN_ID_STARTER / _PROFESSIONAL / _ENTERPRISE in .env, and into
 * the matching tier's `paypalPlanId` field in apps/api/scripts/seed-content.ts's
 * PACKAGES_CONTENT (then re-run that seed script).
 *
 * Safe to run more than once against sandbox for testing, but NOT idempotent — each run
 * creates a brand new product and three brand new plans, so don't re-run this against
 * live credentials once the real plans exist; use PayPal's dashboard or the update-pricing
 * endpoint to change an existing plan instead.
 */
import { PACKAGES_CONTENT } from '@atlas-south/shared';
import { createProduct, createPlan } from '../src/lib/paypal.js';

/**
 * Derived from PACKAGES_CONTENT rather than restated, so the plan name/description/price
 * PayPal shows a buyer at checkout cannot drift from what /packages advertises. These were
 * previously hardcoded here and had already drifted: they still described the Starter tier
 * as being for "single-property homeowners" after the site had been made
 * commercial/industrial-only, which would have put residential copy in front of real payers.
 */
const TIERS = PACKAGES_CONTENT.tiers.map((tier) => ({
  key: tier.label.toUpperCase(),
  name: `Atlas South — ${tier.label}`,
  description: tier.description,
  // "£75" → "75.00": PayPal requires a decimal string with no currency symbol.
  price: `${tier.startingFrom.replace(/[^0-9.]/g, '')}.00`,
}));

async function main() {
  console.log('Creating PayPal catalog product...');
  const product = await createProduct(
    'Atlas South Monthly Service Plans',
    'Recurring monthly facilities & trades service packages — priority booking, capped/free emergency callouts, scheduled maintenance visits.',
  );
  console.log(`Product created: ${product.id}`);

  const planIds: Record<string, string> = {};
  for (const tier of TIERS) {
    console.log(`Creating plan: ${tier.name} (£${tier.price}/month)...`);
    const plan = await createPlan({
      productId: product.id,
      name: tier.name,
      description: tier.description,
      monthlyPriceGbp: tier.price,
    });
    planIds[tier.key] = plan.id;
    console.log(`  -> ${plan.id}`);
  }

  console.log('\nDone. Add these to .env:\n');
  console.log(`PAYPAL_PLAN_ID_STARTER=${planIds.STARTER}`);
  console.log(`PAYPAL_PLAN_ID_PROFESSIONAL=${planIds.PROFESSIONAL}`);
  console.log(`PAYPAL_PLAN_ID_ENTERPRISE=${planIds.ENTERPRISE}`);
  console.log('\nAnd the matching paypalPlanId field on each tier in apps/api/scripts/seed-content.ts, then re-run that seed script.');
}

main().catch((err) => {
  console.error('Failed to set up PayPal plans:', err);
  process.exit(1);
});
