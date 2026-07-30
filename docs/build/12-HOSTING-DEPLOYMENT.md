# Hosting & Deployment

Client-specified stack: Vercel (frontend), Render (backend), Neon (database),
Cloudinary (imagery), Resend (email). This document wires them together and defines the
environment/promotion flow.

## 1. Environments

| Environment | Frontend | Backend | Database | Purpose |
|---|---|---|---|---|
| Local | `localhost:9000` | `localhost:9001` | Neon dev branch (or local Postgres) | Day-to-day development, per port map in `05-ARCHITECTURE-AND-STACK.md` |
| Preview | Vercel preview URL (per-PR) | Render preview/staging service | Neon PR-scoped branch | Every open PR gets its own preview automatically — reviewable before merge |
| Production | `www.atlassouthes.com` (once DNS is cut over) | Render production service | Neon main branch | Live site |

## 2. Vercel (frontend)

- Project root: `apps/web`.
- Framework preset: Vite.
- Environment variables set in Vercel's dashboard per environment (Production/Preview/
  Development) — `VITE_API_BASE_URL` points at the matching Render environment for each.
- Custom domain (`atlassouthes.com` / `www.atlassouthes.com`) attached once DNS is handed
  over by the client — until then, builds are verified on the Vercel-issued `*.vercel.app`
  domain.
- Vercel's GitHub integration provides the automatic PR preview deployments referenced in
  `11-GIT-GITHUB-WORKFLOW.md`'s `deploy-preview.yml` row — this is Vercel's native
  behaviour once the repo is connected, not a custom script.
- Headers (`X-Frame-Options`, CSP, etc. from `07-SECURITY.md` §1) set via `vercel.json`
  so they apply to the static frontend even though most of them are more naturally an API
  concern — the marketing pages need them too.

## 3. Render (backend)

- Service type: Web Service (persistent Node process — required for in-memory rate
  limiting per `07-SECURITY.md` §3, and for any scheduled jobs, e.g. a nightly job
  purging enquiry records past their retention window per `10-LEGAL-CONTENT-PLAN.md`).
- Build command: `npm install && npm run build --workspace=apps/api`.
- Start command: `npm run start --workspace=apps/api`.
- Health check endpoint (`/health`) configured so Render can detect a crashed instance
  and restart it.
- Environment variables set in Render's dashboard — `DATABASE_URL`, `JWT_*_SECRET`,
  `RESEND_API_KEY`, `CLOUDINARY_*`, `SENTRY_DSN`, `CORS_ALLOWED_ORIGIN` (pointed at the
  matching Vercel deployment for that environment).
- Auto-deploy on push to `main` (production) and on push to `develop` (staging), matching
  the branch strategy in `11-GIT-GITHUB-WORKFLOW.md`.

## 4. Neon (database)

- One Neon project, with **branches** mirroring the git branch strategy:
  - `main` branch → production data
  - a long-lived `develop` branch → staging data
  - **ephemeral branches per PR** (Neon's branching is cheap/instant, and pairs naturally
    with Render's preview environments) — a PR that changes the schema gets its own
    isolated database branch, migrated independently, so schema changes are testable
    without ever touching production or even the shared staging data.
- Prisma migrations (`prisma migrate deploy`) run as a release step before the API
  process starts in each environment — never `prisma migrate dev` outside local
  development.
- Connection pooling via Neon's built-in pooler (`-pooler` connection string variant) for
  the production `DATABASE_URL`, since Render's persistent process can otherwise exhaust
  Postgres connections under load.

## 5. Cloudinary

- One Cloudinary account/cloud name, folder structure:
  ```
  atlas-south/
    brand/         — logo, favicon exports
    hero/           — hero background photography (sourced per 03-HERO-SECTION-SPEC.md)
    services/        — future service-page imagery
    case-studies/     — future case-study imagery, once real client projects are documented
  ```
- All delivery URLs use `f_auto,q_auto` transformation flags (automatic format/quality —
  this is what keeps the performance budget in `09-SEO-PERFORMANCE-CHECKLIST.md`
  achievable even after adding the site's first real photography).
- Upload is a manual/admin-triggered action for MVP (no public-facing upload surface) —
  the only place a file upload path exists is inside the authenticated admin panel per
  `08-ADMIN-PANEL-SPEC.md`, and it goes through the server-side validation defined in
  `07-SECURITY.md` §2, never a direct unsigned browser-to-Cloudinary upload.

## 6. Resend

- Verified sending domain (`atlassouthes.com` or a subdomain like `mail.atlassouthes.com`)
  with SPF/DKIM/DMARC records — required for deliverability and itself a small
  SEO/trust-adjacent win (a properly authenticated sending domain reduces the chance
  enquiry-confirmation emails land in spam, which matters for a business whose whole
  funnel depends on quote-form follow-up).
- Two email flows for MVP: enquiry confirmation (to the submitter) and enquiry
  notification (to the admin inbox) — both templated, both referencing the canonical
  contact details from `13-COMPANY-FACTS-VERIFIED.md`.
- Password-reset emails for the admin panel (per `08-ADMIN-PANEL-SPEC.md`) also go
  through Resend.

## 7. Deployment checklist before first production cutover

- [ ] Custom domain DNS pointed at Vercel (frontend) — coordinate the cutover window with
      the client since it's a live, indexed domain today.
- [ ] All environment variables set in both Vercel and Render for Production.
- [ ] Neon production branch migrated and seeded with the one admin account per
      `08-ADMIN-PANEL-SPEC.md` §3.
- [ ] Resend sending domain verified (SPF/DKIM/DMARC passing).
- [ ] Google Search Console property verified, sitemap submitted (per
      `09-SEO-PERFORMANCE-CHECKLIST.md` §6).
- [ ] Full `09-SEO-PERFORMANCE-CHECKLIST.md` re-audit run against the live production URL
      before considering launch "done."
