import { env } from './env.js';

/**
 * PayPal REST API client — Subscriptions, per docs/build/15-PAYPAL-INTEGRATION.md.
 *
 * Every endpoint path and request-body field name below was checked directly against
 * PayPal's own published OpenAPI specs (github.com/paypal/paypal-rest-api-specifications)
 * on 2026-08-15, not assumed from memory — see the doc above for the verification trail.
 *
 * Security model (docs/build/07-SECURITY.md, extended here):
 * - PAYPAL_CLIENT_SECRET never leaves this server. It's used only for the OAuth2
 *   client-credentials token exchange below and is never sent to, or readable by, the
 *   browser (contrast with PAYPAL_CLIENT_ID / VITE_PAYPAL_CLIENT_ID, which is meant to be
 *   public and is what the frontend embeds to load PayPal's JS SDK).
 * - The access token is cached in memory only (never persisted to the database or disk)
 *   and re-fetched a minute before PayPal's own `expires_in` would lapse.
 * - This app never asks the buyer for card details, a PayPal password, or anything else
 *   that would put it in PCI DSS SAQ D territory — PayPal's own hosted Buttons/checkout
 *   flow (embedded via their JS SDK, apps/web/src/components/packages/
 *   PayPalSubscribeButton.tsx) is what actually collects payment, which keeps this
 *   integration in the much smaller SAQ A scope.
 * - Every function here degrades to a thrown, caught, logged error when PayPal isn't
 *   configured (mirrors lib/email.ts's `resend ? ... : null` pattern) rather than
 *   pretending to succeed.
 */

const API_BASE = env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

function requirePaypalCredentials(): { clientId: string; clientSecret: string } {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error(
      'PayPal is not configured — set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET (see docs/build/15-PAYPAL-INTEGRATION.md).',
    );
  }
  return { clientId: env.PAYPAL_CLIENT_ID, clientSecret: env.PAYPAL_CLIENT_SECRET };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/**
 * OAuth2 client-credentials token exchange — POST /v1/oauth2/token, Basic-auth'd with
 * client id/secret, per PayPal's own OAuth docs. Cached in memory and reused until ~60s
 * before PayPal's reported `expires_in` (typically 9 hours), so a normal request path
 * doesn't pay for a token round-trip every time.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const { clientId, clientSecret } = requirePaypalCredentials();
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error(`PayPal OAuth token request failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
}

async function paypalFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`PayPal API ${init.method ?? 'GET'} ${path} failed: ${res.status} ${await res.text()}`);
  }

  // Some PayPal endpoints (e.g. plan activate) return 204 No Content.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface PayPalSubscription {
  id: string;
  plan_id: string;
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  subscriber?: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
  };
}

/**
 * GET /v1/billing/subscriptions/{id} — the server-side source of truth this app checks
 * before ever recording a subscription as real. Never trust the client's own claim that
 * checkout succeeded; this is what actually confirms it, and what the plan id (hence
 * price/tier) genuinely is.
 */
export async function getSubscription(subscriptionId: string): Promise<PayPalSubscription> {
  return paypalFetch<PayPalSubscription>(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

export interface CreateProductResult {
  id: string;
}

/** POST /v1/catalogs/products — one-time setup step, see scripts/setup-paypal-plans.ts. */
export async function createProduct(name: string, description: string): Promise<CreateProductResult> {
  return paypalFetch<CreateProductResult>('/v1/catalogs/products', {
    method: 'POST',
    body: JSON.stringify({ name, description, type: 'SERVICE', category: 'PROFESSIONAL_SERVICES' }),
  });
}

export interface CreatePlanInput {
  productId: string;
  name: string;
  description: string;
  /** Monthly price as a decimal string, e.g. "75.00" — PayPal requires a string, not a number. */
  monthlyPriceGbp: string;
}

export interface CreatePlanResult {
  id: string;
}

/**
 * POST /v1/billing/plans — one-time setup step, see scripts/setup-paypal-plans.ts. Plans
 * are created ACTIVE directly (billing_cycles with a single INFINITE regular cycle, no
 * trial), matching the original site's "Cancel anytime · 30 days notice" monthly-rolling
 * packages (see apps/api/scripts/seed-content.ts PACKAGES_CONTENT) rather than a
 * fixed-term contract.
 */
export async function createPlan({ productId, name, description, monthlyPriceGbp }: CreatePlanInput): Promise<CreatePlanResult> {
  return paypalFetch<CreatePlanResult>('/v1/billing/plans', {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId,
      name,
      description,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: { interval_unit: 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // 0 = bills indefinitely until cancelled
          pricing_scheme: { fixed_price: { value: monthlyPriceGbp, currency_code: 'GBP' } },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3,
      },
    }),
  });
}

export interface VerifyWebhookSignatureInput {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  /** Parsed JSON body of the webhook request. */
  webhookEvent: unknown;
}

/**
 * POST /v1/notifications/verify-webhook-signature — the only thing that turns an
 * unauthenticated inbound POST to /api/paypal/webhook into something this app can trust.
 * Field names here (auth_algo, cert_url, transmission_id, transmission_sig,
 * transmission_time, webhook_id, webhook_event) match PayPal's notifications_webhooks_v1
 * OpenAPI spec exactly. See routes/paypal.ts for where the four paypal-transmission-*
 * headers this needs are read from the incoming request.
 */
export async function verifyWebhookSignature(input: VerifyWebhookSignatureInput): Promise<boolean> {
  if (!env.PAYPAL_WEBHOOK_ID) {
    throw new Error('PAYPAL_WEBHOOK_ID is not configured — webhook signatures cannot be verified without it.');
  }

  const result = await paypalFetch<{ verification_status: 'SUCCESS' | 'FAILURE' }>(
    '/v1/notifications/verify-webhook-signature',
    {
      method: 'POST',
      body: JSON.stringify({
        auth_algo: input.authAlgo,
        cert_url: input.certUrl,
        transmission_id: input.transmissionId,
        transmission_sig: input.transmissionSig,
        transmission_time: input.transmissionTime,
        webhook_id: env.PAYPAL_WEBHOOK_ID,
        webhook_event: input.webhookEvent,
      }),
    },
  );

  return result.verification_status === 'SUCCESS';
}

export function isPaypalConfigured(): boolean {
  return Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);
}
