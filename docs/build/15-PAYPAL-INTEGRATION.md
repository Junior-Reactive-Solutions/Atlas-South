# PayPal Subscriptions Integration

Client requirement: "integrate PayPal as a payment option in the most secure way
possible" — verified against PayPal's own API integration standard, not assumed. This
document is the single source of truth for that integration; `lib/paypal.ts`,
`routes/paypal.ts`, and the frontend button component all point back here.

## 1. Why Subscriptions, not one-time Orders

The original site's packages page (`docs/audit/screenshots/atlas-sec-packages.png`,
restored in `apps/api/scripts/seed-content.ts`) sells monthly recurring plans — "MONTHLY
PLANS", "SUBSCRIBE — £75/MO", "Cancel anytime · 30 days notice" — not one-off payments.
PayPal has two different REST API families for this:

| API | Use case | Why not here |
|---|---|---|
| Orders v2 (`/v2/checkout/orders`) | Single, one-time payment | Doesn't recur — would require re-charging the buyer manually every month |
| **Subscriptions v1 (`/v1/billing/*`)** | Recurring billing against a pre-defined plan | **What this integration uses** — matches the original site's actual billing model exactly |

## 2. Endpoints actually used

Every path below was checked directly against PayPal's own published OpenAPI specs
(`github.com/paypal/paypal-rest-api-specifications`), not assumed from memory or a
tutorial, on 2026-08-15.

| Purpose | Method & path | Called from |
|---|---|---|
| OAuth2 access token (client-credentials grant) | `POST /v1/oauth2/token` | `lib/paypal.ts` — every server-to-server call below goes through this first |
| Create product | `POST /v1/catalogs/products` | `scripts/setup-paypal-plans.ts` (one-time) |
| Create billing plan | `POST /v1/billing/plans` | `scripts/setup-paypal-plans.ts` (one-time) |
| Show subscription details | `GET /v1/billing/subscriptions/{id}` | `lib/paypal.ts` `getSubscription()` — the server-side verification step, see §4 |
| Verify webhook signature | `POST /v1/notifications/verify-webhook-signature` | `lib/paypal.ts` `verifyWebhookSignature()` |

Base URL: `https://api-m.sandbox.paypal.com` (sandbox, default) or `https://api-m.paypal.com`
(live) — controlled by `PAYPAL_ENV`, which defaults to `sandbox` specifically so a missing
or misconfigured env var can never accidentally start taking real payments.

## 3. Client-side vs server-side responsibilities

- **Frontend** (`apps/web/src/lib/paypalSdk.ts`,
  `apps/web/src/components/packages/PayPalSubscribeButton.tsx`): loads PayPal's JS SDK
  as an external `<script src="https://www.paypal.com/sdk/js">` — the method PayPal's own
  docs recommend, not an npm package — and renders PayPal's own Smart Button. The button
  and the approval popup it opens are entirely PayPal's UI, running on PayPal's own
  origin. This app never collects, sees, or transmits a card number or PayPal password —
  that's what keeps this integration in **PCI DSS SAQ A** scope (the smallest, simplest
  self-assessment tier) rather than SAQ D (300+ requirements), which direct card handling
  would require.
- **Backend** (`apps/api/src/lib/paypal.ts`, `apps/api/src/routes/paypal.ts`): holds the
  one real secret (`PAYPAL_CLIENT_SECRET`), which never leaves the server — contrast with
  `PAYPAL_CLIENT_ID`/`VITE_PAYPAL_CLIENT_ID`, which is meant to be public and is what the
  frontend embeds. The backend independently re-verifies every subscription and every
  webhook against PayPal itself before trusting anything the browser reports.

## 4. Why "the browser said it succeeded" is never trusted alone

`POST /api/paypal/subscriptions` is the only thing the frontend calls after PayPal's
`onApprove` fires — it sends nothing but the subscription id. The handler then:

1. Calls `GET /v1/billing/subscriptions/{id}` itself, server-to-server, and checks the
   response actually says `status: "ACTIVE"`.
