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

- Project root: **the repo root**, not `apps/web`.

  > ⚠️ Corrected 2026-08-17. This line previously said `apps/web`, and `vercel.json` was
  > moved there to match it. Vercel resolves `vercel.json` relative to the configured Root
  > Directory, so it stopped being read entirely: the SPA rewrite vanished and every deep
  > link (`/packages`, `/company/contact`, `/admin`) returned Vercel's own 404 while `/`
  > kept working, because only `/` maps to a file on disk. `vercel.json` lives at the repo
  > root and must stay there — see the README section on this.
  >
  > Quick check that it's being applied: `curl -sI https://<deployment>/ | grep -i x-frame`.
  > `X-Frame-Options: DENY` comes only from `vercel.json`; if it's missing, neither the
  > headers nor the rewrites are in effect.

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
- **Provisioned from [`render.yaml`](../../render.yaml) as a Render Blueprint**, not by hand
  in the dashboard — the three settings below are each easy to get wrong in a way that
  presents as an unrelated fault, so they're committed rather than clicked.
- Build command: `npm ci && npm run build --workspace=apps/api && npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma`.

  > ⚠️ Corrected 2026-08-17. This previously omitted the migration step. Nothing else in the
  > repo runs migrations, so a fresh Neon database would have had no tables and every request
  > would have failed at the query rather than at startup — a confusing failure to debug.
  > `migrate deploy` (not `migrate dev`) is correct here: it applies only committed
  > migrations, never prompts, and is idempotent, so it's safe on every deploy.

- Start command: `npm run start --workspace=apps/api`.
- Health check endpoint: **`/api/health`**, not `/health`.

  > ⚠️ Corrected 2026-08-17. The health route is mounted under the `/api` prefix
  > (`apps/api/src/index.ts`), so `/health` returns 404. Verified by booting the built
  > server: `/api/health` → 200, `/health` → 404. Pointing Render at `/health` would have
  > made it declare a perfectly healthy service dead and restart-loop it forever.
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
- Prisma migrations (`prisma migrate deploy`) run at the end of Render's **build** command —
  never `prisma migrate dev` outside local development.

  > Render has no separate "release phase" (unlike Heroku), which is what this line
  > originally assumed. The build step is the correct hook: it runs before the new instance
  > receives traffic, and `DATABASE_URL` is available to it.

- `DATABASE_URL` must end with `?sslmode=require` — Neon rejects non-TLS connections, and
  the resulting error surfaces as a generic connection failure rather than anything
  mentioning TLS.
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
