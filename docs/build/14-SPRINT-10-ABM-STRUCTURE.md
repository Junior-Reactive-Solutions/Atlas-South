# Sprint 10 — ABM Structure Mirror, Photography, Page Visibility

Record of what shipped in [PR #33](https://github.com/Junior-Reactive-Solutions/Atlas-South/pull/33),
merged to `main` on 2026-08-12. 63 files changed, +2,741 / −383.

This is a "what and why" record, not a spec. Where it contradicts an earlier spec document,
this file describes what the code actually does.

---

## 1. Why this sprint happened

The client reviewed the site and said it was "doing something completely different" from the
inspiration site, `abm.co.uk`.

Comparing the two directly, that was fair, but the cause was not the content:

- The **industry and service copy was already good** — specific, sector-aware, written
  around real operational constraints (infection control zones, clinical scheduling, trading
  hours).
- The **presentation** was the problem. Every detail page rendered that copy as markdown
  prose in a narrow centred column behind a 40px outline icon, which reads as documentation.
  The homepage was a four-card teaser that ended in a block reading "COMING SOON".
- There was **exactly one photograph on the entire public site** (the hero). ABM uses imagery
  in every section.

The client's decision, made explicitly, was to **mirror ABM's structure section-for-section
in Atlas South's brand** rather than keep our information architecture and lift only the
visual treatment.

---

## 2. Section components — `apps/web/src/components/sections/`

New shared building blocks. **Build new pages from these**; do not hand-roll sections. The
previous drift in spacing and type scale between templates came from each page inventing its
own markup.

| Component | File | Purpose |
|---|---|---|
| `SectionHeading` | `SectionHeading.tsx` | Eyebrow + title + sub-copy triad. `tone="light"` for dark panels. |
| `PhotoHero` | `PhotoHero.tsx` | Full-bleed photo hero with navy gradient wash and one CTA. |
| `BenefitPanels` | `BenefitPanels.tsx` | Alternating image/text panels — the workhorse block. |
| `StatBand` | `StatBand.tsx` | Navy proof-point band. Counts up on entry. |
| `CtaBand` | `CtaBand.tsx` | "Let's talk" band, `tint` or `navy`. Keeps the phone number beside the CTA. |
| `CardGrid` | `CardGrid.tsx` | Image/icon card grid, respects page visibility. |
| `ScrollProgress` | `ScrollProgress.tsx` | 2px reading-progress bar for long pages. |
| `SectionNav` | `SectionNav.tsx` | Sticky in-page jump nav with scroll-tracked active link. |
| `ServiceNetwork` | `ServiceNetwork.tsx` | Scroll-reactive services panel (see §7). |

All are re-exported from `sections/index.ts`.

### Brand-colour note

`brand-blue` (`#0078FC`) is barred from text by `01-BRAND-SYSTEM.md` §2 for failing AA at
4.12:1. It is used in `ServiceNetwork` and `StatBand` **as graphic strokes and borders only**,
which is exactly what that document reserves it for. Every text colour on these components is
`accent-blue`, `navy`, `slate` or white.

---

## 3. Detail templates rebuilt — 21 pages

Three templates were rewritten to one shared section order:

```
photo hero → section nav → overview → alternating panels → stat band
→ CTA band → capability/FAQ block → related cards → quote form
```

- `apps/web/src/components/services/ServiceDetailPage.tsx` — 11 service pages
- `apps/web/src/components/industries/IndustryDetailPage.tsx` — 4 industry pages
- `apps/web/src/components/areas/ServiceAreaDetailPage.tsx` — 6 area pages

### No copy was rewritten, and no content migration was needed

This is the part worth remembering. `apps/web/src/lib/parseBulletPanels.ts` converts the
existing markdown of the form:

```
Some lead-in sentence:
- **Zero-downtime mandate:** Unlike a typical office, you cannot simply...
- **Sterility and infection control:** Service engineers must understand...
```

into lead text plus title/description pairs for `BenefitPanels`. It returns `null` when the
markdown does not fit that shape, and the template falls back to rendering prose.

Verified against all four industries: three parse both `challenges` and `ourApproach`;
`corporate` has trailing prose after its bullets, so its approach block correctly falls back.

Service pages needed no parsing at all — `features` already carried `{icon, title, description}`.

**Reuse this technique** before adding new CMS fields for a layout change.

`apps/web/src/lib/navLookup.ts` maps a public path back to its nav id, so related-service
links (which store only label + path) can participate in the visibility system.

---

## 4. Homepage rebuilt as a portal — `apps/web/src/pages/Home.tsx`

New order, mirroring ABM's homepage:

```
hero → brand statement → ServiceNetwork → industries grid → hard services
→ soft services → stat band → why-us → careers → CTA band → quote form
```

Removed:

- The **"COMING SOON — Soft Services · Industries"** block. Both now have real sections.
- The **`Testimonials` section** (see §8).
- The **per-service filler copy** — `Expert ${service.label.toLowerCase()} services for
  facilities of all sizes.` repeated with the noun swapped. Cards now carry no description
  rather than a generated one; real teaser copy belongs in the CMS.

The `WHY_US` block is built entirely from `COMPANY` constants (certifications, insurance
value, founding year, coverage) so it contains no unverifiable claims.

---

## 5. Page visibility — hide pages from the admin panel

Replaces the ten "Coming soon" badges that were live in the navigation.

### Data

`PageVisibility` in `apps/api/prisma/schema.prisma`, migration
`20260812071331_add_page_visibility`. Keyed by **nav item id**, not ContentPage slug, because
the five unbuilt industries have no ContentPage row at all — one table therefore covers both
content-backed pages and nav-only entries. Absence of a row means visible.

### API

| Route | File | Auth |
|---|---|---|
| `GET /api/nav/visibility` | `apps/api/src/routes/visibility.ts` | public |
| `GET /api/admin/visibility` | `apps/api/src/routes/admin/visibility.ts` | `authMiddleware` |
| `PATCH /api/admin/visibility/:navId` | same | `authMiddleware` |

Mounted in `apps/api/src/index.ts`; admin routes sit behind `adminApiLimiter`.

### Security decisions

These were deliberate and should not be relaxed without thought:

1. **Hiding is enforced on the content endpoint, not just the nav.**
   `apps/api/src/routes/content.ts` returns 404 for a hidden slug, using the *same response
   body* as an unpublished page so it cannot be used to distinguish "hidden" from "never
   existed". Filtering the menu alone would leave the content readable to anyone holding the
   URL — security by obscurity.

2. **`navId` is validated against an allowlist** derived from the shared navigation constants
   (`apps/api/src/lib/navIds.ts`). Without it, an authenticated caller could write unbounded
   arbitrary rows.

3. **Company, contact and legal pages are absent from that allowlist**, so they cannot be
   hidden through the API at all. Removing a privacy policy or terms page from a live
   commercial site is a UK GDPR Art. 13 / PECR problem, so the safest design is no switch
   rather than a switch nobody should press. The admin UI does not offer them either.

4. **Every toggle is written to `AdminAuditLog`** with admin id and IP.

5. **The public endpoint fails open, the content endpoint fails closed.** If the database is
   unreachable the site still renders its full navigation rather than blanking it; the content
   endpoint still refuses to serve hidden pages.

Verified: hidden content 404s, visible content 200s, admin endpoints 401 without a token, a
non-toggleable id 400s, a malformed body 400s, a valid toggle round-trips and writes an audit
row.

### Frontend

- `apps/web/src/hooks/useNavVisibility.tsx` — provider fetches once, shares across the tree.
  Mounted in `main.tsx`. Fails open.
- Filtering lives **inside** `NavDropdown`, `MobileDrawerSection` (Header), `FooterColumn`
  (Footer) and `CardGrid`, so every call site is covered without each having to remember.
- `PageStub` 404s when its nav id is hidden — this is where hiding is enforced for the five
  industries that have no content row. It also skips setting `document.title` when hidden, so
  the tab doesn't announce a page being rendered as "not found".

### Seeding

`npm run seed:visibility --workspace=apps/api` hides every nav item still marked
`placeholder: true` — ten pages: `fire-safety`, `catering`, `aviation`, `concierge`,
`waste-recycling`, `government-public-sector`, `oil-gas`, `manufacturing`, `data-centres`,
`venues`.

**Re-running re-hides anything an admin has since revealed.** It is a one-time bootstrap, not
something to wire into deploys.

---

## 6. Photography — `apps/web/src/content/imagery.ts`

One module decides every page's photograph, keyed by content slug. Swapping in the client's
own photography is a single-file edit.

- 21 per-page heroes, each chosen for its specific subject (an electrician wiring a panel, a
  break-glass alarm point, a hospital corridor, separated recycling bins, St Paul's for
  Central London, a village street for Surrey & Kent), plus a six-image rotation for benefit
  panels.
- All ids were taken from Unsplash search results **excluding sponsored iStock placements and
  Unsplash+ (paid) results**, each URL confirmed HTTP 200, and every image reviewed visually
  on a generated contact sheet against the page it was assigned to.
- Served from Unsplash's CDN with `auto=format`, matching the pattern already shipped in
  `HeroCarousel`. `03-HERO-SECTION-SPEC.md` specced a Cloudinary round-trip, but **Cloudinary
  was never provisioned** — the `CLOUDINARY_*` env vars are empty. The API CSP already allows
  `images.unsplash.com`.

> **Open item.** These are stock. ABM's credibility comes substantially from using its own
> photography of its own people and sites. Replacing these with real Atlas South photography
> remains the highest-value content task, and is now a one-file change.

---

## 7. Motion and interaction

### The animation system had never run

`useAnimationScope(self => self?.add('reveal', ...))` **registers a callable method** on an
anime.js v4 scope rather than running it. Nothing in the app ever called `.reveal()`, so every
scroll-reveal in the codebase was dead code and the site rendered entirely static.

Replaced by `packages/design-system/src/hooks/useScrollReveal.ts`:

- Reveals on `IntersectionObserver` intersection, for real.
- Applies the hidden state **itself**, so content can never be stranded invisible if JS fails
  — no CSS hides it up front.
- Clears its inline styles on completion, so a later hover transform isn't fought.
- Complete no-op under `prefers-reduced-motion` — the reduced-motion path is the *no-op* path,
  not a different animation.
- Triggers on a `rootMargin`, **not** an IntersectionObserver `threshold`. These containers
  run ~4000px against an ~800px viewport, so they can never exceed ~14% visible and a
  fractional threshold would never fire. This was a real bug caught during verification.

Migrated: `BenefitPanels`, `CardGrid`, `StatBand`. Admin pages still use the old no-op pattern
and are **not** yet migrated.

### Other additions

- **`ScrollProgress`** — 2px accent bar, rAF-throttled, hidden entirely under reduced motion.
- **`SectionNav`** — sticky jump links, active section tracked by IntersectionObserver so it
  stays correct when panels differ in height and images load late. Hidden below `lg`.
- **Hero zoom** — 20s single-pass 1.0→1.08 (`hero-zoom` keyframes in `tailwind.config.js`),
  slow enough to register as depth rather than animation. `motion-reduce:animate-none`.
- **Stat counters** — count up on entry. `24/7` is deliberately excluded by
  `parseCountable()`; counting to 24 and appending `/7` would be a bug dressed as an animation.

### `ServiceNetwork` — the scroll-reactive panel

Modelled on ABM's homepage panel, which floats circular portrait bubbles along thin curved
lines over navy and drifts them on scroll. Ours substitutes **service icons** for portraits, so
the section says something about the offering, and each node is a **real link** to that service.

Motion has two components:

1. **Position drift** — a pure function of how far the panel has travelled through the
   viewport. Because it is position-based, scrolling up retraces the path exactly backwards
   rather than merely stopping.
2. **Velocity lag** — an offset proportional to current scroll speed that decays to zero when
   you stop. This is what makes it feel reactive. Nodes with negative `lag` are pushed
   *against* the scroll direction, so the group splits and crosses rather than sliding as one
   sheet.

Because component 2 decays to nothing when scrolling stops, nodes always settle somewhere
stable — **this is what keeps them clickable**, and it shaped the design. A link that drifts
under a stationary cursor is worse than no animation.

**Responsive behaviour.** The same motion runs at every screen size, driving a different
layout:

| Breakpoint | Layout | Motion applied to | Drift | Velocity cap | Lag scale |
|---|---|---|---|---|---|
| `lg`+ | scattered nodes on curves | each node | 85–190px | 70px | 3 |
| `< lg` | 2/3-column grid | each **column** | 20–34px | 20px | 1.1 |

Small screens animate **per column, not per cell**. Grid cells sit in normal flow, so
per-cell offsets would let vertically-adjacent cells slide into each other. Driving whole
columns means cells only ever share a column with cells moving identically, so **two cells
cannot collide** — structural, not a tuned value.

Touch was tuned separately because the velocity *result* is capped, not just its input: touch
reaches much higher per-frame deltas than a wheel and momentum sustains them after the finger
lifts.

Column count derives from the same breakpoints as the grid's own `grid-cols-2 sm:grid-cols-3`,
so the two cannot drift apart. Crossing a breakpoint clears **both** element sets first —
otherwise whichever set stopped being driven keeps its last transform, leaving a cell
permanently nudged after a rotate.

Performance: one rAF loop for the whole panel that **parks itself once motion settles**, only
runs while the panel is on screen, transform-only throughout.

Two SVG curve variants (landscape 1200×700 for `lg`+, portrait 400×900 below) — squeezing the
landscape network into a tall phone panel would either distort the curves into near-vertical
streaks or crop away the interesting part.

---

## 8. Content integrity fixes

Two things were live that should not have been.

### Fabricated testimonials — removed

`apps/web/src/components/home/Testimonials.tsx` (deleted) contained three quotes attributed to
named people with job titles and specific operational claims ("engineer on site within 40
minutes"). A code comment marked them as placeholder; the rendered page did not. They appear
in **no spec, doc or content file** — they were invented during Sprint 3 content seeding.

The section returns when the client supplies real, attributable quotes.

### Contradictory statistics — resolved

The site showed two different sets of figures:

| Surface | Clients | Jobs | Source |
|---|---|---|---|
| Homepage / `COMPANY.stats` | 700+ | 12,000+ | **Verified** from the client's live site (`13-COMPANY-FACTS-VERIFIED.md`) |
| About page (seeded) | 100+ | 2,000+ | No provenance — invented during seeding |

The About page now renders the shared `StatBand`, which derives from `COMPANY.stats`. The
seeded `stats` array is emptied and the timeline entry claiming "over 100 clients with 40+
team members" was corrected. Team headcount was **dropped rather than guessed**.

> **Still unverified and live:** the About page's team bios ("15+ years in the facilities
> sector", "Master tradesperson with specialized certifications…") and the 2019 timeline entry
> ("Grew from 5 to 15 team members"). These are claims about real people and need client
> confirmation.

**Rule going forward:** derive proof numbers from `COMPANY.stats`; never type them where they
are displayed. That is exactly how the homepage and About page drifted apart.

---

## 9. Bugs found and fixed in passing

| Bug | Where | Impact |
|---|---|---|
| Scroll reveals never ran | codebase-wide (see §7) | Site rendered entirely static |
| Reveal threshold unreachable | `useScrollReveal` | Tall containers would never animate |
| `h1`–`h4` forced to `text-navy` globally | `index.css` | **"Get a free quote" — the conversion heading on every page — was invisible**, navy on navy. Also "Enquiry submitted" and the stat band heading. Fixed by explicit `text-white` on dark panels. |
| Content pages spun forever on API error | all 21 detail pages | Guard was `isLoading \|\| !data`, so a 404 never resolved. Now renders `NotFound`. |
| Area page used a full sentence as `<h2>` | `ServiceAreaDetailPage` | Response-time sentence rendered as an unwieldy all-caps paragraph. Moved to sub-copy. |

The invisible-heading bug was found by comparing computed text colour against computed section
background across the page; that check is worth repeating after any dark-panel work.

---

## 10. Local development

`.env` points `DATABASE_URL` at `localhost:5434`. Without a database, every content page hangs
on "Loading…" (and now renders `NotFound`).

```bash
docker run -d --name atlas_south_pg \
  -e POSTGRES_USER=atlas -e POSTGRES_PASSWORD=atlas_dev_pw -e POSTGRES_DB=atlas_south \
  -p 5434:5432 postgres:16-alpine
```

```bash
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
```

The seed npm scripts do **not** pick up the root `.env`, so pass it explicitly:

```bash
DATABASE_URL="postgresql://atlas:atlas_dev_pw@localhost:5434/atlas_south" npx tsx apps/api/scripts/seed-content.ts
```

> `/api/content/:slug` sets `Cache-Control: public, max-age=300`. After re-seeding, the browser
> serves stale content for five minutes — **verify at the API, not the page.**

---

## 11. Outstanding — needs action

### Production database

Code is deployed; these rows are not. Both need running once against production:

1. `seed:visibility` — otherwise the ten placeholder pages remain **visible** in production.
2. The `seed-content.ts` corrections (About stats and timeline) need a re-seed or an
   equivalent CMS edit to reach the live About page.

### Content

- **Real Atlas South photography** to replace the stock set — highest value remaining.
- Real client testimonials, if the section is wanted back.
- Confirmation or removal of the About page team bios and 2019 timeline entry.
- Content for the ten hidden pages, revealed individually via Admin → Visibility as each lands.

### Technical follow-ups

- Admin pages still use the dead `useAnimationScope` reveal pattern; migrate to
  `useScrollReveal` or remove the dead calls.
- Main bundle is ~615KB (188KB gzipped) and exceeds Vite's 500KB warning. Not addressed here.
