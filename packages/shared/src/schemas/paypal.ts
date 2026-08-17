import { z } from 'zod';

/**
 * Body the frontend posts to POST /api/paypal/subscriptions once PayPal's JS SDK fires
 * `onApprove` for a subscription — see docs/build/15-PAYPAL-INTEGRATION.md.
 *
 * This is deliberately a thin payload: the only thing that actually has to come from the
 * client is which PayPal subscription it's reporting. Everything else the handler needs
 * (plan id, status, payer details) it fetches itself from PayPal's own
 * GET /v1/billing/subscriptions/{id} — a client could otherwise claim any tierLabel/price
 * it likes for a subscription id it doesn't even own, and this schema alone can't stop
 * that; only the server-side verification step can, which is why that step is mandatory,
 * not optional, in the route handler.
 */
export const ConfirmSubscriptionSchema = z.object({
  paypalSubscriptionId: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^I-[A-Z0-9]+$/, 'Not a PayPal subscription id'),
});
export type ConfirmSubscriptionInput = z.infer<typeof ConfirmSubscriptionSchema>;
