# 18 — Google Business Profile

Created 2026-09-03.

For a local services business, the Business Profile outranks the website for most
commercial-intent searches ("facilities management near me", "commercial cleaning
London"). It is the single highest-leverage local SEO asset, ahead of any blog content.

This document has two halves: what has already been done in the codebase, and what a
person has to do in Google's own interface. The second half cannot be automated — Google
requires a signed-in Google account and identity/business verification, which is
deliberately not something an agent or a script can complete on someone's behalf.

---

## 1. Done in the codebase

| Change | Where | Why it matters to the Profile |
|---|---|---|
| `ProfessionalService` (a LocalBusiness subtype) replaces generic `Organization` | `apps/web/src/components/layout/Footer.tsx` | `Organization` carries no local-search meaning. Google reads LocalBusiness types for a business that serves a place, and cross-references them against the Profile. |
| Single canonical `ORGANIZATION_ID` across every business node | `packages/shared/src/constants/seo.ts`, Home, Contact, service pages | The site previously emitted fifteen unlinked business nodes with two different URL hosts — fifteen candidates to be "Atlas South". Now one entity, described once, referenced everywhere. |
| `areaServed`, `openingHoursSpecification`, `logo`, `foundingDate` | Footer schema | The fields Google actually reads for local results. |
| `geo` and `priceRange` deliberately omitted | Footer schema | Both would have to be invented. A wrong lat/long puts the map pin on the wrong building; there is no published pricing to state. Google geocodes the postal address without help. |

---

## 2. NAP — must match the Profile character for character

A mismatched phone format or street line is one of the most common reasons a local
listing underperforms. These values come from `packages/shared/src/constants/company.ts`,
which is the single source of truth. **Copy them exactly** — do not retype.

- **Name:** Atlas South Technical Services
- **Address:** 4th Floor, Silverstream House, 45 Fitzroy Street, Fitzrovia, London W1T 6EB
- **Phone:** 07778 858278
- **Website:** https://www.atlassouthes.com
- **Email:** start@atlassouthes.com

If any of these is wrong on the Profile, fix the Profile — or, if the Profile is right and
the site is wrong, change `company.ts` so the whole site follows. Never let the two drift.

---

## 3. Steps that need a person

1. **Check whether a Profile already exists.** Search "Atlas South Technical Services" on
   Google Maps. An unclaimed listing may already have been auto-created — if so, claim
   that one rather than creating a second. Duplicate listings compete with each other and
   are slow to merge.
2. **Create or claim** at https://business.google.com using a Google account the business
   controls long-term — not a personal account belonging to one member of staff.
3. **Verify.** Google will ask for postcard, phone, email or video verification depending
   on the category. Video verification is increasingly common for service businesses and
   usually asks for the premises, signage and equipment in one unbroken recording.
4. **Set the category.** Primary category has more ranking weight than any other single
   field. Suggested: **Facility management company**. Add secondary categories for the
   services actually offered — Commercial cleaning service, Electrician, Plumber,
   Security service — but only those genuinely delivered.
5. **Service areas.** The site declares six: Central London, South East London, North
   London, East London, West London, Surrey & Kent. Match them.
6. **Hours.** The site states 24/7 availability. Set the Profile to match, or change both
   if that is not accurate for the phone line.
7. **Services and description.** Mirror the service pages so the Profile and site
   reinforce each other rather than describing different companies.
8. **Photos.** Real photographs of premises, vehicles, uniformed staff and completed work.
   Stock imagery is both against Google's guidelines and transparently unconvincing.
9. **Reviews.** The highest-impact ongoing task. Ask satisfied clients directly and reply
   to every review, positive or negative. Never buy reviews — it risks suspension of the
   listing entirely.

---

## 4. After it is live

- Add the Profile URL to `COMPANY.socialProfiles` so it appears in the site's `sameAs`
  structured data. That is the explicit link between site and listing, and it is currently
  empty pending real profile URLs (see `13-COMPANY-FACTS-VERIFIED.md`).
- Submit the sitemap in Google Search Console: https://www.atlassouthes.com/sitemap.xml
- Build local citations — consistent NAP on Yell, Checkatrade, FreeIndex, Companies House
  and any trade bodies. Consistency across citations is itself a ranking signal.

## 5. Realistic expectations

Mitie employs around 84,000 people. No amount of on-site optimisation will outrank that
class of competitor for a head term like "facilities management London". What is winnable
is local-intent and long-tail search, where the national providers publish little and
generically. Expect three to six months before movement is measurable, and treat reviews
and citation consistency as the levers that actually move it.
