/**
 * Per-page SEO metadata for every page whose copy is NOT stored as editable content —
 * the home page, the company pages, and the legal pages. These are the strings behind the
 * site's search results and its shared link previews.
 *
 * Content-driven pages (the 25 service / industry / area records) carry their own
 * `seoTitle` / `seoDescription` in content/extracted-pages.ts instead, so they stay
 * editable from the admin panel. This file is only for pages with no content record.
 *
 * WHY THIS IS SHARED, not inline in each page component: two places have to produce
 * byte-identical tags or the link preview silently breaks.
 *
 *   1. Each page component renders <Seo/>, which sets the tags client-side.
 *   2. `apps/web/scripts/prerender-seo.mjs` bakes the same tags into the built HTML — and
 *      that is the copy link-preview crawlers (WhatsApp, X, Facebook, iMessage, Slack)
 *      actually read, because they do not run JavaScript.
 *
 * Those two used to hand-duplicate every string, and had already drifted: the three legal
 * pages shipped one description client-side and a shorter, differently-worded stub in the
 * prerendered HTML, so the version the world saw was never the version anyone had edited.
 * Importing from here is what makes that class of bug impossible rather than something to
 * remember.
 *
 * TITLE FORMAT — the home page deliberately inverts the site's usual order. Interior pages
 * are "<Page keywords> | Atlas South Technical Services" (keyword-first, brand-last, right
 * for a page competing on a specific term). Home is "Atlas South Technical Services |
 * <service keywords>", matching the format the client's previous site used: a shared
 * homepage link should lead with who it is. `titleIncludesSiteName` tells <Seo/> and the
 * prerender script not to append the brand a second time.
 *
 * LENGTH — descriptions target 140–160 characters (docs/build/09-SEO-PERFORMANCE-CHECKLIST.md
 * §2). Shorter wastes the slot; longer is truncated mid-sentence in previews and results.
 */
import { COMPANY } from './company.js';

/**
 * The origin the site is actually served from **right now** — used to build the absolute
 * URLs that have to resolve for a crawler: `og:image`, `og:url` and `canonical`.
 *
 * Flipped to `https://${COMPANY.domain}` on 2026-09-03 as part of the DNS cutover
 * (docs/build/17-DOMAIN-CUTOVER-RUNBOOK.md): atlassouthes.com's apex and `www` now resolve
 * to this Vercel deployment (verified live — 200 on www, 308 apex→www redirect), so this is
 * both the business domain and the deployment's real origin again. Previously these were
 * deliberately two different facts: until cutover, atlassouthes.com still served the
 * client's OLD site, so pointing this constant at it would have 404'd every `og:image` and
 * `canonical` URL a crawler tried to fetch.
 *
 * (public/sitemap.xml already listed atlassouthes.com URLs ahead of this flip — it was
 * written for submission to Search Console *after* cutover, which is now.)
 */
export const SITE_ORIGIN = `https://${COMPANY.domain}`;

/**
 * The single canonical identifier for Atlas South as a business entity in structured data.
 *
 * Every page that emits a LocalBusiness/Organization node must carry THIS `@id`. Without
 * it, each page describes what looks like a separate company that happens to share a name:
 * the homepage said one thing, the contact page another, the footer a third, and two of
 * them used a different URL host (`atlassouthes.com` vs `www.atlassouthes.com`) so they
 * could not even be reconciled by URL. A shared `@id` is what tells a search engine these
 * are all the same entity, and it is what lets the site's structured data reinforce a
 * single Google Business Profile rather than compete with it.
 *
 * The fragment (#organization) is conventional and deliberate: it makes the identifier a
 * node reference rather than a page URL, so nothing tries to fetch it.
 */
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;

/**
 * The call-to-action closing service, industry and area descriptions.
 *
 * Built from COMPANY rather than typed into each string — the previous site carried two
 * different phone numbers in five formats across its pages, which is the whole reason
 * constants/company.ts exists and forbids hand-typing it. Costs ~19 of the 160 characters.
 */
export const SEO_PHONE_CTA = ` Call ${COMPANY.phone.display}.`;

export interface PageSeo {
  /** Path this metadata belongs to — passed straight through to <Seo/>. */
  path: string;
  title: string;
  /** Set when `title` already contains the company name (home page only). */
  titleIncludesSiteName?: boolean;
  description: string;
}

/**
 * Keyed by route path. Consumers index with a literal key: the page component spreads its
 * entry into <Seo/>, and the prerender script iterates the whole map.
 */
