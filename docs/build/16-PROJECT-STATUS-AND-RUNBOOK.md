# Project Status, Decision Record & Deployment Runbook

Last updated **2026-08-17**, at the merge of [PR #36](https://github.com/Junior-Reactive-Solutions/Atlas-South/pull/36).

This is the practical companion to the numbered specs in this folder. Those describe what the
site *should* be; this describes what it **is** right now, what went wrong on the way, what the
mitigation was, and what is genuinely still outstanding.

---

## 1. Where things stand in one screen

| Area | Status | Notes |
|---|---|---|
| Frontend (Vercel) | ✅ Live | `https://atlas-south-web.vercel.app` — all deep links 200 |
| Backend (Render) | ❌ Not deployed | Blueprint committed (`render.yaml`); needs an account + Neon URL. §6 |
| Database (Neon) | ❌ Not created | 5 migrations ready to apply. §6 |
| Public pages | ✅ Render fully | Content bundled into the frontend, so they work with **no** backend. §3.2 |
| Forms / enquiries | ❌ Non-functional | POST to a backend that doesn't exist yet |
| Admin panel | ⚠️ Loads, can't log in | Route works; auth needs the API |
| PayPal | ⚠️ Built, dormant | Falls back to the quote form until credentials exist. §5.4 |
| Emails (Resend) | ❌ Not configured | Code degrades gracefully — logs a warning, never throws |
| Cloudinary | ❌ Not used | Images served from Unsplash's CDN instead. §5.6 |
| Real photography | ❌ Stock only | Highest-value remaining content task. §7 |

**Verified live in production**, not assumed:

```
/                            200
/packages                    200
/admin/login                 200
/company/contact             200
/hard-services/electricals   200
/areas/west-london           200
/company                     200
```

---

## 2. Architecture as actually built

```
Atlas_South/                     ← Vercel Root Directory is HERE (not apps/web — §3.1)
├── vercel.json                  ← SPA rewrite + security headers. MUST stay at root.
├── render.yaml                  ← Render Blueprint for the API (§6.2)
├── apps/
│   ├── web/                     ← React 18 + Vite + TS + Tailwind, port 9000
│   │   ├── scripts/
│   │   │   ├── check-links.mjs         ← link audit, runs in `npm run lint` (§4.5)
│   │   │   ├── check-service-network.mjs ← SVG track geometry assertions
│   │   │   └── build-favicon-ico.mjs   ← hand-rolled ICO packer (§5.5)
│   │   └── src/
│   │       ├── hooks/useContentPage.ts  ← bundled content + API overlay (§3.2)
│   │       ├── hooks/useHashScroll.ts   ← makes #anchor links work in the SPA (§4.4)
│   │       └── hooks/useNavVisibility.tsx ← hides placeholder + admin-hidden pages (§4.3)
│   └── api/                     ← Express + Prisma, port 9001
│       ├── prisma/migrations/   ← 5 migrations
│       └── scripts/             ← seed-admin, seed-content, seed-visibility, setup-paypal-plans
└── packages/
    ├── shared/                  ← the IA, zod schemas, AND all page content (§3.2)
    │   └── src/content/         ← single source of truth for page content
    └── design-system/           ← brand tokens, Icon registry, motion hooks
```

**Ports:** web `9000`, api `9001`, local Postgres `5434` (Docker container `atlas_south_pg`).

### Why page content lives in `packages/shared`

It has two consumers that cannot import from each other — the API's seed script and the web
app. Putting it in either app would have forced a copy. See §3.2 for the failure that drove
this.

---

## 3. The two structural problems, and their fixes

### 3.1 `vercel.json` placement — a regression I introduced

**What happened.** `docs/build/12-HOSTING-DEPLOYMENT.md` §2 stated the Vercel project root was
`apps/web`. Acting on that, I moved `vercel.json` from the repo root into `apps/web` so it
would sit at what I believed was the deployment root. The actual Vercel project — created
through the dashboard, in a team I have no API access to — uses the **repo root**.

**The failure mode.** Vercel resolves `vercel.json` relative to the configured Root Directory.
From `apps/web` it was simply never read. That silently removed the SPA rewrite:

```json
{ "source": "/((?!api).*)", "destination": "/index.html" }
```

Without it, only `/` worked, because only `/` maps to a real file on disk. Every other
URL — `/packages`, `/company/contact`, `/admin` — returned Vercel's own `404: NOT_FOUND`. The
site looked broken in exactly the way a routing bug looks, which sent attention to the router
rather than to hosting config.

**How it was diagnosed** (rather than guessed): `vercel.json` also sets security headers, so
its presence is externally observable.

```bash
curl -sI https://atlas-south-web.vercel.app/ | grep -i x-frame-options
# absent  → vercel.json not being read at all
# DENY    → it is
```

The header was absent. Because a file at `apps/web/vercel.json` *would* have been read had the
root been `apps/web`, the root could only be the repo root.

**Mitigation.** Moved back to the repo root; the header now returns `DENY`. The constraint and
that one-line check are documented in `README.md` and in the hosting doc, both with the
reasoning, so the next person reading "project root: apps/web" doesn't repeat it.

**Lesson recorded:** a spec doc is not evidence about live infrastructure. When they disagree,
the deployment wins.

### 3.2 Every content page rendered a permanent spinner

**What happened.** All 21 service/industry/area pages plus About, Careers and Packages call
`useContentPage(slug)` and render `<PageLoadingFallback />` while `isLoading` is true. That
hook fetched `/api/content/<slug>`. With no backend deployed, that request 404s — so
`isLoading` never resolved to a useful state and the pages showed a spinner **forever**. This
is what "most of the links lead to empty pages" was.

The content existed in the repo the whole time. It was just only reachable by the seed script
(`apps/api/scripts/extracted-content.json`), which writes it to a database that didn't exist.

**Mitigation — bundled content with API overlay.** Moved the content into
`packages/shared/src/content/`:

| File | Contains |
|---|---|
| `extracted-pages.ts` | the 21 service / industry / area records |
| `pages.ts` | the 4 hand-authored records (home, company, careers, packages) |
| `index.ts` | `STATIC_PAGE_CONTENT`, keyed by slug |

`useContentPage` now seeds state from that record **synchronously on first render**, then
overlays the API response if one arrives. Consequences:

- Pages render fully with no backend at all.
- The API stays authoritative when it answers, so admin edits still win.
- `isLoading` is `false` from the first render for any known slug — there is genuinely nothing
  to wait for. It stays `true` only for a slug with no bundled record, where a spinner is
  still the honest answer.
- `error` is only surfaced when there's no fallback, since otherwise the page is complete and
  an error state would be noise.

**Why `.ts` and not the original `.json`:** `packages/shared` compiles with plain `tsc`, which
does **not** copy `.json` files into `dist/`. A JSON import would have resolved in development
and then been missing at runtime in the built consumer — a failure that only appears in
production.

**Cost:** main bundle 643 KB → 711 KB raw (196 → 217 KB gzip), for content the page was going
to fetch anyway.

**Verified** by forcing `/api/*` to 404 in the browser and walking every template:

| Route | Result with API dead |
|---|---|
| `/hard-services/electricals` | Overview, 6 benefits, stat band, CompareSlider, 5 FAQs, related services |
| `/packages` | 3 tiers, £75/£180/£450, PlanFinder |
| `/industries/corporate` | 5,122 chars |
| `/areas/west-london` | 3,380 chars |
| `/company/join-us`, `/company/contact` | render |

---

## 4. Correctness work

### 4.1 Fabricated content removed (recurring theme)

The single most repeated class of defect in this project has been invented facts reaching the
site. Every instance found so far:

| Invented | Reality | Where it was caught |
|---|---|---|
| 4 pricing tiers at £500/£1,200/£2,500/custom | 3 tiers at £75/£180/£450 | Audit screenshot `atlas-sec-packages.png` |
| 3 testimonials with named people + job titles | none exist | Sprint content review |
| "100+ clients", "2,000+ jobs", "40+ team members" | 700+ clients, 12,000+ jobs; headcount unknown | Contradicted the homepage |
| "operating across 15+ Countries" | London & South East | `13-COMPANY-FACTS-VERIFIED.md` |
| A company Vision statement | none exists | §4.2 |

**Mitigation:** `13-COMPANY-FACTS-VERIFIED.md` is the single source for factual claims, and
figures are *derived* (`COMPANY.stats`) rather than retyped per surface. Anything unverified is
either omitted or explicitly flagged, never filled in plausibly.

### 4.2 The Vision nav item

`COMPANY_PAGES` contained `{ id: 'vision', path: '/company#vision' }`. No vision statement
exists in the CMS `company` record or in the verified-facts doc, and About renders no such
section — so the primary nav contained a link to a section that was never built.

Writing one would have meant inventing the company's vision. **Removed the nav item**, with a
comment in `navigation.ts` explaining what's needed to reinstate it. Flagged to the client.

### 4.3 "Coming Soon" pages

Ten nav items are `placeholder: true` (Fire & Safety, Catering, Aviation, Concierge, Waste &
Recycling, and 5 industries). The admin-controlled `PageVisibility` system could hide them, but
its default is *visible* and nothing had ever toggled them off.

Critically, that mechanism **could not** be the fix: `NavVisibilityProvider` fails open when
`/api/nav/visibility` is unreachable, which is precisely the state of a frontend-only deploy.
Any fix relying on it would have worked locally and silently not applied in production.

**Mitigation:** `useVisibleNavItems` now filters `placeholder` items unconditionally, before
the admin-hidden check and independent of any fetch. Then wired that filter into every surface
that had been building lists directly from the nav constants and so bypassed it:

- `Home.tsx` — all three homepage card grids
- `ServiceAreaDetailPage.tsx` — the full service grid
- `Footer.tsx` — filtered admin-hidden items but never checked `placeholder`
- `ServiceDetailPage.tsx` / `IndustryDetailPage.tsx` — "related services" come from CMS content
  as `{label, path}` pairs with no `placeholder` field, so `isPlaceholderPath()` was added to
  `navLookup.ts` to cross-reference by path

**Deliberate exception:** the quote form's service dropdown still lists every service including
placeholders. It's a form option list, not a browse surface — removing an option would stop
someone enquiring about a service that merely lacks its own page yet.

### 4.4 Hash links never scrolled

`/company#mission` did nothing. Two separate faults:

1. No `id="mission"` anchor existed on About.
2. Even with the anchor, the browser's native hash scroll fires at navigation time, before the
   lazy route chunk and content have mounted — so the target doesn't exist yet and nothing
   happens.

**Mitigation:** added the anchor, and a `useHashScroll` hook in `Layout` that retries until the
target appears (3s ceiling). It uses `setTimeout`, **not** `requestAnimationFrame` — rAF is
paused entirely while a tab is hidden, so a hash link opened in a background tab would never
resolve. That distinction was found by testing, not theory.

### 4.5 Link audit, enforced

Dead links were being found by hand, one report at a time. `apps/web/scripts/check-links.mjs`
now diffs **every** internal target (nav constants, CMS `relatedServices`, literal `to="..."`)
against `App.tsx`'s routes *and* the set of rendered anchor `id`s, catching both classes:

- a path with no route → the app's 404
- a `#hash` with no matching `id` → lands at the top of the page instead of the section

Wired into `npm run lint`, so CI fails on a dead link. Currently **40 targets, all resolving.**

It also found a genuine broken link on the way: Plumbing's related services pointed at
`/hard-services/hvac`, a page that was never part of this rebuild. Corrected in the content to
Electricals, completing the reciprocal cross-link the other hard-services pages already had.

### 4.6 `.gitignore` was silently eating documentation

`.gitignore` line 7 is `build/`, intended for build output. It also matches **`docs/build/`**.
Pre-existing docs there were unaffected (an ignore rule can't un-track a tracked file), which
is exactly why it went unnoticed — but every *new* doc was silently refused by `git add`.

Two documents had already been lost this way and were recovered:

- `15-PAYPAL-INTEGRATION.md` (the PayPal architecture doc, written and referenced from 9 source
  files that all pointed at a file not in the repo)
- `14-SPRINT-10-ABM-STRUCTURE.md` (from an earlier sprint)

**Mitigation:** added `!docs/build/` with a comment explaining the trap. Verified both that new
docs are now trackable and that real build output (`apps/web/dist/`) is still ignored. The
PayPal doc was renumbered `14 → 15` to resolve the collision, and all 9 references updated.

---

## 5. Feature work

### 5.1 Commercial/industrial only

The client confirmed **no residential mention anywhere**. This reversed an earlier decision:
`03-HERO-SECTION-SPEC.md` §2 specifies a dual-audience hero ("for your home or your business"),
which had been implemented. That spec section is now stale — noted in the code rather than
silently contradicted.

Changed:
- Hero headline → "for commercial & industrial sites"
- "For Your Home" CTA → **Our Services** / **Our Industries** (both on-page anchors)
- Packages tier descriptions rewritten to commercial equivalents
- `setup-paypal-plans.ts` — had drifted and would have shown *"single-property homeowners"* to
  real payers at PayPal checkout. Now derives name/description/price from `PACKAGES_CONTENT`,
  so it cannot drift again.
- Area copy that read as *offering FM to* residential districts softened; neutral geographic
  description kept.

> ⚠️ **Open conflict for the client.** "Match the original pricing exactly" and "no residential
> mention" genuinely collide: the original tier copy sold to homeowners and landlords, because
> the old site served residential. Resolution taken — **prices and every include/exclude row are
> untouched; only the three description sentences changed.** Reversible either way on request.

### 5.2 The five visual features

Proposed as an interactive artifact first; the client approved all five.

| # | Feature | Where it is now |
|---|---|---|
| 1 | Before/after `CompareSlider` | Plumbing, Electricals, Commercial Cleaning — the 3 services with a real visual transformation. Deliberately not forced onto Aviation/Catering/Concierge, which have no "damaged → fixed" story. |
| 2 | `CoverageMap` | Homepage **and** Contact (where "do you cover my site?" most likely stalls an enquiry) |
| 3 | `StatsMarquee` | Home + About, same component both places |
| 4 | Magnetic CTAs + spotlight cards | `useMagneticHover` on every primary CTA; `useSpotlight` + `.spotlight-card` on **all** card grids via `CardGrid`, plus pricing cards — 13 on the homepage |
| 5 | `PlanFinder` slider | Packages, above the full comparison |

All are keyboard-accessible and no-op under `prefers-reduced-motion`. `CompareSlider` is built
on a real `<input type="range">` rather than hand-rolled pointer logic, so arrow keys, touch
drag and screen-reader announcements come free.

### 5.3 Hero video

Client-supplied clip of a technician inspecting plant-room switchgear.

**Problem 1 — watermark.** The source was AI-generated with a burned-in "KlingAI 3.0" mark. I
flagged this before use; the client chose to proceed. Cropped to `1280×660` (from `1280×720`),
verified watermark-free at multiple timestamps rather than just frame 1, and re-encoded at
CRF 23 — which also cut 8.6 MB → **1.38 MB**.

**Problem 2 — mobile showed only a wall.** The subject sits in the right of the frame; its left
third is flat dark wall. Cropping a landscape frame into a tall mobile viewport with the
default centre `object-position` kept the wall and discarded the shot.

Fixed with `object-right md:object-center`, and measured rather than eyeballed — average
luminance of the visible slice at 375×812:

| Crop | Avg | Range | Reading |
|---|---|---|---|
| `object-center` (before) | 33 | 30–36 | 6 levels — a flat surface |
| `object-right` (after) | 93 | 3–254 | full tonal range — real detail |

The video also plays on mobile now; the poster-only fallback existed for the old 6.9 MB file.

### 5.4 PayPal Subscriptions

Uses the **Subscriptions** API (billing plans + recurring subscriptions), not one-time Orders,
because the original site sells monthly rolling plans. Every endpoint path and header name was
checked against PayPal's own published OpenAPI specs rather than recalled.

Security posture:
- `PAYPAL_CLIENT_SECRET` is server-side only, used solely for the OAuth2 client-credentials
  exchange. `VITE_PAYPAL_CLIENT_ID` is the separate, intentionally public id.
- Checkout UI is PayPal's own, on PayPal's origin — this app never touches a card number,
  keeping it in **PCI DSS SAQ A** scope rather than SAQ D.
- `POST /api/paypal/subscriptions` never trusts the client's claim of success: it re-fetches
  the subscription server-side, requires `ACTIVE`, and checks `plan_id` against an allow-list.
  Tier and price are derived from that verified `plan_id`, never from the request.
- Webhooks are signature-verified via PayPal's Verify Webhook Signature API before anything in
  the body is trusted.
- CSP allow-lists only `paypal.com` / `paypalobjects.com`, with no `'unsafe-inline'`.

Dormant until credentials exist; `/packages` falls back to the quote form. Full detail in
`15-PAYPAL-INTEGRATION.md`.

### 5.5 Favicon

No image tooling (`sharp`, ImageMagick) is available in this environment, so
`build-favicon-ico.mjs` packs the existing 16/32 PNGs into a valid multi-resolution
`favicon.ico` by writing the ICONDIR header directly — the ICO container has supported
embedded PNG frames since Vista, so this is lossless and re-encodes nothing. Added
`site.webmanifest` and `theme-color`. SVG favicon skipped: no vector source for the mark.

### 5.6 Imagery

All photography is Unsplash, served from their CDN with `auto=format`. Every id was taken from
a search result page excluding sponsored iStock and paid Unsplash+ results, and each URL
confirmed to return HTTP 200. `ALL_PHOTO_IDS` exports the full set for verification.

Each page has a subject-matched primary image plus a **distinct** alternate that crossfades on
hover (`HoverImage`, pure CSS via the existing `group`). Two early alternate candidates turned
out to already be the site's primary/panel images and were replaced rather than shipped as fake
alternates.

`03-HERO-SECTION-SPEC.md` §3 specified a Cloudinary round-trip. Cloudinary was never
provisioned (the `CLOUDINARY_*` vars are empty), so this is a **known deviation**, not an
oversight.

---

## 6. Runbook — standing up Render + Neon

Everything code-side is committed. What remains needs account access, which is yours: I can't
create accounts or enter credentials.

### 6.1 Neon

1. Create a Neon project, region **EU (London)** or **EU Central**, to sit near Render's
   `frankfurt` region and the user base.
2. Name the default branch `main`.
3. Copy the **pooled** connection string (the host containing `-pooler`) and append
   `?sslmode=require`:
   ```
   postgresql://USER:PASSWORD@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   Pooled matters because Render runs a persistent process that can otherwise exhaust Postgres
   connections; `sslmode=require` matters because Neon rejects plaintext and the resulting
   error doesn't mention TLS.

### 6.2 Render

1. Dashboard → **New → Blueprint**, connect `Junior-Reactive-Solutions/Atlas-South`. It reads
   [`render.yaml`](../../render.yaml) and pre-fills service type, region, build/start commands
   and the health check.
2. Fill the prompted (`sync: false`) variables:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | the Neon string from §6.1 |
   | `CORS_ALLOWED_ORIGIN` | `https://atlas-south-web.vercel.app` |
   | `ADMIN_SEED_EMAIL` | the first admin's email address |
   | `RESEND_API_KEY` | optional — emails are skipped, not failed, without it |
   | `PAYPAL_*` | leave blank for now (§5.4) |

   `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are `generateValue: true` — Render generates
   256-bit values, comfortably over the 32-char minimum zod enforces. Don't set them by hand.
3. Deploy. `prisma migrate deploy` runs in the build step and creates all 5 migrations' tables.
4. Confirm health: `curl -sI https://<service>.onrender.com/api/health` → `200`.

### 6.3 Seed the fresh database

From Render → **Shell** on the service (each is idempotent):

```bash
npm run seed:content    --workspace=apps/api   # 25 pages
npm run seed:visibility --workspace=apps/api
npm run seed:admin      --workspace=apps/api   # uses ADMIN_SEED_EMAIL; prints a temp password
```

Then log in at `/admin/login` and change the password immediately — the flow forces this.

### 6.4 Point the frontend at it

`vercel.json` currently proxies `/api/*` to `https://atlas-south-api.onrender.com`. **If your
Render service name differs, update that rewrite and the `connect-src` entry in the CSP in the
same file**, then redeploy. Both are in one file specifically so they can't drift apart.

### 6.5 Verify end to end

- Submit the contact form → row appears in admin → Enquiries
- `/admin/login` authenticates
- Edit a page in admin → the public page reflects it (proves the API overlay beats the bundled
  fallback, §3.2)

---

## 7. What's left

**Blocking a real launch**

1. **Render + Neon** — §6.
2. **Real photography.** Everything is stock. ABM (the calibration reference) uses its own
   people and sites, and that's a large part of why it reads as credible. Single highest-value
   content task. One-file swap: `apps/web/src/content/imagery.ts`.
3. **Company registration number + VAT number.** Terms and Privacy ship with
   `[Company registration number — TBC]`. Not published anywhere and not inventable —
   `13-COMPANY-FACTS-VERIFIED.md` §⚠ 1–2.
4. **Confirm or drop the two flagged claims** in `contact-us.html` boilerplate: "30% discount"
   and the unattributed 60%-downtime testimonial. Currently excluded.

**Client decisions needed**

5. **Vision statement** — nav item removed until real copy exists (§4.2).
6. **Packages tier wording** — the residential/original conflict in §5.1.
7. **Real headcount**, if the About timeline should state one.
8. **Social profiles** for the footer `sameAs` schema — none found beyond WhatsApp.
9. **`020 335 52797`** — the audit found two different phone numbers. Only `07778 858278` is
   used. Confirm the landline is genuinely dead or should be reinstated.

**Engineering backlog**

10. **Main bundle is 711 KB** (217 KB gzip) and warns at build. Route chunks are already split;
    the remaining weight is vendor + bundled content. Worth `manualChunks` before launch.
11. **PayPal end-to-end test** in sandbox once credentials exist — the code path has never run
    against a real PayPal response.
12. **Rate limiting is in-memory**, so it doesn't share state across instances. Fine on one
    Render instance; needs Redis before scaling out (`07-SECURITY.md` §3).
13. **Fire & Safety and the other 9 placeholders** need real content, then flip
    `placeholder: false` — they'll appear automatically everywhere (§4.3).
14. **Cloudinary** if the spec'd image pipeline is still wanted (§5.6).

---

## 8. Environment-specific notes for whoever picks this up

Things that cost time and aren't obvious:

- **Local Postgres** is a Docker container on **5434**, not 5432:
  `docker start atlas_south_pg`. Both dev servers and the container stop between sessions.
- **The browser automation pane runs backgrounded** (`document.hidden === true`). This makes
  scrolling silently inert — even *instant* `scrollIntoView` leaves `scrollY` at 0 — and pauses
  `requestAnimationFrame`. CSS `:hover` also can't be driven synthetically. Verify these by
  asserting on computed styles, compiled CSS rules or spies instead, or the conclusion will be
  a false negative. This wasted real time twice.
- **`npm run lint` on `apps/web` can exceed 2 minutes.** Not hung.
- **`packages/shared` must be rebuilt** (`npm run build --workspace=packages/shared`) before
  either app sees a change to it — the apps import from `dist/`.
- **The content API sets `Cache-Control: public, max-age=300`.** After re-seeding, a browser
  will serve stale content for 5 minutes; use a cache-busting query param to check changes.
