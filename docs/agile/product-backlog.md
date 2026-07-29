# Product Backlog — Atlas South Website Redesign

Status: DRAFT — needs prioritization/estimation pass in Sprint 0 planning.
Ordering below is proposed, not final. Update this file every sprint planning
session; move completed items to a "Done" section or close via commit history.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

## Epic 1 — Information Architecture & Navigation
Move from single-scroll homepage to a proper multi-page structure.
- [ ] Story: As a visitor, I can navigate to a dedicated page per service
      (Security, Plumbing, Electrical, Painting, Handyman, Domestic Cleaning,
      Commercial Cleaning, Property Maintenance)
- [ ] Story: As a visitor, I can navigate to a dedicated page per industry
      (Healthcare, Education, Events, Construction, Corporate, Residential,
      Retail, Property)
- [ ] Story: As a visitor, I can use a persistent top nav to reach any
      service/industry/pricing/contact page without scrolling
- [ ] Story: As a visitor, breadcrumbs/URL structure make it clear where I am
      (e.g. /services/plumbing, /industries/healthcare)

## Epic 2 — Trust & Credibility Content
Close the proof-depth gap vs ABM.
- [ ] Story: As a commercial prospect, I can view case studies with
      before/after or outcome detail per major service
- [ ] Story: As a visitor, I can see accreditation/compliance detail pages
      (Gas Safe, Part P, SIA licensing) rather than a badge only
- [ ] Story: As a visitor, I can view a "Who We Are" / team page beyond the
      one-paragraph footer bio
- [ ] Story: As a visitor, I can download a company capability summary
      (equivalent to ABM's "Possibility in Action" brochure)
- [ ] Story: As a visitor, I can read more than 3 reviews, filterable by
      service type

## Epic 3 — Visual Design System
Elevate visual polish to read credible at commercial/enterprise tier.
- [ ] Story: Define a design system (typography scale, color tokens,
      spacing, component library) documented for reuse across new pages
- [ ] Story: Redesign homepage hero and section layouts against the new
      design system
- [ ] Story: Responsive design QA across mobile/tablet/desktop for all new
      pages

## Epic 4 — Conversion Paths (retain & strengthen)
- [ ] Story: Preserve and carry quote-request form onto every new
      service/industry page (pre-filled with relevant service)
- [ ] Story: Preserve WhatsApp/phone CTA presence on every page
- [ ] Story: Preserve monthly subscription tier pages with Stripe/PayPal,
      give them their own dedicated pricing page
- [ ] Story: Add analytics/conversion tracking plan (tool TBD — decide
      Sprint 0/1)

## Epic 5 — Technical Foundation
- [ ] Story: Decide platform/stack for rebuild (static site, framework,
      CMS) — architecture decision record needed
- [ ] Story: Set up project scaffolding, build/deploy pipeline
- [ ] Story: Migrate existing content/copy into new structure without loss

## Backlog Grooming Notes
- Epics 1–2 are the core "ABM inspiration" gap; Epic 4 protects what already
  converts — do not deprioritize below visual work.
- Estimation (story points) and sprint assignment happen in Sprint 0 planning
  — see [`sprint-0-plan.md`](sprint-0-plan.md).
