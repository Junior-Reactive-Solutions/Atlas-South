# SEO & Performance Checklist — Platform-Agnostic

Client requirement: the site must score at the top no matter which platform builds it —
this checklist is written as **verifiable, tool-agnostic criteria**, not React/Vercel-
specific instructions, so it stays the acceptance bar even if the underlying platform
ever changes. Every item traces to a finding in
[`Atlas-South-Website-Audit-and-ABM-Comparison.pdf`](../audit/Atlas-South-Website-Audit-and-ABM-Comparison.pdf).

## 1. Target scores (using the rubric from that audit)

| Category | Current (audited) | Sprint 1 target | Launch target |
|---|---|---|---|
| Overall | 48 (F) | 68 (D) | 90+ (A) |
| SEO | 53 (E) | 82 (B) | 95+ (A) |
| Performance | 64 (D) | — | 90+ |
| Accessibility | 49 (F) | — | 95+ (WCAG 2.1 AA conformance, not just a score) |
| Security | 33 (F) | 80+ (per `07-SECURITY.md` being fully implemented) | 95+ |

Re-run the same audit methodology (or SquirrelScan, once installed — see the audit
document's methodology note) against the live rebuild before calling any phase "done."
A claim of improvement without a fresh measurement is not acceptable per this project's
verification standard.

## 2. Per-page SEO checklist (mechanically checkable — see `06-PAGE-SPECIFICATIONS.md` §1
for where each of these is enforced structurally)

- [ ] Unique title ≤60 characters, primary keyword near the front
- [ ] Unique meta description, 140–160 characters
- [ ] Canonical tag present and correct
- [ ] Complete Open Graph + Twitter Card set
- [ ] Correct JSON-LD for the page type (`Organization`, `Service`, `FAQPage`,
      `BreadcrumbList`, `JobPosting`, `LocalBusiness`, `Product`/`Offer` as applicable —
      full mapping in `06-PAGE-SPECIFICATIONS.md`)
- [ ] Exactly one `<h1>`, no heading level skips
- [ ] All images have descriptive `alt` text (audit: the current site already does this
      correctly on its 3 images — don't regress as real photography is added)
- [ ] Zero `href="#"` placeholder links (audit found ~90 across the current site)
- [ ] `lang="en-GB"` set at the document root

## 3. Site-wide crawlability

- [ ] `robots.txt` present, correctly references the sitemap, allows all legitimate
      crawling (audit: this already exists and is correct — keep it)
- [ ] `sitemap.xml` lists **every** real page, generated programmatically from the route
      table rather than hand-maintained (audit found the current sitemap missing 2 of
      the 14 actual live pages — a generated sitemap makes that class of bug impossible)
- [ ] `/admin/*` explicitly excluded from the sitemap and set `noindex, nofollow`
- [ ] Custom, on-brand 404 page returning a real HTTP 404 status (audit: current 404 is a
      bare 236-byte Apache default)
- [ ] No redirect chains longer than one hop anywhere in the site

## 4. Structured data validation

- [ ] Every JSON-LD block validates against Google's Rich Results Test with zero errors
- [ ] `Organization` schema present site-wide via the footer (per `04-FOOTER-SPEC.md` §6),
      not just on the homepage

## 5. Performance budget (Core Web Vitals — field data unavailable pre-launch per the
audit's own limitation note; these are the lab-test targets to build against)

| Metric | Target | How it's protected |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Hero image served via Cloudinary `f_auto,q_auto`, correctly sized `srcset`, preloaded as a priority resource |
| CLS (Cumulative Layout Shift) | < 0.1 | Every image ships explicit `width`/`height` (audit found `noDims` images on the current site); no late-injected banners/ads |
| INP (Interaction to Next Paint) | < 200ms | Route-level code splitting so no page loads more JS than it needs; anime.js animations run on compositor-friendly properties (transform/opacity) per the tokens in `02-ANIMATION-SYSTEM.md`, not layout-triggering properties |
| Total page weight (excluding hero image) | Stay close to the audit-confirmed lean baseline (~56KB gzipped HTML equivalent) | No inline CSS/JS duplication (audit found 226KB of it across 13 pages) — all styling/behaviour in cached, versioned, shared bundles |
| Caching | Static assets: `max-age=31536000, immutable`. HTML: revalidate on every request | Audit: current site sets no caching headers at all |

## 6. Analytics as an SEO/trust signal

A recognised analytics implementation (GA4, per `05-ARCHITECTURE-AND-STACK.md`) plus
Google Search Console verification are both part of "top SEO score" in practice — search
engines and third-party auditors both check for their presence/correct wiring, and
Search Console is also how sitemap submission and indexing issues get monitored
post-launch. Both are Sprint 1 items (already flagged as a blocker in
`docs/agile/sprint-0-plan.md` — the site currently has **zero** analytics of any kind).

## 7. Accessibility (folded in because it is graded as part of "audit score" broadly, and
was the audit's second-worst category)

- [ ] WCAG 2.1 AA colour contrast site-wide, using only the verified tokens in
      `01-BRAND-SYSTEM.md` §2
- [ ] All form inputs labelled (audit: 26 unlabelled inputs found)
- [ ] All interactive elements ≥44×44px
- [ ] Landmark regions (`header`, `main`, `footer`, labelled `nav`s) on every page
- [ ] Skip-to-content link
- [ ] Icons follow the `aria-hidden`/labelled pattern in `01-BRAND-SYSTEM.md` §5 — zero
      emoji, zero un-hidden decorative glyphs read aloud by screen readers
- [ ] `prefers-reduced-motion` respected site-wide per `02-ANIMATION-SYSTEM.md` §4

## 8. Local SEO specifically

- [ ] Exactly one phone number, one format, sourced from
      `13-COMPANY-FACTS-VERIFIED.md` everywhere (audit's top NAP finding — 2 numbers,
      5 formats, across 5 pages on the current site)
- [ ] `LocalBusiness` schema with consistent NAP on the Contact Us page and in the
      footer `Organization` schema
- [ ] The 6 new service-area pages (`06-PAGE-SPECIFICATIONS.md`) each target their
      specific location + service combination rather than duplicating one page 6 times
      with only the place-name swapped verbatim
