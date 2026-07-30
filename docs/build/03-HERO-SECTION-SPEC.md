# Hero Section — Detailed Spec

⭐ **Client priority.** The client explicitly called this out as a section that must not
be shortchanged. Every decision below traces back either to that instruction, to the
audit's hero findings, or to the ABM calibration point established in the original
comparative analysis.

## 1. What the audit said was wrong, and what this fixes

| Audit finding | Fix in this spec |
|---|---|
| No photography anywhere; emoji-based service cards inside the hero | Real photography as the hero background (§3), zero emoji |
| Three competing CTAs (Book / WhatsApp / View Services) | One visually dominant primary CTA (§4); phone/WhatsApp remain available but demoted to secondary/header-level |
| WhatsApp CTA fails contrast at 1.98:1; "FIRST TIME." headline fails contrast | All hero text/buttons use the verified-AA tokens from [`01-BRAND-SYSTEM.md`](01-BRAND-SYSTEM.md) — no colour in the hero is chosen outside that token set |
| Mobile homepage hero contributes heavily to a 15,168px scroll (vs ABM's 8,189px) | Hero fits one mobile viewport (§5) |
| 26 unlabelled form inputs; no landmark regions | Hero itself carries no form (forms live below the fold) — nav/header landmarks per [`06-PAGE-SPECIFICATIONS.md`](06-PAGE-SPECIFICATIONS.md) |

## 2. Audience framing (per confirmed decision: residential + B2B coexist)

Per the resolved scope decision in `docs/agile/user-stories.md`, the residential
homeowner offering survives alongside the new enterprise Hard/Soft Services structure.
The hero must speak to both without diluting into vague language:

- **Headline** states the breadth plainly: trades and facilities services, for homes and
  businesses, across London & the South East.
- **Sub-headline** carries the trust stats (established 2018, 700+ clients, 12k+ jobs —
  audit-confirmed strengths, retained).
- **Dual path below the primary CTA**: two smaller, clearly secondary links —
  "For Your Home" (→ Packages/residential) and "For Your Business" (→ Hard/Soft
  Services) — so both audiences self-select within 2 seconds without the hero itself
  trying to serve two headlines at once.

Draft copy (subject to client sign-off, not a placeholder — this uses only verified
facts from [`13-COMPANY-FACTS-VERIFIED.md`](13-COMPANY-FACTS-VERIFIED.md)):

> **Trades and facilities services you can trust — for your home or your business.**
> Atlas South has delivered 12,000+ jobs across London and the South East since 2018,
> from emergency call-outs to fully managed facilities contracts.
>
> [Get a Free Quote] ← primary CTA
>
> For Your Home →  ·  For Your Business →

## 3. Background imagery

Client requirement: real imagery in the hero background, sourced online, fitting the
site's look and feel. Candidates below are all confirmed **free-to-use, no attribution
required (standard Unsplash License)** — verified by checking each listing was not marked
"For Unsplash+" (which would be a paid/licensed-only image).

| Priority | Image | Why it fits |
|---|---|---|
| **1st choice** | Unsplash photo `a-couple-of-men-standing-next-to-each-other-ZYUcxbMeaIY` (Glenov Brankovic) | Two people in workwear — matches ABM's calibration point of "real people doing real work" rather than an empty building; reads credible for both a homeowner and an FM buyer |
| **2nd choice** | Unsplash photo `a-group-of-men-standing-next-to-each-other-in-front-of-a-building-qpdoTHwqkVc` (Glenov Brankovic) | Team-in-front-of-building framing, slightly more corporate/FM-leaning — good alternate if the client wants a more enterprise-first feel |
| **3rd choice / secondary use** | Unsplash photo `blue-and-white-glass-building-under-blue-sky-during-daytime-D5l_ka0rbEo` (ETA+) | Architecture-only shot whose actual colours (blue glass, white trim, blue sky) happen to match the brand palette almost exactly — strong candidate for the Facilities Management or Company page hero if a people-shot doesn't fit there |

Sources: [Unsplash — Facility Management photos](https://unsplash.com/s/photos/facility-management)

**Process:** download the chosen image at full resolution from its Unsplash permalink,
upload to Cloudinary (per [`12-HOSTING-DEPLOYMENT.md`](12-HOSTING-DEPLOYMENT.md)) rather
than hotlinking Unsplash's CDN, and serve via Cloudinary's automatic format/quality
(`f_auto,q_auto`) so the image is WebP/AVIF to modern browsers without a manual export
step. This keeps the audit-confirmed lean performance profile intact even after adding
the first real photography the site has ever had.

**Treatment:** a navy gradient overlay (`--color-navy` at ~70% opacity, transparent at the
top-right) sits between the image and the text, so the dark-panel 60/30/10 recipe from
`01-BRAND-SYSTEM.md` still holds — the photo reads as texture within the 60% navy
dominant field, not as a fourth competing colour.

## 4. Layout & CTA hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  [header nav — see 06-PAGE-SPECIFICATIONS.md]                │
├─────────────────────────────────────────────────────────────┤
│  Eyebrow: "LONDON & SOUTH EAST · EST. 2018 · 24/7"           │
│  H1: Trades and facilities services you can trust —          │
│      for your home or your business.                         │
│  Sub-copy: 12,000+ jobs since 2018...                         │
│                                                                │
│  [ GET A FREE QUOTE ]  ← one primary CTA, --color-accent-blue │
│  For Your Home →      For Your Business →  ← secondary text  │
│                                                                │
│  700+ clients   24/7 cover   12k+ jobs   Est. 2018             │
│  (stat row — demoted below the CTA, restyled so it supports   │
│   rather than competes, per audit finding B5)                 │
├─────────────────────────────────────────────────────────────┤
│  photograph + navy gradient overlay, full-bleed background   │
└─────────────────────────────────────────────────────────────┘
```

Phone/WhatsApp are **not** hero-level CTAs — they live in the persistent header (per
Epic A in `user-stories.md`), always visible without scrolling, so they're never actually
lost, just no longer competing with "Get a Free Quote" for the single moment of
first-impression attention.

## 5. Mobile behaviour

Target: the hero fits within roughly 1–1.2 mobile viewports, not the current site's
disproportionate contributor to a near-18-screen homepage. Achieved by:
- Stat row collapses to a single horizontal scroll strip or 2×2 compact grid, not four
  stacked blocks.
- Background image crops to a portrait-friendly focal point (Cloudinary's `g_auto`
  gravity crop) rather than the same landscape crop as desktop.
- Secondary "For Your Home / For Your Business" links sit side-by-side, not stacked.

## 6. Animation choreography (references `02-ANIMATION-SYSTEM.md` tokens — no new timings invented here)

Sequenced on a single `createTimeline()` so it reads as one deliberate entrance rather
than several elements popping independently:

1. Eyebrow label: fade + rise, `DURATION.base`
2. Headline: line-by-line `stagger(80)` fade-up, `DURATION.hero`, starts ~100ms after eyebrow
3. Sub-copy: fade + rise, starts ~150ms after headline settles
4. Primary CTA: fade + scale-in (0.96→1), starts ~100ms after sub-copy
5. Secondary links: simple fade, alongside primary CTA
6. Stat row: count-up animation (per the stat-counter row in `02-ANIMATION-SYSTEM.md`),
   starts once the CTA has appeared, not on initial scroll (this is the one hero element
   allowed to animate on load rather than on scroll-into-view, since it's already in the
   first viewport)

Respect `prefers-reduced-motion` exactly as specified in `02-ANIMATION-SYSTEM.md` §4 — the
hero has the most motion of any section on the site, so it's the most important place to
honour that setting correctly.

## 7. Accessibility checklist for this section specifically

- [ ] Background image has no text baked into the photo itself — all text is real,
      selectable HTML, per the audit's alt-text/contrast findings.
- [ ] Gradient overlay strength is tuned so headline text measures ≥4.5:1 against the
      busiest part of the underlying photo, checked at both the desktop and mobile crop.
- [ ] `<h1>` is exactly the hero headline — one per page, matching the audit's confirmed
      strength (the current site already gets this right; don't regress it).
- [ ] Hero sits inside the page's single `<main>` landmark (audit: currently missing).
