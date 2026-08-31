# Atlas South Technical Services — Website

Full rebuild of [atlassouthes.com](https://www.atlassouthes.com), moving from a
hand-maintained static site to a React/Node application, informed by a full technical
audit and an ABM (abm.co.uk) comparative analysis.

**Current status (2026-08-31)**: Frontend on Vercel (staging/production), API live on Render
(https://atlas-south-api.onrender.com). Three job listings, social media bar, dual file
uploads (CV + cover letter), site-wide SEO titles, and client-supplied About Us content
implemented and deployed.

## Stack

React 19 + Vite + TypeScript (frontend, Vercel) · Node.js 20 + Express + Prisma + multer
(backend, Render) · Neon Postgres (SQL database) · Resend (email) · anime.js v4
(animation). Frontend stores nothing server-side; API manages job applications with file
uploads (currently ephemeral disk on Render). Full rationale in
[`docs/build/05-ARCHITECTURE-AND-STACK.md`](docs/build/05-ARCHITECTURE-AND-STACK.md).

## Getting started

Prerequisites: Node.js ≥20, npm ≥10.

```bash
npm install
cp .env.example .env   # fill in values — see docs/build/05-ARCHITECTURE-AND-STACK.md
npm run dev:web         # http://localhost:9000
npm run dev:api          # http://localhost:9001
```

Local dev always uses the 9000-series ports fixed in
[`docs/build/05-ARCHITECTURE-AND-STACK.md`](docs/build/05-ARCHITECTURE-AND-STACK.md#3-local-development-port-map-9000-series-verified-free) —
this is deliberate so it never collides with other projects on the same machine.

## Project structure

```
apps/
  web/       — React frontend
  api/        — Express backend
packages/
  shared/     — zod schemas & types shared between web and api
docs/
  agile/       — vision, product backlog, user stories
  audit/        — original website audit + ABM comparative analysis (PDF)
  build/         — full technical build specification (14 documents — start at 00-MASTER-PLAN.md)
assets/
  brand/        — logo and brand source files
```

## Documentation

Start at [`docs/build/00-MASTER-PLAN.md`](docs/build/00-MASTER-PLAN.md) — it indexes
every other document in this repo (brand system, animation system, hero/footer specs,
page-by-page specification, security, admin panel, SEO checklist, legal content plan,
git workflow, hosting/deployment).

## Recent updates (Aug 31, 2026)

### [PR #78: Social bar, careers overhaul, SEO titles](https://github.com/Junior-Reactive-Solutions/Atlas-South/pull/78)
- **Social icons**: Footer bar with TikTok, X, Instagram, Facebook, LinkedIn links; circular
  badges with brand-colour fill-sweep hover animation (no generic dots)
- **Job listings**: Replaced 2 fabricated roles with 3 real jobs from client PDFs
  (Cleaning Supervisor, Junior Sales Executive, Senior Sales Manager)
- **Career detail pages**: New `/company/join-us/:slug` route with full job description,
  sticky application form, role overview, responsibilities, requirements, and benefits
- **Job application**: Dual file upload (CV + Cover Letter as separate PDFs), 5 MB
  client-side validation, server-side magic-number PDF verification
- **SEO titles**: Added professional `seoTitle` field to all 25 service/industry/area pages
  plus static pages (Careers, Vision & Mission)
- **Email & CORS**: Updated `emailThemes.ts` LOGO_URL/SITE_URL and Render env var
  CORS_ALLOWED_ORIGIN to `atlassouthes.com`

### [PR #79: About Us update](https://github.com/Junior-Reactive-Solutions/Atlas-South/pull/79) (pending merge)
- **Tagline**: "Facilities Support Built on Precision, Trust & Accountability"
- **Intro paragraph**: Client-supplied descriptive text explaining Atlas South's mission
- **Why We're the Best Choice**: 6 detailed value propositions replacing generic values
- **Vision & Mission**: Already updated in social icons PR

## Scripts

| Script | Runs |
|---|---|
| `npm run dev:web` | Frontend dev server (port 9000) |
| `npm run dev:api` | Backend dev server (port 9001) |
| `npm run build` | Builds `shared`, then `web`, then `api` |
| `npm run lint` | Lints both apps |
| `npm run typecheck` | Type-checks both apps |
| `npm run test` | Runs test suites |

## Deployment

| Environment | Service | Status | URL |
|---|---|---|---|
| **Frontend** | Vercel | ✅ Live | https://atlas-south-web.vercel.app |
| **API** | Render | ✅ Live | https://atlas-south-api.onrender.com |
| **Database** | Neon Postgres | ✅ Live | (pooled, production schema deployed) |

See [`docs/build/12-HOSTING-DEPLOYMENT.md`](docs/build/12-HOSTING-DEPLOYMENT.md) for full
deployment details, including Render blueprint (render.yaml), Vercel configuration
(vercel.json), and the Neon connection setup.

## Known limitations and pending work

### File storage (ephemeral)
Job application CVs and cover letters are stored on Render's ephemeral disk and deleted
on every deploy. This is temporary; Cloudinary integration is in the dependency tree but
not yet configured. For persistent file storage, either complete the Cloudinary setup or
integrate S3-compatible storage.

### DNS cutover (on hold)
The site is currently reachable at https://atlas-south-web.vercel.app (Vercel) and
https://atlas-south-api.onrender.com (Render API). Custom domain setup (atlassouthes.com
DNS → Vercel CDN) is explicitly on hold pending client authorization. When ready:
1. Point DNS to Vercel (A record to 76.76.19.0)
2. Add custom domain to Vercel project settings
3. Set Resend domain verification records for email deliverability
4. Update CORS_ALLOWED_ORIGIN to https://atlassouthes.com in Render dashboard
5. Update emailThemes.ts hardcoded LOGO_URL/SITE_URL to atlassouthes.com (already done)

### Admin authentication
- Admin login is configured (Express JWT + bcrypt)
- No 2FA yet — implement before production DNS cutover
- Default admin account is seeded at deploy time using ADMIN_SEED_EMAIL env var

### Render Postgres migrations
- Migrations are automatically applied on every Render deploy (`prisma migrate deploy`
  runs in buildCommand)
- Local development uses a separate Postgres instance — see `.env.example`

### Vercel project configuration
The Vercel project's Root Directory must remain the **repo root**, not `apps/web`.
`vercel.json` is resolved relative to the configured root, so it has to sit at the repo
root for the SPA rewrite and security headers to apply. If deep links (e.g., `/admin`,
`/company/contact`) ever 404, check that `vercel.json` is present and that Vercel is
reading it (look for the `X-Frame-Options: DENY` header in the response).

## License

Proprietary — see [`LICENSE`](LICENSE). Not open source.
