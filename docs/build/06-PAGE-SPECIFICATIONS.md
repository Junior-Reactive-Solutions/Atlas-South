# Page Specifications — Every Page, Every Component

This is the procedure document for building each page. §1 defines the **master template**
every content page inherits (so the same structural mistakes the audit found — missing
canonical, no schema, heading skips, dead links — become impossible to repeat, because
every page starts from the same checklist). §2 is the full page inventory with what's
unique to each one. §3 covers the handful of non-template pages (404, thank-you).

## 1. Master page template (applies to every page in §2 unless noted)

Every page is built from these components, in this order, regardless of section:

```
<Header />              — persistent nav, see Epic A in user-stories.md
<Breadcrumbs />          — every page except Home; feeds BreadcrumbList schema
<main>                    — single landmark, audit finding: currently missing
  <PageHero />             — smaller than the homepage hero (03-HERO-SECTION-SPEC.md
                             is homepage-specific); still image/icon + H1 + one CTA
  {page-specific sections — see §2}
  <TrustStrip />           — certifications row, reused component, not re-typed per page
  <RelatedLinks />         — cross-links (e.g. a service page links to relevant
                             industries; an industry page links to relevant services —
                             Epic F2 in user-stories.md)
  <QuoteFormEmbed />       — pre-filled with this page's service where applicable
</main>
<Footer />               — see 04-FOOTER-SPEC.md, identical on every page
```

### Mandatory `<head>` checklist — every page

Directly resolves the audit's SEO findings (0/13 pages had any of this):

- [ ] Unique `<title>`, ≤60 characters, primary keyword first
- [ ] Unique meta description, 140–160 characters
- [ ] `<link rel="canonical">` pointing to the page's own clean URL
- [ ] Full Open Graph set: `og:title`, `og:description`, `og:image` (1200×630, via
      Cloudinary), `og:url`, `og:type`, `og:site_name`
- [ ] `twitter:card` = `summary_large_image`, `twitter:title`, `twitter:image`
- [ ] `<html lang="en-GB">`
- [ ] JSON-LD appropriate to the page type (see §2 per-page column)
- [ ] `BreadcrumbList` JSON-LD matching the visible breadcrumb trail

### Mandatory heading & landmark checklist — every page

- [ ] Exactly one `<h1>` (the page hero headline)
- [ ] No heading level skips (h2→h3→h4 in order — audit found h2→h4 and h3→h5 skips on
      9 of 13 pages; the shared template makes this a component-level fix, not a
      per-page one)
- [ ] `<main>` wraps all page-specific content; `<header>`/`<footer>` landmarks come from
      the shared components
- [ ] Skip-to-content link present (shared in `<Header />`, not re-implemented per page)

### Mandatory accessibility checklist — every page

- [ ] All form inputs have a real `<label for>` (audit: 26 unlabelled inputs found —
      this becomes a shared `<FormField>` component requirement, not a per-form fix)
- [ ] All icons follow the `aria-hidden` / labelled-icon pattern in `01-BRAND-SYSTEM.md` §5
- [ ] All interactive elements ≥44×44px
- [ ] All text meets the contrast ratios verified in `01-BRAND-SYSTEM.md` §2 — no ad-hoc
      colours introduced per page

### Mandatory performance checklist — every page

- [ ] Images served via Cloudinary `f_auto,q_auto`, real `width`/`height` attributes set
      (prevents layout shift — audit found `noDims` images on the current site)
