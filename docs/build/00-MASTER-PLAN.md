# Master Build Plan — Atlas South Website Rebuild

Status: **planning complete, awaiting go-ahead to start building.** This is the
top-level index for everything in `docs/build/` — read this first, then follow the links
into the specific area you're working on.

## How this folder relates to the rest of `docs/`

```
docs/
├── agile/    — WHY and WHAT: vision, gap analysis, product backlog, user stories
├── audit/     — the evidence base: full technical/SEO/design audit + ABM comparison
└── build/      — HOW: this folder. Concrete specs to build against.
```

Nothing in `docs/build/` contradicts `docs/agile/user-stories.md` — this folder is the
technical translation of those stories, not a competing plan. Where a scope decision was
needed, it was resolved in `user-stories.md` already (residential survives, placeholder
content strategy, Handyman/Painting mapping) and this folder builds on those resolutions
rather than re-litigating them.

## The build documents

| # | Document | Covers |
|---|---|---|
| 01 | [Brand System](01-BRAND-SYSTEM.md) | Colour palette (extracted from the logo, WCAG-verified), 60/30/10 application rules, typography, icon system (no emoji) |
| 02 | [Animation System](02-ANIMATION-SYSTEM.md) | anime.js v4 integration, shared motion tokens, component-by-component animation catalogue |
| 03 | [Hero Section Spec](03-HERO-SECTION-SPEC.md) ⭐ | Client-priority section — copy, real photography sourcing, layout, CTA hierarchy, animation choreography |
| 04 | [Footer Spec](04-FOOTER-SPEC.md) ⭐ | Client-priority section — full footer IA (~34 pages), trust bar, schema, accessibility |
| 05 | [Architecture & Stack](05-ARCHITECTURE-AND-STACK.md) | React/Vite + Node/TS/Express/Prisma decision, monorepo layout, port map (9000 series, verified free), env vars, data model |
| 06 | [Page Specifications](06-PAGE-SPECIFICATIONS.md) | Master page template + every one of the ~35 pages, its route, schema, content source |
| 07 | [Security](07-SECURITY.md) | Headers, input validation, rate limiting, auth, dependency hygiene, monitoring |
| 08 | [Admin Panel Spec](08-ADMIN-PANEL-SPEC.md) | Auth, credential provisioning process, analytics tracked, enquiry/order pipeline, dashboard views |
| 09 | [SEO & Performance Checklist](09-SEO-PERFORMANCE-CHECKLIST.md) | Platform-agnostic, tool-agnostic scoring targets and mechanical checklist |
| 10 | [Legal Content Plan](10-LEGAL-CONTENT-PLAN.md) | Terms/Privacy/Cookie structure, named data processors, retention periods, rights-reserved language |
| 11 | [Git & GitHub Workflow](11-GIT-GITHUB-WORKFLOW.md) | Branch strategy, PRs, issues, labels, milestones, Actions, tags/releases, README/LICENSE/.gitignore |
| 12 | [Hosting & Deployment](12-HOSTING-DEPLOYMENT.md) | Vercel/Render/Neon/Cloudinary/Resend wiring, environment promotion flow |
| 13 | [Company Facts — Verified](13-COMPANY-FACTS-VERIFIED.md) | Single source of truth for NAP/legal facts; flags what still needs client confirmation |

## Research performed to produce this plan (so it's traceable, not assumed)

- **Logo colours** were not eyeballed — sampled programmatically from
  `assets/brand/atlas-south-logo.jpg` (~48,000 sample points), then verified against
  WCAG 2.1 contrast math before being written into `01-BRAND-SYSTEM.md`. One raw logo
  colour (`#0078FC`) was found to fail AA for text/button use and was given an accessible
  variant rather than used as-is.
- **anime.js v4's actual current API** was pulled from the live documentation
  (`animejs.com`) rather than assumed from prior knowledge — package name, import syntax,
  and the official React integration pattern are quoted directly in
  `02-ANIMATION-SYSTEM.md`.
