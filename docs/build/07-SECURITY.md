# Security Specification

Client requirement: "no loophole in any element of the website" — rate limiting,
sanitisation, token handling, and validation "for all manner of website URL passes."
This document turns that into a concrete, checkable spec covering every layer of the
stack chosen in `05-ARCHITECTURE-AND-STACK.md`. It also closes every gap the audit found
on the live site (security scored 33/100 — the worst category measured).

## 1. Transport & response headers

Direct fix of the audit's finding that the live site sets HSTS but nothing else:

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Extends the audit-confirmed HSTS from 180 days to a full year with preload — the one thing the current site already gets right, made stronger |
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' res.cloudinary.com images.unsplash.com; script-src 'self' https://www.paypal.com https://www.paypalobjects.com; style-src 'self' fonts.googleapis.com; font-src fonts.gstatic.com; connect-src 'self' <api-origin> https://www.paypal.com; frame-src https://www.paypal.com; frame-ancestors 'none'` | Audit: currently absent entirely. Locked to only the origins this project actually uses. The `paypal.com`/`paypalobjects.com` additions (script/connect/frame) are for the JS SDK that renders PayPal's own Subscribe button and approval popup — domains checked directly against PayPal's own CSP guidance, see docs/build/14-PAYPAL-INTEGRATION.md. No `'unsafe-inline'` anywhere: our own initialisation code that calls the SDK ships from `'self'` as a bundled script, and PayPal's button/approval UI runs inside an iframe/popup on PayPal's own origin, governed by PayPal's own CSP, not ours. |
| `X-Frame-Options` | `DENY` | Prevents clickjacking — audit found this absent (ABM at least sets `SAMEORIGIN`; this project goes stricter since the site has no legitimate reason to be framed) |
| `X-Content-Type-Options` | `nosniff` | Audit: absent on both sites measured |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Audit: absent |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=(), payment=(self)` | Explicitly disables APIs the site doesn't use; `payment` scoped to `self` only for the Packages checkout flow |
| `Cache-Control` | Static assets: `public, max-age=31536000, immutable` (hashed filenames). HTML: `no-cache` (always revalidate) | Audit: no caching policy at all currently — this both fixes performance and ensures a cache never serves stale auth-sensitive HTML |

Implemented once via `helmet` middleware on the Express API and via Vercel's
`vercel.json` headers config on the frontend — not hand-set per route, so it can't drift.

## 2. Input validation — "counting for all manner of website URL passes"

Every entry point into the backend is validated before any handler logic runs:

- **Every route parameter, query string, and request body** is checked against a `zod`
  schema shared from `packages/shared` (see `05-ARCHITECTURE-AND-STACK.md`). A request
  that doesn't match its schema is rejected with `400` before touching the database or
  any business logic — this is the concrete meaning of "counting for all manner of URL
  passes": no path is exempt, including admin routes.
- **Type coercion is explicit, never implicit** — a query param expected to be a number
  is parsed and range-checked (`z.coerce.number().int().positive()`), not passed through
  as a raw string into a query.
- **No raw SQL string concatenation anywhere.** Prisma's parameterised queries are the
  only DB access path — this eliminates SQL injection by construction rather than by
  developer discipline.
- **HTML sanitisation:** anywhere user-submitted text could ever be rendered back as HTML
  (none currently planned — all form submissions are plain text stored fields), `DOMPurify`
  (server-side via `isomorphic-dompurify`) is applied before storage as defence-in-depth,
  even though the current design stores/display only escaped plain text.
- **File uploads** (Cloudinary, if the admin panel later allows uploading case-study
  images): server-side MIME-type sniffing (not just trusting the `Content-Type` header),
  file-size cap, and re-encoding through Cloudinary's own pipeline rather than serving an
  uploaded file directly.

## 3. Rate limiting

| Surface | Limit | Rationale |
|---|---|---|
| Public quote/contact form submission | 5 requests / 10 minutes / IP, plus a honeypot field (audit confirmed the current formsubmit.co integration already has one — carried forward) | Prevents form-spam floods without blocking a genuine user who mistypes and resubmits |
| Admin login | 5 attempts / 15 minutes / IP **and** per-account lockout after 10 failed attempts within an hour (see `08-ADMIN-PANEL-SPEC.md`) | Brute-force protection on the single most sensitive endpoint in the system |
| All other public API GET routes | 100 requests / minute / IP | General abuse ceiling |
| Admin API routes (post-auth) | 300 requests / minute / authenticated user | Generous enough for normal dashboard use, still bounded |

Implemented with `express-rate-limit` for the MVP (in-memory store, single Render
instance); documented upgrade path to `rate-limiter-flexible` + Redis if the app ever
scales to multiple instances (in-memory limits don't share state across instances).

## 4. Authentication & session handling (admin panel)

Full detail in `08-ADMIN-PANEL-SPEC.md`; the security-specific guarantees:

- Passwords hashed with **argon2id** (not bcrypt/md5/sha — argon2id is the current
  OWASP-recommended default), never stored or logged in plain text anywhere, including
  error logs.
- **JWT access token**, short-lived (15 min), plus a **refresh token in an `httpOnly`,
  `Secure`, `SameSite=Strict` cookie** — the access token is never stored in
  `localStorage`/`sessionStorage`, which would be readable by any injected script (XSS
  → token theft is the exact failure mode this avoids).
- **CSRF protection** on every state-changing admin request (double-submit cookie token
  or `SameSite=Strict` + custom header check) — required specifically because the refresh
  token lives in a cookie.
- Session/refresh tokens are **revocable server-side** (a `tokenVersion` column bumped on
  password change or manual logout-everywhere action), not just relying on expiry.
- Full audit log of admin logins (timestamp, IP, success/failure) — feeds the admin
  dashboard's own security visibility, not just server logs.

## 5. Dependency & supply-chain hygiene

- **Dependabot** enabled on the GitHub repo (see `11-GIT-GITHUB-WORKFLOW.md`) — automatic
  PRs for vulnerable dependency versions.
- `npm audit` run as a required CI check on every PR (see `11-GIT-GITHUB-WORKFLOW.md`
  workflow list) — a PR introducing a known-vulnerable package fails CI, not caught later.
- Lockfile (`package-lock.json`) committed and required to match `package.json` in CI —
  prevents "phantom" dependency drift between environments.
- No secrets ever committed — enforced by `.gitignore` (see `11-GIT-GITHUB-WORKFLOW.md`)
  and a pre-commit/CI secret-scan step (`gitleaks` in the CI workflow).

## 6. Data protection in transit and at rest

- All traffic HTTPS-only (Vercel and Render both terminate TLS by default; HSTS from §1
  ensures the browser never falls back to plaintext HTTP after first visit).
- Neon connections use TLS (`sslmode=require` in the connection string).
- Environment variables/secrets stored in Vercel/Render's encrypted secret stores and
  GitHub Actions secrets — never in the repo, never in client-side bundles (anything
  prefixed `VITE_` is public by design in Vite; secrets never get that prefix).
- Enquiry/contact data retention and deletion rules are defined in
  `10-LEGAL-CONTENT-PLAN.md` (this document covers *how* data is protected; that one
  covers *how long* it's kept and *why*).

## 7. Monitoring & incident response

- **Sentry** on both frontend and backend (per `05-ARCHITECTURE-AND-STACK.md`) — errors
  are visible immediately rather than silently failing, closing the audit's "no error
  handling visibility" gap.
- Failed-login and rate-limit-triggered events are logged distinctly from ordinary
  errors, so a brute-force attempt is visible as a pattern in Sentry/logs, not buried in
  routine 4xx noise.
- A basic incident checklist (rotate secrets → invalidate all admin sessions
  (`tokenVersion` bump) → review Sentry/audit logs → patch → redeploy) lives in this file
  as the standing procedure, not something invented ad hoc if something ever goes wrong.

## 8. What this explicitly does NOT cover (out of scope for MVP, flag if it changes)

- Payment card data — the Packages checkout uses Stripe/PayPal's hosted flow (confirmed
  in the original audit as already the case); card numbers never touch this
  application's own servers, so PCI-DSS scope stays minimal by design. Do not build a
  custom card-entry form without revisiting this section.
- A Web Application Firewall (WAF) beyond what Vercel/Render provide by default — worth
  reconsidering once real traffic volume exists, not a Sprint 1 requirement.