- [ ] No inline `<style>`/`<script>` blocks — all styling/behaviour comes from the shared
      bundle (directly resolves the audit's 226KB-of-duplicated-inline-assets finding)
- [ ] Route-level code splitting so a service page doesn't load the admin bundle, etc.

## 2. Full page inventory

**Legend:** Content source — `existing` (rebuilt from current copy) · `partial` (some
existing copy to build from) · `placeholder` (MVP believable-generic copy per the
resolved decision in `user-stories.md`, marked `<!-- PLACEHOLDER: needs client review -->`
in source) · `new` (genuinely new page, real facts available, no placeholder needed).

### Home & Company

| Page | Route | Schema | Content source | Notes |
|---|---|---|---|---|
| Home | `/` | `Organization`, `WebSite` (+ `SearchAction` if site search is ever added) | existing | Full hero per `03-HERO-SECTION-SPEC.md`. Sections: Hard Services teaser grid, Soft Services teaser grid, Industries teaser grid, Packages teaser, stats band, testimonials, primary quote form. |
| Company (Mission/Vision anchors) | `/company` (`#mission`, `#vision`) | `AboutPage`, `Organization` | partial (`about.html`) | One page, two anchored sections — see decision in `user-stories.md` C2. Founder story from `about.html` feeds both. |
| Join Us | `/company/join-us` | `JobPosting` per open role | existing (`careers.html`) | Rebuilt on the template rather than migrated as-is; keeps the existing application form, re-built with labelled fields. |
| Contact Us | `/company/contact` | `ContactPage`, `LocalBusiness` | partial (`contact-us.html`) | **Exclude the three unverified claims flagged in `13-COMPANY-FACTS-VERIFIED.md`** (30% discount, "15+ countries", the unattributed downtime testimonial). Map embed, hours, canonical NAP block. |
| Packages (residential) | `/packages` | `Product`/`Offer` per tier | existing (homepage pricing section) | Own indexable URL per the original `product-backlog.md` Epic 7; tiers, comparison table, FAQ. |

### Hard Services

| Page | Route | Schema | Content source | Icon |
|---|---|---|---|---|
| Electricals | `/hard-services/electricals` | `Service`, `FAQPage` | existing (`electrical.html`) | `zap` |
| Plumbing | `/hard-services/plumbing` | `Service`, `FAQPage` | existing (`plumbing.html`) | `wrench` |
| Reactive Maintenance | `/hard-services/reactive-maintenance` | `Service`, `FAQPage` | existing (`handyman.html` + emergency portion of `property-maintenance.html`) | `hammer` |
| Fire & Safety | `/hard-services/fire-safety` | `Service`, `FAQPage` | **placeholder** | `flame` |

### Soft Services

| Page | Route | Schema | Content source | Icon |
|---|---|---|---|---|
| Facilities Management | `/soft-services/facilities-management` | `Service`, `FAQPage` | partial (`property-maintenance.html` "one contract" framing) | `building-2` |
| Security Services | `/soft-services/security` | `Service`, `FAQPage` | existing (`security.html`) | `shield-check` |
| Commercial Cleaning | `/soft-services/commercial-cleaning` | `Service`, `FAQPage` | existing (`commercial-cleaning.html`) | `spray-can` |
| Catering | `/soft-services/catering` | `Service`, `FAQPage` | **placeholder** | `utensils` |
| Aviation Services | `/soft-services/aviation` | `Service`, `FAQPage` | **placeholder** | `plane` |
| Concierge | `/soft-services/concierge` | `Service`, `FAQPage` | **placeholder** | `concierge-bell` |
| Waste & Recycling | `/soft-services/waste-recycling` | `Service`, `FAQPage` | **placeholder** | `recycle` |

*(`domestic-cleaning.html` is retained but lives under the residential/Packages side of
the site per `user-stories.md` E3 — it is not a Soft Services page.)*

### Industries (all link into relevant Hard/Soft Services pages per Epic F2)

| Page | Route | Schema | Content source |
|---|---|---|---|
| Government & Public Sector | `/industries/government-public-sector` | `Service` (industry-scoped) | **placeholder** |
| Corporate | `/industries/corporate` | same | partial (homepage copy) |
| Healthcare | `/industries/healthcare` | same | partial (homepage copy) |
| Oil & Gas | `/industries/oil-gas` | same | **placeholder** |
| Retail | `/industries/retail` | same | partial (homepage copy) |
| Manufacturing | `/industries/manufacturing` | same | **placeholder** |
| Education & Learning Institutions | `/industries/education` | same | partial (homepage copy) |
| Data Centres | `/industries/data-centres` | same | **placeholder** |
| Venues | `/industries/venues` | same | **placeholder** |

### Service Areas (resolves the audit's 6 dead footer links)

| Page | Route | Schema |
|---|---|---|
| Central London | `/areas/central-london` | `Service` + `areaServed` |
| South East London | `/areas/south-east-london` | same |
| North London | `/areas/north-london` | same |
| East London | `/areas/east-london` | same |
| West London | `/areas/west-london` | same |
| Surrey & Kent | `/areas/surrey-kent` | same |

All six use one shared template (location name, response-time framing, relevant local
proof if any exists) — a separate content brief is not required per area; these are
structurally identical pages with swapped location data.

### Legal & System pages

| Page | Route | Schema | Notes |
|---|---|---|---|
| Privacy Policy | `/legal/privacy-policy` | none required | See `10-LEGAL-CONTENT-PLAN.md` — full rewrite, not a copy of the existing page |
| Terms of Use | `/legal/terms-of-use` | none required | Same |
| 404 | (catch-all) | none | See §3 |
| Thank You | `/thank-you` | none, `noindex` | See §3 |

## 3. Non-template pages

### 404 (Not Found)

Audit finding: current 404 is Apache's bare 236-byte default with no navigation back into
the site. Replacement:
- Uses `<Header />` and `<Footer />` (so navigation is never actually lost)
- Short, plain message + a search box or the three most likely destinations (Home,
  Contact, Packages)
- Returns a real HTTP 404 status code (server-level, not just client-side routing —
  confirm the Render/Vercel config returns 404, not 200, for unmatched routes)

### Thank You

Audit finding: forms currently redirect to `/?sent=1#booking` — no distinct URL, so no
clean conversion event exists to track. Replacement:
- Own route, `noindex` (it's a transactional page, not a page that should rank)
- Confirms what was submitted, sets a response-time expectation ("we respond within X
  hours"), offers the phone/WhatsApp channels as an alternative for anyone in a hurry
- This URL is the actual conversion-tracking event fired to GA4/the custom analytics
  pipeline — see `05-ARCHITECTURE-AND-STACK.md` §5 `Event` table and
  `08-ADMIN-PANEL-SPEC.md`.

## 4. Page count reconciliation

14 confirmed live pages today (per `13-COMPANY-FACTS-VERIFIED.md`) →
**5 Company + 4 Hard Services + 7 Soft Services + 9 Industries + 6 Service Areas +
2 Legal + Home + 404 + Thank You = 35 pages** in the rebuild, of which **10 ship as
MVP placeholders** pending real client content (5 new service lines + 5 new industries),
consistent with the estimate in `docs/agile/user-stories.md`.