export const PAGE_SEO = {
  '/': {
    path: '/',
    /**
     * Client-supplied positioning (2026-08-31), fitted to the standard ~60-character title
     * slot. Their raw line ran 148 characters — description length, not title length — so
     * the full sentence became the description below and the title keeps the brand plus the
     * core offering. Brand-first, matching the format their previous site used.
     */
    title: `${COMPANY.name} | Trades & Facilities Management`,
    titleIncludesSiteName: true,
    /**
     * The client's own sentence, naming the three sectors, the coverage area and the
     * single-provider differentiator — then the same phone CTA every commercial-intent page
     * carries (client request, 2026-08-31).
     *
     * Two ampersands stand in for "and" ("Trades &", "corporate & government"). That is not
     * a style preference: the sentence verbatim is 143 characters and the CTA adds 19,
     * which overruns the ~160 limit by two — and the part that gets truncated is the tail,
     * i.e. the phone number itself. The contraction buys exactly the room needed to keep
     * both the differentiator and the number intact, and matches the title's own "Trades &
     * Facilities Management".
     */
    description: `Trades & facilities management for commercial, corporate & government sites across London & the South East. One provider, every discipline.${SEO_PHONE_CTA}`,
  },

  '/company': {
    path: '/company',
    title: 'About Us — Trusted London Facilities Partner',
    description:
      `Founded in 2018, Atlas South is a London-based cleaning and facilities management provider for commercial, corporate & government sites.${SEO_PHONE_CTA}`,
  },

  '/company/vision-mission': {
    path: '/company/vision-mission',
    title: 'Our Vision & Mission — Trusted Facilities Partner',
    description:
      `Our vision and mission: to be the most trusted facilities partner where standards, compliance and reputation are always on the line.${SEO_PHONE_CTA}`,
  },

  '/company/contact': {
    path: '/company/contact',
    title: 'Contact Us — Get a Free Quote',
    // The number is interpolated, not typed — Contact.tsx previously hard-coded
    // "07778 858278" directly into this string.
    description: `Get a free quote from Atlas South Technical Services. Tell us about your site and we'll respond within 24 hours, or call us direct on ${COMPANY.phone.display}.`,
  },

  '/company/join-us': {
    path: '/company/join-us',
    /**
     * Deliberately no phone CTA here or on the three job detail pages
     * (CAREERS_CONTENT.openRoles in content/pages.ts) — candidates should apply through the
     * form, not ring the sales line. The number was briefly added across all 37 pages on
     * client instruction (2026-08-31) and then pulled back from careers specifically, at
     * their request, for exactly that reason. Don't reinstate it here for consistency with
     * the other pages: the inconsistency is the point.
     */
    title: 'Careers — Facilities & Trades Jobs in London',
    description:
      'Careers at Atlas South Technical Services. Current openings across cleaning operations and corporate facilities sales in our London-based team. Apply online.',
  },

  '/case-studies': {
    path: '/case-studies',
    /**
     * The library page is prerendered so crawlers get real metadata for it. The individual
     * case studies are NOT: they are authored in the admin panel and live in the database,
     * and the prerender step only reads content bundled into the repo. Same limitation
     * every DB-authored page has — mirror a study into content/case-studies.ts if it needs
     * to be prerendered as well as published.
     */
    title: 'Case Studies — Commercial Facilities Work',
    description:
      'Written-up examples of facilities and trades work delivered for commercial, corporate and government sites across London & the South East.' + SEO_PHONE_CTA,
  },
  '/insights': {
    path: '/insights',
    /**
     * Prerendered for the same reason /case-studies is, and with the same limitation: the
     * library page gets real metadata for crawlers, but the individual articles do NOT —
     * they are authored in the admin panel and live in the database, and this prerender
     * step only reads content bundled into the repo.
     *
     * Missing this entry is not a cosmetic gap. Without it the route has no prerendered
     * HTML of its own, so it is served index.html and inherits the HOMEPAGE's canonical
     * tag — telling search engines /insights is a duplicate of / and should not be indexed
     * separately. Caught on the live site immediately after this section shipped, by
     * reading the canonical off the deployed page rather than trusting the route to work.
     * Any future top-level route needs an entry here for the same reason.
     */
    title: 'Insights — Facilities Management Guidance',
    description:
      'Practical guidance on facilities management, compliance and building services for people responsible for commercial premises across London & the South East.' +
      SEO_PHONE_CTA,
  },
  '/legal/privacy': {
    path: '/legal/privacy',
    title: 'Privacy Policy',
    description:
      `How Atlas South collects, uses, stores and protects your personal data, and the rights you have over it under UK data protection law.${SEO_PHONE_CTA}`,
  },

  '/legal/terms': {
    path: '/legal/terms',
    title: 'Terms of Use',
    description:
      `The terms and conditions governing your use of the Atlas South website and the services provided through it. Please read before use.${SEO_PHONE_CTA}`,
  },

  '/legal/cookies': {
    path: '/legal/cookies',
    title: 'Cookie Policy',
    description:
      `How Atlas South Technical Services uses cookies, what each type does, and how you can control or disable them in your browser.${SEO_PHONE_CTA}`,
  },
} as const satisfies Record<string, PageSeo>;
