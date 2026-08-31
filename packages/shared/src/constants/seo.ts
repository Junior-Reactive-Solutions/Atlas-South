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
    title: `${COMPANY.name} | London Plumbing, Electrical, Cleaning, Security & Facilities Management`,
    titleIncludesSiteName: true,
    /**
     * Mirrors the previous site's description shape (brand, then services, then a phone
     * call to action) but lists only services this site actually offers. Two things from
     * that copy are deliberately absent: "handyman" (residential framing — this site is
     * commercial/industrial only) and "Monthly packages available" (all pricing was removed
     * at the client's request along with the /packages page, so it would advertise a page
     * that no longer exists).
     */
    description: `${COMPANY.name}: London plumbing, electrical, painting, cleaning, security and facilities management for commercial sites.${SEO_PHONE_CTA}`,
  },

  '/company': {
    path: '/company',
    title: 'About Us — Trusted London Facilities Partner',
    description:
      'Founded in 2018, Atlas South is a London-based cleaning and facilities management provider for commercial, corporate and government sites. Our story and team.',
  },

  '/company/vision-mission': {
    path: '/company/vision-mission',
    title: 'Our Vision & Mission — Trusted Facilities Partner',
    description:
      'Our vision and mission: to be the most trusted facilities partner for organisations where standards, compliance and reputation are always on the line.',
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
    // No phone CTA: candidates should apply through the form, not ring the sales line.
    title: 'Careers — Facilities & Trades Jobs in London',
    description:
      'Careers at Atlas South Technical Services. Current openings across cleaning operations and corporate facilities sales in our London-based team.',
  },

  '/legal/privacy': {
    path: '/legal/privacy',
    title: 'Privacy Policy',
    description:
      'How Atlas South Technical Services collects, uses, stores and protects your personal data, and the rights you have over it under UK data protection law.',
  },

  '/legal/terms': {
    path: '/legal/terms',
    title: 'Terms of Use',
    description:
      'The terms and conditions governing your use of the Atlas South Technical Services website and the services provided through it. Please read before use.',
  },

  '/legal/cookies': {
    path: '/legal/cookies',
    title: 'Cookie Policy',
    description:
      'How Atlas South Technical Services uses cookies on this website, what each type does, and how you can control or disable them in your browser.',
  },
} as const satisfies Record<string, PageSeo>;
