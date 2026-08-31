# Atlas South Technical Services — Website

Full rebuild of [atlassouthes.com](https://www.atlassouthes.com), moving from a
hand-maintained static site to a React/Node application, informed by a full technical
audit and an ABM (abm.co.uk) comparative analysis.

**Current status (2026-08-31)** — frontend live on Vercel, API live on Render, Neon
Postgres migrated and current. All public forms verified working end-to-end. The site is
served from its Vercel URL; the DNS cutover to `atlassouthes.com` is **on hold pending
client authorisation** (see [Known limitations](#known-limitations-and-pending-work)).

## Stack

React 19 + Vite + TypeScript (frontend, Vercel) · Node.js 20 + Express + Prisma + multer
(backend, Render) · Neon Postgres · Resend (email) · anime.js v4 (animation) ·
argon2id password hashing with TOTP 2FA on the admin panel. Full rationale in
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
  shared/     — zod schemas, types, company/nav/SEO constants, page content
  design-system/ — icon registry + animation primitives
docs/
  agile/       — vision, product backlog, user stories
  audit/        — original website audit + ABM comparative analysis (PDF)
  build/         — full technical build specification (start at 00-MASTER-PLAN.md)
assets/
  brand/        — logo and brand source files
```

## Documentation

Start at [`docs/build/00-MASTER-PLAN.md`](docs/build/00-MASTER-PLAN.md) — it indexes
every other document in this repo (brand system, animation system, hero/footer specs,
page-by-page specification, security, admin panel, SEO checklist, legal content plan,
git workflow, hosting/deployment).

> ⚠️ `docs/build/16-PROJECT-STATUS-AND-RUNBOOK.md` describes the original Netlify + first
> Render account setup and is **superseded**. This README's Deployment section is the
> current source of truth for live infrastructure.

## Scripts

| Script | Runs |
|---|---|
| `npm run dev:web` | Frontend dev server (port 9000) |
| `npm run dev:api` | Backend dev server (port 9001) |
| `npm run build` | Builds `shared`, `design-system`, `web` (incl. SEO prerender), then `api` |
| `npm run lint` | Lints both apps + validates every internal link target resolves |
| `npm run typecheck` | Type-checks both apps |
| `npm run test` | Runs test suites |

## Link previews & SEO metadata

Worth understanding before adding a page, because it is not obvious.

`Seo.tsx` sets `<title>` and the Open Graph / Twitter tags from a React `useEffect` — which
only runs once JavaScript executes. **Link-preview crawlers (WhatsApp, X, Facebook,
iMessage, Slack) never run JavaScript**, so they only ever see what is in the raw HTML.

`apps/web/scripts/prerender-seo.mjs` closes that gap: it runs after `vite build`, and writes
a copy of the built `index.html` to `dist/<route>/index.html` for every route, with that
page's own title, description, OG/Twitter tags and canonical URL baked in. Vercel serves a
real static file before falling through to the SPA rewrite, so a crawler gets real metadata
while a browser boots the identical bundle and React Router takes over.

Metadata comes from two places, and **both the page component and the prerender script read
the same source** so they cannot drift:

| Page kind | Source |
|---|---|
| Home, company, legal (no content record) | `PAGE_SEO` in `packages/shared/src/constants/seo.ts` |
| Service / industry / area (25 pages) | `seoTitle` + `seoDescription` in `content/extracted-pages.ts` |
| Career detail pages | `seoDescription` on each `OpenRole` in `content/pages.ts` |

**Adding a page?** Add its metadata to the matching source above and the prerender step picks
it up automatically — no change to the script itself. Descriptions target **140–160
characters**; `heroDescription` is on-page hero prose and is only a fallback, not a
description.

The home page is the one page using a brand-first title (`Atlas South Technical Services |
…`), matching the format the client's previous site used. Every other page keeps
keyword-first / brand-last, which is correct for a page competing on a specific search term.

## Deployment

| Environment | Service | Status | URL |
|---|---|---|---|
| **Frontend** | Vercel | ✅ Live | https://atlas-south-web.vercel.app |
| **API** | Render | ✅ Live | https://atlas-south-api.onrender.com |
| **Database** | Neon Postgres | ✅ Live | schema current, all migrations applied |

### Vercel config is split across two files — both are required

The Vercel project's **Root Directory is `apps/web`**, not the repo root. That single setting
is why the config is split, and getting it wrong breaks the site in ways that look unrelated:

- **`vercel.json` (repo root)** — `installCommand` / `buildCommand` / `outputDirectory` only.
  These are read from the repo root regardless of Root Directory, so the commands must
  `cd ../..` to reach the true monorepo root, and `outputDirectory` is `"dist"` (relative to
  `apps/web`), not `"apps/web/dist"`.
- **`apps/web/vercel.json`** — `rewrites` and `headers` only. Vercel reads routing config from
  inside the configured Root Directory, which is a **separate lookup** from the build config
  above.

**Tell-tale if this regresses:** `curl -sI https://<host>/` and look for `X-Frame-Options:
DENY`. That header is defined only in `apps/web/vercel.json` — if it is missing, that file is
not being read, which also means the `/api/*` proxy and the SPA deep-link rewrite are dead.

### The API proxy target lives in `apps/web/vercel.json`

Every form on the site (quote/enquiry, job application, admin login) POSTs to a **relative**
`/api/...` path, which Vercel proxies to Render. The Render hostname is hardcoded in two
places in that file — the `rewrites` destination and the CSP `connect-src`.

If forms are ever reported broken while the rest of the site looks fine, check this first:

```bash
curl -s -X POST https://atlas-south-web.vercel.app/api/enquiries -H "Content-Type: application/json" -d '{"fullName":"Test","email":"t@example.com","phone":"07700900000","message":"test","agreedToPrivacyPolicy":true,"sourcePage":"/"}'
```

A `201` is healthy. A Render "Service Suspended" page or a connection error means the proxy
is pointing at the wrong or a dead service.

### Database migrations run from Render's Build Command

Nothing else in the repo runs them — there is no release phase. The Build Command **must**
end with `prisma migrate deploy`:

```bash
npm install --include=dev && npm run build --workspace=apps/api && npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```

This is set in the Render dashboard, **not** sourced from `render.yaml` on the current
account — so it does not survive recreating the service by hand. If it is missing, the
schema silently drifts behind the code and writes fail with a generic 500 (Prisma's
`create()` returns all model fields, so its `RETURNING` clause fails against columns the
live table does not have yet).

`--include=dev` is not optional: Render sets `NODE_ENV=production`, npm then omits
devDependencies, and this repo compiles TypeScript on the server. The root `.npmrc`
(`include=dev`) backs this up — don't delete it.

## Recent updates (Aug 31, 2026)

### Live incident — all forms were broken ([#81](https://github.com/Junior-Reactive-Solutions/Atlas-South/pull/81))

Client reported forms not working. Two stacked causes, both fixed:

1. `apps/web/vercel.json`'s `/api/*` proxy pointed at an **old Render service on a suspended
   account**, so every submission hit a "Service Suspended" page.
2. The replacement service's Build Command omitted `prisma migrate deploy`, so the live
   database was missing recent columns and writes failed with a generic 500.

Enquiry form, job application and admin login all verified returning `201`/`200` afterwards.

### Link previews ([#82](https://github.com/Junior-Reactive-Solutions/Atlas-South/pull/82), [#84](https://github.com/Junior-Reactive-Solutions/Atlas-South/pull/84), [#85](https://github.com/Junior-Reactive-Solutions/Atlas-South/pull/85))

- Build-time prerendering so crawlers get real per-page metadata (see the section above) —
  previously every shared link showed one generic card regardless of the page.
- Home page adopted the client's established brand-first title format.
- All **37 pages** given purpose-written 140–160 char descriptions. An audit found 34 were
  outside that range and 26 were reusing on-page hero copy.
- Fixed two live bugs found en route: the three legal pages were serving a *different*
  description to crawlers than the one in their component, and `Contact.tsx` hard-coded the
  phone number instead of importing it from `COMPANY`.
- Removed a stale claim that had been advertising **"fire safety"** — a service dropped at
  the client's request on 2026-08-20 — in search results ever since.

### Content & features ([#78](https://github.com/Junior-Reactive-Solutions/Atlas-South/pull/78), [#79](https://github.com/Junior-Reactive-Solutions/Atlas-South/pull/79), [#83](https://github.com/Junior-Reactive-Solutions/Atlas-South/pull/83))

- **Careers**: 2 fabricated roles replaced with 3 real ones from client PDFs; each now has a
  full `/company/join-us/:slug` page with the complete job description and a sticky apply form.
- **Applications**: CV *and* cover letter uploaded as separate PDFs, 5 MB client-side limit,
  server-side magic-number verification (declared MIME type is not trusted).
- **Social bar**: footer icons for TikTok, X, Instagram, Facebook, LinkedIn with a
  brand-colour fill-sweep on hover. The X icon was later corrected — a stroked X read as a
  "close" button, so it now uses the real X brand glyph.
- **About Us** rewritten from client-supplied copy: new tagline, intro, and six
  "Why We're the Best Choice" propositions.
- **Interior Painting** added as a new soft service — it existed on the old site (per-borough
  landing pages) with no equivalent here. Copy written fresh for this site's
  commercial/industrial scope; the old page was residential-framed.

## Known limitations and pending work

### DNS cutover to `atlassouthes.com` (on hold)

Explicitly awaiting client authorisation. When ready:

1. Add the custom domain in Vercel → Settings → Domains, and point DNS at the exact records
   Vercel shows for that domain (don't hardcode an IP from memory — Vercel's differ by apex
   vs subdomain and change over time).
2. **Flip `SITE_ORIGIN`** in `packages/shared/src/constants/seo.ts` to
   `https://${COMPANY.domain}`. It currently points at the Vercel URL because `og:image`,
   `og:url` and `canonical` have to resolve, and atlassouthes.com still serves the old site
   until this cutover happens.
3. Add Resend domain verification records so transactional email is deliverable.
4. Update `CORS_ALLOWED_ORIGIN` in the Render dashboard to `https://atlassouthes.com`.
5. Submit the sitemap to Google Search Console. `public/sitemap.xml` already lists
   `atlassouthes.com` URLs, which become correct at this point.

`emailThemes.ts` (`LOGO_URL` / `SITE_URL`) already points at `atlassouthes.com`.

### Uploaded files are ephemeral

Job application CVs and cover letters are written to Render's local disk, which is **wiped on
every deploy**. Deferred deliberately at the client's request. Cloudinary is in the dependency
tree but unconfigured; completing that or moving to S3-compatible storage is the fix.

### Rail Facilities has no static content fallback

`/soft-services/rail-facilities` renders from the API only. Every other service/industry/area
page also has an entry in `content/extracted-pages.ts` that acts as an offline-safe fallback
and feeds the SEO prerender — this one does not, so it degrades badly if the API is
unreachable and is the only service page absent from the prerendered metadata.

### Outstanding from the client

- Company registration number, VAT number, ICO registration number — `COMPANY` in
  `packages/shared` holds `null` for all three rather than inventing values.
- Real photography. Imagery is currently Unsplash stock.
- Some About-page details (team bios, the 2019 timeline entry) remain unverified against
  `docs/build/13-COMPANY-FACTS-VERIFIED.md`.

### Before go-live

- Rotate the seeded admin password. TOTP 2FA **is** implemented (`/admin/settings`) but is
  opt-in per account — enable it on every admin account.

## License

Proprietary — see [`LICENSE`](LICENSE). Not open source.