- **Hero imagery candidates** are real, verified-free-license Unsplash photos (checked
  each was not a paid "Unsplash+" listing), not a generic instruction to "find an image
  later."
- **Company facts** were re-verified against the live site during this planning pass,
  which surfaced a 14th page (`contact-us.html`) missing from the original audit's
  sitemap-based page count, and flagged that page's content as likely unedited template
  boilerplate (a "15+ Countries" claim, an unattributed testimonial) — see
  `13-COMPANY-FACTS-VERIFIED.md` §"Flagged for client confirmation."
- **The GitHub repo was checked, not assumed** — confirmed to exist, public, empty, at
  the exact URL given, before `11-GIT-GITHUB-WORKFLOW.md` was written against it.
- **Port availability was checked, not assumed** — 9000–9010 confirmed free on this
  machine before being fixed as the project's permanent port range.

## Sequencing — how the phases in `docs/audit`'s roadmap map onto this plan

The original audit (§10) proposed a 9-sprint roadmap. This plan doesn't replace that
sequencing, it's the technical detail underneath it:

| Sprint (from the audit roadmap) | What from `docs/build/` gets used |
|---|---|
| Sprint 1 — Measurement & quick wins | `05` (project scaffolding, port map, env setup), `07` §1/§5 (headers, dependency hygiene), `09` (baseline checklist), `11` (repo setup, branch protection, CI skeleton) |
| Sprint 2 — Design system & architecture | `01` (brand tokens as real code), `02` (animation hook), `05` (monorepo build tooling) |
| Sprint 3 — Homepage rebuild | `03` (hero), `01`/`02` applied to the homepage specifically |
| Sprint 4 — Service pages | `06` Hard/Soft Services rows, `01`/`02` applied per service template |
| Sprint 5 — Industry pages | `06` Industries rows |
| Sprint 6 — Local & proof | `06` Service Areas rows |
| Sprint 7 — Conversion | `08` (enquiry pipeline wiring), `12` (Resend flows) |
| Sprint 8 — Accessibility & performance | `09` full re-audit, `07` full security pass |
| Sprint 9 — Content ops & launch | `10` (legal pages finalised, pending client sign-off items), `12` §7 (cutover checklist) |
| Throughout | `04` (footer ships incrementally as each section's pages come online — a footer column only links to pages that actually exist yet, per `04-FOOTER-SPEC.md` §2) |

## What's still open before building starts

From `13-COMPANY-FACTS-VERIFIED.md` and `10-LEGAL-CONTENT-PLAN.md` — none of these block
starting Sprint 1 engineering work (scaffolding, brand tokens, CI), but they do block
finalising the legal pages and the footer's bottom bar:
1. Companies House registration number (or confirmation none exists yet).
2. VAT number, if applicable.
3. ICO registration number.
4. Confirmation of the live Packages payment processor(s).
5. Real social media URLs, if any exist, for the footer's `sameAs` schema.
6. Sign-off on whether `contact-us.html`'s "15+ Countries" / 30% discount / uncredited
   testimonial content is real or should be dropped (recommendation: drop, per
   `13-COMPANY-FACTS-VERIFIED.md`).

## First action, once you say go

1. Initialise the local monorepo structure from `05-ARCHITECTURE-AND-STACK.md` §2.
2. Push it to `https://github.com/Junior-Reactive-Solutions/Atlas-South` following the
   branch/PR conventions in `11-GIT-GITHUB-WORKFLOW.md` (first commit goes through a PR
   into `develop`, not straight to `main`, even for scaffolding).
3. Stand up the CI skeleton (`ci.yml`) so every subsequent PR is checked from the very
   first real feature branch.
4. Implement the brand tokens (`01`) and the `useAnimationScope` hook (`02`) as actual
   code, since every subsequent component depends on both existing first.
5. Build the Hero (`03`) and Header/Footer (`04`) first, per the client's explicit
   priority — before the service/industry page content, even though there are more of
   those pages — so the client sees the two sections they most care about early.

Building starts only when you give the go-ahead — this document and everything it
indexes is the plan, not the start of execution.