2. Checks the subscription's `plan_id` against an allow-list of plan ids this app itself
   created (`PAYPAL_PLAN_ID_STARTER`/`_PROFESSIONAL`/`_ENTERPRISE`) — a request claiming
   an unrecognised plan id is refused outright.
3. Only then derives the tier name/price from that verified `plan_id` — never from
   anything the client sent — and upserts the `Subscription` row.

This is what stops a forged or replayed request from recording a subscription that
doesn't exist, or claiming a cheaper tier than what was actually approved.

## 5. Webhooks

Subscription status changes that don't originate from this app's own checkout flow — a
buyer cancelling from inside their own PayPal account, an auto-suspend after a failed
payment — arrive via a webhook, configured in the PayPal dashboard against
`https://<api-origin>/api/paypal/webhook`.

Every inbound webhook POST is signature-verified via PayPal's Verify Webhook Signature
API before anything in its body is trusted:

- The four `paypal-transmission-*` headers PayPal sends (`paypal-auth-algo`,
  `paypal-cert-url`, `paypal-transmission-id`, `paypal-transmission-sig`,
  `paypal-transmission-time`) are read from the request.
- Those, plus the parsed JSON body and this app's own `PAYPAL_WEBHOOK_ID`, are POSTed to
  `/v1/notifications/verify-webhook-signature`. PayPal's own field name for the payload is
  `webhook_event` and takes the **parsed JSON object**, not raw bytes — this API doesn't
  use HMAC-over-raw-body the way some other providers' webhooks do, so no raw-body
  capture middleware is needed.
- Only a `verification_status: "SUCCESS"` response is acted on; anything else is logged
  and discarded, and the request is rejected with 400.

Events handled: `BILLING.SUBSCRIPTION.ACTIVATED`, `.RE-ACTIVATED`, `.SUSPENDED`,
`.CANCELLED`, `.EXPIRED` — each just updates the matching `Subscription` row's status.

## 6. Content-Security-Policy

PayPal's JS SDK needs specific origins allow-listed — checked against PayPal's own CSP
guidance, not guessed:

- `script-src`: `https://www.paypal.com https://www.paypalobjects.com`
- `connect-src`: `https://www.paypal.com`
- `frame-src`: `https://www.paypal.com`

Applied in `vercel.json` (the frontend's response headers — see
`docs/build/07-SECURITY.md` §1). No `'unsafe-inline'` anywhere: this app's own
initialisation code ships as a bundled script from `'self'`, and PayPal's button/approval
UI runs inside an iframe/popup on PayPal's own origin, governed by PayPal's own CSP, not
ours.

## 7. Setup checklist (once the client has a PayPal Business account)

1. Get live API credentials from the PayPal Developer Dashboard; set `PAYPAL_CLIENT_ID`,
   `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV=live` in the API's production environment.
2. Run `apps/api/scripts/setup-paypal-plans.ts` (against sandbox first to test, then live)
   — creates the product and three monthly plans (Starter £75, Professional £180,
   Enterprise £450) and prints their plan ids.
3. Set `PAYPAL_PLAN_ID_STARTER`/`_PROFESSIONAL`/`_ENTERPRISE` from that output.
4. Set the matching `paypalPlanId` field on each tier in
   `apps/api/scripts/seed-content.ts`'s `PACKAGES_CONTENT`, then re-run that seed script.
5. Set `VITE_PAYPAL_CLIENT_ID` (the same public client id, not the secret) in the
   frontend's build environment.
6. In the PayPal dashboard, create a webhook subscribed to the five
   `BILLING.SUBSCRIPTION.*` events above, pointed at
   `https://<api-origin>/api/paypal/webhook`; set the resulting webhook id as
   `PAYPAL_WEBHOOK_ID`.

Until all of the above is done, every tier's Subscribe button gracefully falls back to
the existing quote-form link (`apps/web/src/pages/packages/Packages.tsx`) — nothing is
ever a dead end in the meantime.
