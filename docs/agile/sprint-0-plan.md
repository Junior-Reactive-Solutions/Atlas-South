# Sprint 0 — Foundations

Sprint 0 is setup/discovery, not feature delivery: get the team, tooling, and
technical decisions in place so Sprint 1 can start building against a real
backlog with estimates.

## Goals
1. Confirm project roles (who is Product Owner / decision-maker, who builds)
2. Make the platform/stack decision (Epic 5) — architecture decision record
3. Groom & estimate the Product Backlog (story points or t-shirt sizes)
4. Define Definition of Ready (DoR) and Definition of Done (DoD)
5. Set sprint length and cadence
6. Stand up project scaffolding (repo structure, build tooling) matching the
   platform decision

## Open Decisions Needed From You
- **Sprint length**: 1 week or 2 weeks?
- **Platform/stack**: staying on current stack (static HTML/CSS/JS as today)
  vs a framework (e.g. React/Next.js) vs a CMS-backed rebuild? This drives
  Epic 5 and how Epics 1–4 get implemented.
- **Definition of Done**: what must be true before a story is "done"? (e.g.
  responsive-checked, form tested end-to-end, copy reviewed, deployed to
  staging)
- **Who plays Product Owner** for prioritization calls during the project?

## Definition of Ready (draft — confirm/edit)
A backlog item is ready to pull into a sprint when it has:
- Clear acceptance criteria
- No unresolved blocking dependency
- Rough size estimate agreed

## Definition of Done (draft — confirm/edit)
A story is done when:
- Built and responsive-checked (mobile/tablet/desktop)
- Matches design system tokens (once Epic 3 design system exists)
- Forms/CTAs tested functionally where applicable
- Reviewed against acceptance criteria
- Deployed to staging (or production, per release policy)

## Sprint 0 Exit Criteria
- Product backlog groomed with estimates
- Platform decision recorded as an ADR in `docs/agile/decisions/`
- Sprint 1 backlog selected and Sprint 1 kicked off
