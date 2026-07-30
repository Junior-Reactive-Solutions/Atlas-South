# User Stories — Atlas South Website Rebuild

Source documents:
- Client navigation brief: `Atlas South Technical Service Navigation orders.pdf` (client, 2026-07-30)
- [`docs/audit/Atlas-South-Website-Audit-and-ABM-Comparison.pdf`](../audit/Atlas-South-Website-Audit-and-ABM-Comparison.pdf) (our audit, 2026-07-29)
- [`inspiration-gap-analysis.md`](inspiration-gap-analysis.md)

Status: DRAFT for review. **No building starts until you say go** — this document is the
planning artefact requested before Sprint 1 execution begins.

---

## ⚠ Read this first — the nav brief changes project scope

The client-supplied navigation order is a materially bigger and more B2B/enterprise site
than the one we audited. Flagging this now because it affects estimation and because a
few things need a decision before stories can be built against:

| Current site (audited) | Client nav brief |
|---|---|
| "YOUR HOME. FIXED RIGHT." — consumer/homeowner hero | No consumer framing implied; structure matches an enterprise FM buyer (mirrors ABM's Industries/Solutions split almost exactly) |
| 8 flat services, no Hard/Soft split | Services explicitly split into **Hard Services** (4) and **Soft Services** (7) |
| Monthly subscription pricing (£75/£180/£450) shown prominently | Not mentioned in the nav brief at all |
| 8 industries, no dedicated pages | **9 industries**, explicitly including Oil & Gas, Government & Public Sector, Manufacturing, Data Centres, Venues — none of which exist on the current site |
| No "Company" section (About/Careers exist as standalone pages) | Explicit **Company** dropdown: Mission, Vision, Join Us, Contact Us |
| Domestic/residential cleaning as its own service | Not listed — "Commercial Cleaning" only appears under Soft Services |

**Open questions for you before Sprint 1 stories are finalised** (see Sprint 0 plan for the
other open decisions):
1. Does the **residential/consumer offering** (domestic cleaning, the monthly homeowner
   subscription tiers, "YOUR HOME. FIXED RIGHT.") still exist alongside this new B2B
   structure, or is it being retired in favour of the enterprise FM positioning implied by
   the nav brief? This determines whether Packages/Pricing gets its own nav entry or is
   dropped.
2. **Reactive Maintenance** (Hard Services) and **Facilities Management** (Soft Services)
   overlap conceptually with the current `property-maintenance.html` page — confirm these
   are two distinct offerings, not a rename.
3. Where does the existing **Handyman** and **Painting** content map to in the new IA? Not
   named in the brief. Proposed placement below assumes Handyman → Reactive Maintenance
   and Painting → folded into Facilities Management; flag if wrong.
4. Confirm **Fire & Safety, Catering, Aviation Services, Concierge, Waste & Recycling** are
   genuinely new service lines Atlas South delivers (or partners for) — these have zero
   existing content, certifications, or copy to draw from.

The stories below are written to be buildable either way, but Epic ownership (§2 vs the
old Epic 1 in `product-backlog.md`) should be reconciled once you confirm.

---

## Story format

Each story: `As a [user], I want [capability], so that [benefit]`, with acceptance
criteria in Given/When/Then style where useful, tagged with size (S/M/L) and audit
cross-references where a finding drives the requirement.

---

## Epic A — Global Navigation & Header

**A1.** As a visitor, I want a persistent header with clear primary navigation
(Home, Company, Hard Services, Soft Services, Industries), so that I can reach any part
of the site from anywhere. *(M)*
- Given the nav brief's 5-item structure, When I hover/tap Company, Hard Services, Soft
  Services or Industries, Then a dropdown/mega-menu reveals its sub-items exactly as
  specified in the brief.
- Nav must resolve to real pages — zero `href="#"` placeholders (audit: ~90 dead links found).

**A2.** As a visitor, I want the header CTA to be "Call us" and "Contact us" exactly as
specified, so that the primary conversion actions match the client's intended hierarchy. *(S)*
- Two distinct CTAs, not the current three-way split (Book/WhatsApp/View Services) the
  audit flagged as competing for attention.
- Single phone number, single format, site-wide (audit: found 2 conflicting numbers in 5
  formats — this must not recur in the rebuild).

**A3.** As a mobile visitor, I want the nav to collapse into an accessible menu with
44×44px minimum tap targets, so that I can navigate on a phone. *(M)*
- Audit: current header nav items measured 15px tall — this is a hard regression to fix.

**A4.** As a screen-reader user, I want the header wrapped in a `<header>` landmark with
a skip-to-content link, so that I can bypass navigation. *(S)*
- Audit: no `<header>` landmark, no skip link found on the current homepage.

---

## Epic B — Hero Section ⭐ *client priority — no shortcuts here*

The client has explicitly flagged the hero as a section to get right. Audit finding: the
current hero has no photography and three competing CTAs. ABM's hero (single message,
one CTA, real video of work) is the calibration point.

