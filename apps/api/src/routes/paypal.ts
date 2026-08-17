import { Router } from 'express';
import { ConfirmSubscriptionSchema } from '@atlas-south/shared';
import { validateBody } from '../middleware/validate.js';
import { requireDb } from '../lib/prisma.js';
import { getSubscription, verifyWebhookSignature, isPaypalConfigured } from '../lib/paypal.js';
import { env } from '../lib/env.js';

/**
 * PayPal Subscriptions — public-facing routes. See docs/build/15-PAYPAL-INTEGRATION.md
 * for the full architecture and lib/paypal.ts for the PayPal API client itself.
 */
export const paypalRouter = Router();

/**
 * The set of PayPal plan ids this app will actually record a subscription against.
 * Populated from PACKAGES_CONTENT at content-fetch time in a real deployment; for now,
 * sourced from env so this route works before the admin content panel grows a "which
 * PayPal plan is this tier" field. Every id here must have been created by
 * scripts/setup-paypal-plans.ts (or the client's own PayPal dashboard) — this is the
 * allow-list that stops a tampered request from being recorded at all, regardless of
 * what tierLabel it claims.
 */
function knownPlanIds(): Set<string> {
  return new Set(
    [env.PAYPAL_PLAN_ID_STARTER, env.PAYPAL_PLAN_ID_PROFESSIONAL, env.PAYPAL_PLAN_ID_ENTERPRISE].filter(
      (id): id is string => Boolean(id),
    ),
  );
}

function tierForPlanId(planId: string): string {
  if (env.PAYPAL_PLAN_ID_STARTER === planId) return 'Starter';
  if (env.PAYPAL_PLAN_ID_PROFESSIONAL === planId) return 'Professional';
  if (env.PAYPAL_PLAN_ID_ENTERPRISE === planId) return 'Enterprise';
  return 'Unknown';
}

/**
 * Called by the frontend (PayPalSubscribeButton.tsx) immediately after PayPal's JS SDK
 * fires `onApprove` for a new subscription. The client-supplied subscription id is never
 * trusted on its own — this handler re-fetches the subscription from PayPal itself
 * (GET /v1/billing/subscriptions/{id}) and only records it if:
 *   1. PayPal confirms the subscription actually exists and is ACTIVE, and
 *   2. its plan_id is one this app recognises (knownPlanIds) — this is what stops a
 *      tampered/replayed request from recording a subscription for a plan id we never
 *      issued, and is why the tier/price shown to the buyer is derived from the verified
 *      plan_id, never taken from anything the client sent.
 */
paypalRouter.post('/paypal/subscriptions', validateBody(ConfirmSubscriptionSchema), async (req, res) => {
  if (!isPaypalConfigured()) {
    return res.status(503).json({ error: 'PayPal is not configured for this environment.' });
  }

  const { paypalSubscriptionId } = req.body as { paypalSubscriptionId: string };

  try {
    const subscription = await getSubscription(paypalSubscriptionId);

    if (subscription.status !== 'ACTIVE') {
      return res.status(409).json({ error: `Subscription is not active (status: ${subscription.status}).` });
    }

    const allowedPlanIds = knownPlanIds();
    if (allowedPlanIds.size > 0 && !allowedPlanIds.has(subscription.plan_id)) {
      // eslint-disable-next-line no-console
      console.error(
        `PayPal subscription ${paypalSubscriptionId} references an unrecognised plan id ${subscription.plan_id} — refusing to record it.`,
      );
      return res.status(422).json({ error: 'Unrecognised subscription plan.' });
    }

    const db = requireDb();
    const record = await db.subscription.upsert({
      where: { paypalSubscriptionId },
      create: {
        paypalSubscriptionId,
        paypalPlanId: subscription.plan_id,
        tierLabel: tierForPlanId(subscription.plan_id),
        customerName:
          [subscription.subscriber?.name?.given_name, subscription.subscriber?.name?.surname].filter(Boolean).join(' ') ||
          'Unknown',
        customerEmail: subscription.subscriber?.email_address ?? 'unknown@unknown',
        status: 'active',
      },
      update: { status: 'active' },
    });

    return res.status(200).json({ ok: true, id: record.id, tier: record.tierLabel });
  } catch (err) {
    if (err instanceof Error && err.message.includes('DATABASE_URL')) {
      return res.status(503).json({ error: 'Database not yet configured for this environment.' });
    }
    // eslint-disable-next-line no-console
    console.error('Failed to confirm PayPal subscription:', err);
    return res.status(500).json({ error: 'Something went wrong confirming the subscription.' });
  }
});

/**
 * PayPal webhook receiver — configured in the PayPal dashboard against
 * https://<api-origin>/api/paypal/webhook. This is the source of truth for subscription
 * status changes that don't originate from this app's own UI (a cancellation the buyer
 * makes from inside their PayPal account, a payment failure that auto-suspends a plan,
 * etc.) — POST /api/paypal/subscriptions above only ever *creates* a subscription; this
 * is what keeps its status current afterwards.
 *
 * Every request is signature-verified via PayPal's Verify Webhook Signature API before
 * anything in the body is trusted — an unauthenticated POST to this URL with a fabricated
 * "subscription cancelled" event is exactly the kind of forgery this guards against.
 */
paypalRouter.post('/paypal/webhook', async (req, res) => {
  if (!isPaypalConfigured()) {
    return res.status(503).json({ error: 'PayPal is not configured for this environment.' });
  }

  const authAlgo = req.header('paypal-auth-algo');
  const certUrl = req.header('paypal-cert-url');
  const transmissionId = req.header('paypal-transmission-id');
  const transmissionSig = req.header('paypal-transmission-sig');
  const transmissionTime = req.header('paypal-transmission-time');

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return res.status(400).json({ error: 'Missing PayPal transmission headers.' });
  }

  try {
    const verified = await verifyWebhookSignature({
      authAlgo,
      certUrl,
      transmissionId,
      transmissionSig,
      transmissionTime,
      webhookEvent: req.body,
    });

    if (!verified) {
      // eslint-disable-next-line no-console
      console.error('PayPal webhook signature verification failed — discarding event.', {
        transmissionId,
      });
      return res.status(400).json({ error: 'Signature verification failed.' });
    }

    const event = req.body as { event_type?: string; resource?: { id?: string } };
    const subscriptionId = event.resource?.id;

    const STATUS_BY_EVENT: Record<string, 'active' | 'suspended' | 'cancelled' | 'expired'> = {
      'BILLING.SUBSCRIPTION.ACTIVATED': 'active',
      'BILLING.SUBSCRIPTION.RE-ACTIVATED': 'active',
      'BILLING.SUBSCRIPTION.SUSPENDED': 'suspended',
      'BILLING.SUBSCRIPTION.CANCELLED': 'cancelled',
      'BILLING.SUBSCRIPTION.EXPIRED': 'expired',
    };

    const newStatus = event.event_type ? STATUS_BY_EVENT[event.event_type] : undefined;

    if (subscriptionId && newStatus) {
      const db = requireDb();
      // updateMany (not update) — a webhook can legitimately arrive for a subscription
      // this app never got a chance to record via POST /paypal/subscriptions (e.g. the
      // buyer closed the tab right after approving); silently matching zero rows is
      // correct there, not an error.
      await db.subscription.updateMany({
        where: { paypalSubscriptionId: subscriptionId },
        data: { status: newStatus },
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to process PayPal webhook:', err);
    // 500 tells PayPal to retry the delivery — appropriate here since the failure is
    // this server's, not a signal that the event itself was invalid.
    return res.status(500).json({ error: 'Failed to process webhook.' });
  }
});
