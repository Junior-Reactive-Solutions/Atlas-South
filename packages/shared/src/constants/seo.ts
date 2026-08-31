/**
 * Homepage SEO metadata — the strings behind the site's shared link preview.
 *
 * Lives here, in shared, rather than inline in Home.tsx because TWO places have to produce
 * byte-identical output or the link preview breaks in a way nobody notices:
 *
 *   1. `apps/web/src/pages/Home.tsx` renders <Seo/>, which sets the tags client-side.
 *   2. `apps/web/scripts/prerender-seo.mjs` bakes the same tags into dist/index.html at
 *      build time — that's the copy link-preview crawlers (WhatsApp, X, Facebook,
 *      iMessage, Slack) actually read, since they don't run JavaScript.
 *
 * Those two used to hand-duplicate the strings. Interpolating the phone number below made
 * that materially riskier, so both now import from here instead.
 *
 * FORMAT NOTE — the homepage deliberately inverts the site's usual title order. Every
 * interior page is "<Page keywords> | Atlas South Technical Services" (keyword-first,
 * brand-last, which is right for a page competing on a specific term). The homepage is
 * "Atlas South Technical Services | <service keywords>" (brand-first), matching the format
 * the client's previous site used and asked us to keep — a shared homepage link should
 * lead with who it is. `Seo`'s `titleIncludesSiteName` prop exists for exactly this case,
 * so the brand isn't appended a second time.
 */
import { COMPANY } from './company.js';

export const HOME_SEO = {
  /**
   * Already contains the company name — pass with `titleIncludesSiteName` so <Seo/> uses
   * it verbatim. Longer than the ≤60 chars docs/build/09-SEO-PERFORMANCE-CHECKLIST.md §2
   * asks for, which is a deliberate homepage-only exception: the client's established
   * format front-loads the brand and then lists services, and search engines truncate the
   * tail gracefully while messaging apps show considerably more of it.
   */
  title: `${COMPANY.name} | London Plumbing, Electrical, Cleaning, Security & Facilities Management`,

  /**
   * Mirrors the previous site's description shape (brand, then services, then a call to
   * action with the phone number) but lists only services this site actually offers.
   *
   * Two things from the old copy are deliberately NOT here:
   *   - "handyman" — residential framing, and the rebuild is commercial/industrial only.
   *   - "Monthly packages available" — the client had all pricing removed from the site
   *     (the /packages page and its nav entries went with it), so advertising packages in
   *     a search result would lead to a page that no longer exists.
   *
   * The phone number is interpolated from COMPANY, never typed — see the note at the top
   * of constants/company.ts on why the previous site ended up with two different numbers
   * in five formats.
   */
  description: `${COMPANY.name}: London plumbing, electrical, painting, cleaning, security and facilities management for commercial sites. Call ${COMPANY.phone.display}.`,
} as const;