**B1.** As a visitor landing on the homepage, I want the hero to show real, credible
proof of Atlas South's work in the first viewport, so that I trust the company before
scrolling. *(L)*
- Given the page loads, When the hero renders, Then it shows photography or video of
  actual work/sites/staff — not emoji, not stock abstraction.
- Image/video must be optimised (WebP/AVIF + fallback, lazy-loaded below the hero only)
  so this doesn't regress the site's currently strong lean-performance profile.

**B2.** As a visitor, I want exactly one primary call-to-action in the hero, so that I'm
not asked to choose between competing actions before I've seen any evidence. *(M)*
- Given the hero renders, When I look for a CTA, Then there is one visually dominant
  primary action; phone/contact remain available but secondary (e.g. persistent header,
  not hero-level competition).
- Acceptance: resolves audit finding of 3 competing hero CTAs diluting the primary action.

**B3.** As a visitor, I want the hero headline to state what Atlas South does and for
whom in one sentence, so that I immediately understand the offering. *(S)*
- Must work for the audience confirmed in the open questions above (B2B FM buyer vs
  homeowner) — copy cannot be written until Q1 above is answered.

**B4.** As a visitor on mobile, I want the hero to render in one screen without excessive
scroll, so that the first impression isn't diluted by a long stack of hero content. *(M)*
- Audit: current mobile homepage is 15,168px tall (≈18 screens) vs ABM's 8,189px — the
  hero is a meaningful contributor and is the highest-visibility place to fix this first.

**B5.** As a visitor, I want the hero's trust indicators (years trading, jobs completed,
coverage area) visible without competing with the primary CTA, so that credibility signals
support rather than clutter the action. *(S)*
- Keep the existing stats (700+ clients, 24/7, 12k+ jobs, est. 2018) — audit confirmed
  these are a genuine strength — but restyle so they don't compete visually with B2.

**B6.** As a visitor, I want the hero image/text to carry proper alt text and sufficient
colour contrast, so that it's accessible. *(S)*
- WCAG AA 4.5:1 minimum; audit found the current hero's "FIRST TIME." outline text and
  WhatsApp CTA both fail contrast — do not repeat in the new hero.

---

## Epic C — Company Section (Mission · Vision · Join Us · Contact Us)

**C1.** As a prospective commercial client, I want a Mission page stating what Atlas South
exists to do, so that I can assess cultural/strategic fit before engaging. *(M)*
- New page; no existing content — needs copy sign-off from the client.

**C2.** As a prospective client, I want a Vision page distinct from Mission, so that I
understand where the company is heading, not just what it does today. *(M)*
- New page; confirm with client whether Mission/Vision are genuinely separate pages or a
  single "About" page with two sections (current `about.html` already covers similar
  ground — reconcile before building to avoid duplicate/thin content).

**C3.** As a job seeker, I want "Join Us" to present open roles and culture, so that I can
apply. *(M)*
- Maps to existing `careers.html` (1,744 words, has an application form) — rename/move
  rather than rebuild from scratch. Add `JobPosting` schema (audit recommendation).

**C4.** As a visitor, I want a dedicated Contact Us page with address, hours, map and a
form, so that I have one canonical place to reach the company. *(M)*
- Audit: no dedicated contact page currently exists (contact is a homepage anchor). Add
  `LocalBusiness` schema with NAP data — single source of truth for the phone-number
  conflict the audit found.

---

## Epic D — Hard Services (Electricals · Plumbing · Reactive Maintenance · Fire & Safety)

**D1.** As a facilities buyer, I want an Electricals page detailing certifications, scope
and callout availability, so that I can assess competence before enquiring. *(M)*
- Existing `electrical.html` (842 words, Part P certified messaging) is a strong base —
  rebuild on the new template rather than starting blank. Add `Service` + `FAQPage` schema.

**D2.** As a facilities buyer, I want a Plumbing page with the same structure, so that the
Hard Services section feels consistent. *(M)*
- Existing `plumbing.html` is the base. **Note:** this page is one of the five carrying
  the wrong phone number in the audit — must be corrected during rebuild, not carried over.

**D3.** As a facilities buyer, I want a Reactive Maintenance page describing response times
and coverage, so that I understand emergency/on-demand capability. *(M)*
- Likely maps from `handyman.html` and/or `property-maintenance.html` — needs the mapping
  decision (open question 3) before content is drafted.

