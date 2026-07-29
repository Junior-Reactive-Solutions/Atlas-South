# Inspiration Gap Analysis — Atlas South vs ABM (abm.co.uk)

Captured 2026-07-29. Superseded in detail by the full audit:
[`docs/audit/Atlas-South-Website-Audit-and-ABM-Comparison.pdf`](../audit/Atlas-South-Website-Audit-and-ABM-Comparison.pdf)

> **Correction (2026-07-29):** the first draft of this file assumed Atlas South was a
> single-scroll page with no dedicated service pages. **That was wrong.** A full crawl
> found **13 live pages**, including eight genuine service pages, an about page and a
> careers page, all returning HTTP 200 and listed in a sitemap. The sections below have
> been rewritten against measured data.

## Scale & Positioning
- ABM: global enterprise FM, corporate/strategic tone, industry verticals as
  primary nav (Airlines, Airports, Data Centres, Semiconductor, Government...)
- Atlas South: local London/SE trades company, urgency-driven consumer tone,
  13-page site anchored on a long homepage

## Measured gaps (evidence in the audit PDF)
1. **No structured data** — 0 JSON-LD blocks across 13 pages; ABM has 2 on its homepage
2. **No Open Graph / Twitter tags** — 0 across 13 pages; ABM has 4 + 4. Matters most
   because WhatsApp is a primary channel and shared links render with no preview card
3. **No photography** — 3 images site-wide (logo/chrome only); ABM homepage has 103
   plus a video hero. Service icons are emoji
4. **Industries have no destination pages** — 8 industry cards on the homepage link
   nowhere; ABM gives each of its 13 industries a full page
5. **Service areas have no pages** — all 6 "Areas We Cover" links are `href="#"`
6. **No case studies or proof depth** — 3 testimonials, no project detail, no client logos
7. **No analytics of any kind** — no baseline exists to measure the redesign against
8. **~90 dead placeholder links** across the site
9. **Phone number inconsistency** — 5 service pages advertise a different number
   (`020 335 52797`) from the rest of the site (`07778 858278`)

## What already works (protect these)
- **Per-service pages already exist** with genuinely unique copy — measured 5-gram
  overlap between the 8 service pages averages just **7.2%**, so there is no
  duplicate-content risk. This is the slow part of SEO and it is already done
- Instant quote forms (2 on the homepage) — ABM has no equivalent
- WhatsApp + phone CTAs repeated throughout — direct-response strength
- Monthly subscription tiers with transparent pricing — ABM publishes none
- Concrete certifications named (Gas Safe, Part P, SIA) vs ABM's abstract language
- Exceptionally lean front end — 0 external scripts, 650 DOM nodes
- HSTS enabled (ABM does not set it at all)
- GDPR cookie consent already built with granular toggles

## Direction
Borrow from ABM: real photography as the primary credibility device, industry pages
with their own URLs, one primary CTA per view, whitespace and pacing, a downloadable
capability document, and a machine-readable trust layer on every template.

Do **not** borrow: hidden pricing, absence of on-page forms, abstract corporate
language, or heavy script loading.
