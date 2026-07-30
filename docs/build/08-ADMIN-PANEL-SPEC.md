# Admin Panel Specification

Client requirement: track interactions with the site, analytics on what's collected,
order/enquiry tracking per client, "utmost security," and admin login credentials
provided to you once the account exists. This document specifies the panel end to end.

## 1. Where it lives

Routed inside `apps/web` at `/admin/*`, behind auth (per `05-ARCHITECTURE-AND-STACK.md` —
default plan is one app, not a separate deployable, unless that changes). The public site
and admin panel share the design system (`01-BRAND-SYSTEM.md`) and animation tokens
(`02-ANIMATION-SYSTEM.md`) rather than the admin getting a visually separate ad hoc UI —
consistency was an explicit client requirement, and "the admin side" isn't exempted from
it. `/admin/*` is excluded from the public sitemap and gets a blanket `noindex, nofollow`.

## 2. Authentication

- Single admin role for MVP (extensible to multiple roles/permission levels later if the
  client wants staff accounts beyond the owner).
- Login: email + password (argon2id-hashed, per `07-SECURITY.md`), rate-limited 5
  attempts/15 min/IP with account lockout after 10 failed attempts/hour.
- **Optional TOTP 2FA** (e.g. via `otplib`) — recommended and should be enabled on the
  account once created, given this panel holds client enquiry data.
- Session: short-lived JWT access token + httpOnly refresh cookie, exactly as specified
  in `07-SECURITY.md` §4 — no separate weaker auth path for admin "for convenience."
- Full login audit trail visible inside the panel itself (timestamp, IP, success/fail) —
  not just server-side logs, so you can see login activity without needing infrastructure
  access.

## 3. Credential provisioning — how you actually get your login

1. The first admin account is created by a **one-time seed script**
   (`apps/api/scripts/seed-admin.ts`), run manually against the production database once,
   never as part of normal app startup (so it can't accidentally re-run and reset the
   account).
2. The script generates a **cryptographically random temporary password** (not a
   guessable default), hashes it, and creates the `AdminUser` row with a
   `mustChangePassword: true` flag.
3. The temporary password is displayed **once**, in the terminal output of that manual
   run, and is your responsibility to capture and change immediately on first login —
   it is never written to a log file, never emailed, never committed anywhere. This is
   the standard "break-glass" pattern for a first-admin account and avoids ever having a
   real credential pass through git history, chat, or a ticketing system.
4. On first login with the temporary password, the panel forces an immediate password
   change (and TOTP 2FA setup, strongly recommended) before granting access to any data.
5. **You confirm the email address to use for `ADMIN_SEED_EMAIL` before this script is
   ever run** — that's the one input needed from you; the rest of the process needs no
   further exchange of secrets.

This satisfies "logins are given to me once created" without ever putting a real
password in a document, message, or commit — the only thing that gets "given to you" is
the one-time terminal output at creation time, by design.

## 4. What the panel tracks — "analytics with the kind of data we collect"

Being explicit here matters twice: it's both the engineering spec and the exact content
that has to be disclosed in the Privacy Policy per `10-LEGAL-CONTENT-PLAN.md` — the two
documents must never drift apart.

| Data collected | Table | Purpose | Retention (see `10-LEGAL-CONTENT-PLAN.md`) |
|---|---|---|---|
| Page views (path, referrer, timestamp, coarse device/browser, anonymised session id) | `PageView` | Traffic and popular-content reporting | 14 months (matches standard GA4 default, stated explicitly in the Privacy Policy) |
| Interaction events (CTA clicks, phone-link clicks, WhatsApp-link clicks, form starts/submits) | `Event` | Conversion-path analysis — which pages/CTAs actually drive enquiries | 14 months |
| Enquiries (name, email, phone, message, service requested, source page, status) | `Enquiry` | The actual sales pipeline — see §5 | Duration of the business relationship + 6 years (UK statutory recordkeeping norm for commercial contracts) or until deletion is requested, whichever is defined in the Privacy Policy |
| Admin login events | `AdminAuditLog` | Security visibility (§2) | 12 months rolling |

No data collection beyond what's listed above without updating both this file and the
Privacy Policy at the same time — this is a hard rule, not a suggestion, given the
client's own "airtight" requirement for the legal documents.

## 5. Order / enquiry tracking

Every quote-form or contact-form submission across every page (residential Packages
included) lands in one `Enquiry` table, visible in the admin panel as a pipeline board:

```
New → Contacted → Quoted → Won / Lost
```

Each enquiry record shows: which page it came from (so "which service page converts
best" is answerable), the service requested, full contact details, free-text message,
and a timestamped activity log (status changes, any internal notes added by the admin
user). This is the concrete answer to "track orders for services by different clients."

## 6. Dashboard views

| View | Shows |
|---|---|
| **Overview** | Enquiries this week/month, conversion rate by source page, top 5 pages by traffic, top 5 CTAs by click-through |
| **Enquiries** | The pipeline board from §5, filterable by service/status/date range |
| **Analytics** | Page views over time, top entry pages, top exit pages, device/browser breakdown — all sourced from the `PageView`/`Event` tables, presented with the same card/chart components (and the same `dataviz`-informed colour usage) as the rest of the design system |
| **Security** | Admin login audit trail from §2/§4 |
| **Settings** | Password/2FA management, and — once real content lands — the ability to mark a placeholder page (§1 flag in `06-PAGE-SPECIFICATIONS.md`) as reviewed/finalised, giving you a checklist view of which of the 10 MVP-placeholder pages still need real client content |

## 7. Animation & UI consistency

Per the client's explicit uniformity requirement, the admin panel is **not** a
differently-animated "internal tool" aesthetic — data widgets fade/rise on load using the
exact same tokens as public-site cards (`02-ANIMATION-SYSTEM.md`, "Admin dashboard data
widgets" row), and the colour system is the same 60/30/10 light-panel recipe from
`01-BRAND-SYSTEM.md`, just applied to a dashboard layout instead of marketing content.

## 8. Security summary specific to this panel

Cross-referenced from `07-SECURITY.md`, restated here because this is the single highest-
value target on the whole site (it holds every client enquiry ever submitted):
- argon2id hashing, JWT + httpOnly refresh cookie, CSRF protection, rate-limited login,
  account lockout, full audit logging, TOTP 2FA available.
- `/admin/*` is never included in any public sitemap, robots directive is
  `noindex, nofollow` for the whole subtree.
- No admin data is ever exposed through a public API route, even an unlinked one —
  every `/admin/*` API route requires a valid session, checked server-side on every
  request, not just hidden by frontend routing.