**D4.** As a facilities buyer, I want a Fire & Safety page covering compliance services
(alarms, extinguishers, inspections, certification), so that I can evaluate regulatory
coverage. *(L)*
- **No existing content.** New service line — needs source material (certifications,
  scope, pricing model) from the client before copy can be written. Flag as a content
  dependency, not just a build task.

**D5.** As any Hard Services page visitor, I want a consistent template (hero, scope,
certifications-as-artefacts, case study, FAQ, embedded quote form), so that every service
page reads as part of one credible system. *(L)*
- Consolidates audit findings across all service pages: no photography, dead links (12
  per page), no case studies, no schema, heading hierarchy skips.

---

## Epic E — Soft Services (Facilities Management · Security · Commercial Cleaning · Catering · Aviation · Concierge · Waste & Recycling)

**E1.** As a facilities buyer, I want a Facilities Management overview page, so that I
understand Atlas South's "single contract, all trades" value proposition.
*(L)*
- This is the closest structural borrow from ABM's "ABM Performance Solutions" pitch
  identified in the original gap analysis — one contract, one invoice, one point of
  accountability. New page, but the underlying pitch already exists in spirit on
  `property-maintenance.html`.

**E2.** As a facilities buyer, I want a Security Services page, so that I can evaluate
manned guarding and site security capability. *(M)*
- Existing `security.html` (949 words, SIA-licensed messaging) is the base.

**E3.** As a facilities buyer, I want a Commercial Cleaning page, so that I can evaluate
office/workspace cleaning contracts. *(M)*
- Existing `commercial-cleaning.html` is the base. **Note:** current `domestic-cleaning.html`
  has no obvious home in this nav — resolve via open question 1.

**E4.** As a facilities buyer, I want a Catering page, so that I can evaluate on-site
catering provision. *(L)*
- **No existing content.** New service line — content dependency on the client.

**E5.** As a facilities buyer, I want an Aviation Services page, so that I can evaluate
sector-specific capability (this pairs with the "Aviation"/"Airlines"/"Airports" industry
vertical pattern seen on ABM). *(L)*
- **No existing content.** New service line — content dependency on the client. Confirm
  whether this is airside-cleared personnel/security or ground-services-only scope, since
  that materially changes the compliance content required.

**E6.** As a facilities buyer, I want a Concierge page, so that I can evaluate front-of-house
and reception service provision. *(M)*
- **No existing content.** New service line.

**E7.** As a facilities buyer, I want a Waste and Recycling Services page, so that I can
evaluate waste management and sustainability compliance. *(M)*
- **No existing content.** New service line — pairs well with an ESG/sustainability
  narrative if the client wants to echo ABM's "Advancing Sustainability" pillar.

**E8.** As any Soft Services page visitor, I want the same consistent template used across
Hard Services, so that the whole site reads as one system regardless of section. *(L)*
- Shared component requirement — do not let Hard and Soft Services diverge into two
  different templates; this was an explicit architecture finding in the audit (13
  hand-maintained files, no shared components).

---

## Epic F — Industries (9 sectors)

Government & Public Sector · Corporate · Healthcare · Oil & Gas · Retail · Manufacturing ·
Education & Learning Institutions · Data Centres · Venues

**F1.** As a buyer in a specific sector, I want a dedicated industry page tailored to my
sector's compliance and operational concerns, so that I see Atlas South understands my
context specifically, not generically. *(L, ×9 — one per industry)*
- Direct structural borrow from ABM (confirmed in the original gap analysis as the
  clearest actionable pattern). Each page: sector-specific proof points, relevant
  certifications, a case study if available, and links into the specific Hard/Soft
  services most relevant to that sector.
- Audit: the current 8 industry cards on the homepage link nowhere (`href="#"`) — these 9
  pages directly resolve that finding, expanded from 8 to 9 per the new brief (adds Oil &
  Gas as new).
- **Content dependency:** Oil & Gas, Government & Public Sector, Manufacturing, Data
  Centres and Venues have zero existing case studies or sector-specific copy — flag for
  client input before these 5 can be drafted; the other 4 (Corporate, Healthcare, Retail,
  Education) have partial existing homepage copy to build from.

**F2.** As a visitor, I want each industry page to link into relevant Hard/Soft Services
pages (not just list them), so that navigation between "who you serve" and "what you do"
is joined up rather than two disconnected site sections. *(M)*
- E.g. the Healthcare page should deep-link to Fire & Safety, Facilities Management and
  Reactive Maintenance where relevant to that sector.

---

## Epic G — Footer ⭐ *client priority — no shortcuts here*

