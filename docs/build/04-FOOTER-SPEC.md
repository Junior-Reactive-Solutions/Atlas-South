# Footer — Detailed Spec

⭐ **Client priority.** Quoted directly from the nav brief: *"More of these has to be
broken down on the footer."* The footer is this site's secondary IA, not a link
afterthought — it's the only place on the site that ever holds all ~34 pages at once.

## 1. What the audit said was wrong, and what this fixes

| Audit finding | Fix in this spec |
|---|---|
| 6 "Areas We Cover" links are dead `href="#"` | Real links to the 6 service-area pages (§4) |
| "Work With Us" link on the homepage is dead | Links to Company → Join Us |
| No `<footer>` landmark, no labelled link groups | `<footer>` landmark + `aria-label`'d `<nav>` per column (§5) |
| Phone number inconsistent across pages | Footer pulls the single canonical number from `13-COMPANY-FACTS-VERIFIED.md` — never hand-typed |
| No `Organization`/`sameAs` schema anywhere | Added here, site-wide, since the footer is the one component present on every page (§6) |

## 2. Column structure

Mirrors the header IA (Epic G1 in `user-stories.md`) so a visitor can always get from
the footer to any page without scrolling back up. Six columns on desktop, an accordion
on mobile (see §5).

```
┌───────────┬───────────────┬───────────────┬──────────────┬──────────────┬──────────┐
│ Company   │ Hard Services │ Soft Services │ Industries    │ Areas We    │ Legal &  │
│           │               │               │               │ Cover        │ Connect  │
├───────────┼───────────────┼───────────────┼──────────────┼──────────────┼──────────┤
│ Mission   │ Electricals   │ Facilities    │ Government &  │ Central      │ Privacy  │
│ Vision    │ Plumbing      │  Management   │  Public Sector│  London      │  Policy  │
│ Join Us   │ Reactive      │ Security      │ Corporate     │ South East   │ Terms of │
│ Contact Us│  Maintenance  │  Services     │ Healthcare    │  London      │  Use     │
│           │ Fire & Safety │ Commercial    │ Oil & Gas     │ North London │ Cookie   │
│ Packages  │               │  Cleaning     │ Retail        │ East London  │  Settings│
│ (residen- │               │ Catering      │ Manufacturing │ West London  │          │
│  tial)    │               │ Aviation      │ Education &   │ Surrey &     │ WhatsApp │
│           │               │  Services     │  Learning     │  Kent        │ Phone    │
│           │               │ Concierge     │ Data Centres  │              │ Email    │
│           │               │ Waste &       │ Venues        │              │          │
│           │               │  Recycling    │               │              │          │
└───────────┴───────────────┴───────────────┴──────────────┴──────────────┴──────────┘
```

Notes:
- **Packages** sits under Company rather than getting a 7th column, since it's one link,
  not a category — matches the header placement decided in
  `docs/agile/user-stories.md` (decision 1).
- **Areas We Cover** directly resolves the audit's dead-link finding — these 6 links do
  not exist as pages yet; they are new pages per the original `product-backlog.md` Epic 1
  and must ship before this footer column goes live with real `href`s (never re-introduce
  `href="#"` placeholders — if a target page isn't built yet, the column temporarily omits
  that link rather than pointing nowhere).
- **Legal & Connect** carries Privacy Policy, Terms of Use, the cookie-preferences
  control (re-opens the consent banner), and repeated contact channels — this is the
  trust-signal column ABM keeps dense and consistent across every page.

## 3. Trust bar (above the column grid)

A slim band sitting directly above the six columns, repeating the highest-value
credibility signals so they're present on every single page regardless of column
interaction:

```
[Logo]  Atlas South Technical Services
07778 858278  ·  start@atlassouthes.com  ·  4th Floor, Silverstream House, 45 Fitzroy St, London W1T 6EB
Gas Safe Registered  ·  Part P Certified  ·  SIA Licensed  ·  £5m Public Liability Insurance
```

All values pulled from `13-COMPANY-FACTS-VERIFIED.md` — the certifications row uses the
same icon set as the certifications-as-artefacts requirement in
`06-PAGE-SPECIFICATIONS.md`, not text alone, so it reads as a badge strip.

## 4. Bottom bar

```
© 2026 Atlas South Technical Services[, registration no. TBC]. All rights reserved.
[Privacy Policy]  [Terms of Use]  [Cookie Settings]
Site by Junior Reactive Solutions
```

The `registration no. TBC` bracket only renders once a real company number is confirmed
per `13-COMPANY-FACTS-VERIFIED.md` — until then it's omitted entirely rather than shipping
a fabricated number or a visible "TBC" on the live public site (internal docs can say
TBC; the public page cannot claim an unverified fact).

## 5. Structure & accessibility

```html
<footer aria-label="Site footer">
  <div class="footer-trust-bar">…</div>
  <div class="footer-columns">
    <nav aria-label="Footer — Company">…</nav>
    <nav aria-label="Footer — Hard Services">…</nav>
    <nav aria-label="Footer — Soft Services">…</nav>
    <nav aria-label="Footer — Industries">…</nav>
    <nav aria-label="Footer — Areas We Cover">…</nav>
    <nav aria-label="Footer — Legal & Connect">…</nav>
  </div>
  <div class="footer-bottom">…</div>
</footer>
```

- Each `<nav>` has its own `<h3>` column heading (visually styled as a label, but real
  heading markup) so screen-reader users get the same "jump to a section" experience
  sighted users get from the visual grouping.
- Mobile: columns collapse into accordions (`<button aria-expanded>` per column heading),
  animated per the accordion entry in `02-ANIMATION-SYSTEM.md` — not six columns
  squeezed into a narrow viewport, which would reproduce the audit's mobile-length problem
  at the very bottom of every page.
- Minimum 44×44px tap targets on every footer link and accordion toggle (audit: current
  site's tap targets measured as small as 15px tall).

## 6. Structured data (site-wide, carried by the footer since it's on every page)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Atlas South Technical Services",
  "url": "https://www.atlassouthes.com",
  "logo": "https://res.cloudinary.com/.../atlas-south-logo.png",
  "telephone": "+447778858278",
  "email": "start@atlassouthes.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4th Floor, Silverstream House, 45 Fitzroy Street, Fitzrovia",
    "addressLocality": "London",
    "postalCode": "W1T 6EB",
    "addressCountry": "GB"
  },
  "sameAs": []
}
```

`sameAs` stays an empty array until real social profile URLs are confirmed (see the
open flag in `13-COMPANY-FACTS-VERIFIED.md`) — an empty array is valid schema; a
fabricated LinkedIn URL is not.

## 7. Animation

Footer columns use the exact same scroll-triggered stagger pattern as service/industry
cards (`02-ANIMATION-SYSTEM.md` — "Footer columns" row) rather than a bespoke footer
animation, per the client's uniformity requirement.