The client explicitly said "more of these has to be broken down on the footer" — the
footer is the secondary IA, not an afterthought link list.

**G1.** As a visitor, I want the footer organised into clear columns mirroring the header
structure (Company / Hard Services / Soft Services / Industries), so that I can find any
page from the footer without scrolling back to the header. *(L)*
- All ~20+ sub-pages (4 Hard Services + 7 Soft Services + 9 Industries + 4 Company pages)
  need a footer home. This is the single largest concentration of internal links on the
  site — get the grouping and labelling right the first time.

**G2.** As a visitor, I want the footer to also carry the remaining "areas we cover" /
service-area links, so that local-SEO-relevant pages aren't buried. *(M)*
- Audit: the 6 service-area links (Central/South East/North/East/West London, Surrey &
  Kent) are currently dead `href="#"` links in this same footer region — G2 directly
  resolves that finding once the area pages exist (see `product-backlog.md` Epic 1).

**G3.** As a visitor, I want the footer to repeat core trust and contact information
(phone, email, address, accreditations, social links), so that it's available wherever a
visitor lands, without needing to scroll back to the header/hero. *(M)*
- Single source of truth for phone number/NAP (audit finding — must not reintroduce the
  inconsistency found across 5 pages).

**G4.** As a visitor, I want the footer to carry legal links (Privacy Policy, Terms of
Use) and a cookie-preferences control, so that compliance requirements remain easy to find.
*(S)*
- Existing `privacy-policy.html` and `terms-of-use.html` carry over; add canonical tags
  (audit: currently missing on both).

**G5.** As a screen-reader or keyboard user, I want the footer wrapped in a `<footer>`
landmark with properly labelled link groups (e.g. `<nav aria-label="Footer — Hard
Services">`), so that the expanded footer doesn't become an accessibility regression as it
grows to ~20+ links. *(M)*
- Given the footer is being deliberately expanded per client request, this is the moment
  to build it accessibly from the start rather than retrofitting later.

**G6.** As a visitor, I want the footer to include structured data (`Organization` +
`sameAs` for social profiles), so that the company's identity is machine-readable
site-wide from the one element that appears on every page. *(S)*

---

## Epic H — Cross-Cutting Technical Requirements

These apply to every page above and are carried forward from the audit rather than
repeated per-story.

**H1.** Every page ships with a canonical tag, complete Open Graph + Twitter Card tags,
and appropriate JSON-LD (audit: 0/13 pages currently have any of these). *(template-level)*

**H2.** Every page passes WCAG 2.1 AA on contrast, labelled form inputs, heading hierarchy
(no level skips) and landmark regions. *(template-level)*

**H3.** Analytics and conversion tracking installed before any visual work ships, so that
the redesign has a baseline. *(Sprint 1 blocker — see `sprint-0-plan.md`)*

**H4.** Shared CSS/JS extracted to cached external files; no per-page duplication (audit:
226KB of inline assets duplicated across 13 files today, and this grows worse if ~30 new
pages are hand-built the same way). *(architecture prerequisite for Epics C–G)*

**H5.** A single phone number and NAP format, defined once and templated everywhere —
never hand-typed per page again. *(template-level, directly fixes the audit's top NAP finding)*

---

## Summary — story count by epic

| Epic | Stories | New pages required | Existing pages to migrate/rebuild |
|---|---|---|---|
| A · Global Nav & Header | 4 | 0 | header/nav component |
| B · Hero | 6 | 0 | homepage hero section |
| C · Company | 4 | 2–4 (pending Q2) | about.html, careers.html |
| D · Hard Services | 5 | 1 (Fire & Safety) | electrical, plumbing, handyman/property-maintenance |
| E · Soft Services | 8 | 4 (Facilities Mgmt, Catering, Aviation, Concierge, Waste) | security, commercial-cleaning |
| F · Industries | 2 (×9 pages) | 9 (5 with content dependency) | partial homepage copy only |
| G · Footer | 6 | 0 (consumes pages from above) | footer component |
| H · Cross-cutting | 5 | — | applies to all templates |

**Estimated total new/rebuilt pages: ~30–34**, up from the ~13 (existing) / ~38–42
(previously proposed in `product-backlog.md`) estimate — the client's Hard/Soft/Industries
split is more granular than our original proposal in most areas, and adds entirely new
service lines (Fire & Safety, Catering, Aviation, Concierge, Waste & Recycling) with zero
existing content.

## Next step
Answer the four open questions in the callout at the top of this document, then I'll
fold this into `product-backlog.md` as estimated, sprint-assigned stories and we can groom
Sprint 1. Building starts on your go-ahead only.
