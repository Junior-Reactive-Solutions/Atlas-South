import { EXTRACTED_PAGES } from './extracted-pages.js';
import { HOME_CONTENT, COMPANY_CONTENT, CAREERS_CONTENT, PACKAGES_CONTENT } from './pages.js';

export { EXTRACTED_PAGES, type ExtractedPage } from './extracted-pages.js';
export { HOME_CONTENT, COMPANY_CONTENT, CAREERS_CONTENT, PACKAGES_CONTENT } from './pages.js';

/**
 * Every page's content, keyed by the same slug the Content API serves it under.
 *
 * Two consumers, which is the whole reason this lives in `packages/shared` rather than in
 * either app:
 *
 * 1. `apps/api/scripts/seed-content.ts` seeds these rows into the ContentPage table, after
 *    which the admin panel can edit them and the API serves the edited version.
 *
 * 2. `apps/web`'s `useContentPage` hook uses this as the *initial* render data, before (and
 *    if necessary instead of) the API response. That matters for a specific, observed
 *    failure: every detail page — all 21 service/industry/area pages plus About, Careers
 *    and Packages — used to render nothing but a loading spinner until
 *    `/api/content/<slug>` resolved. On the Vercel deployment, where no backend is live
 *    yet, that request 404s, so those pages showed a permanent spinner and read as
 *    "empty pages" even though the content was sitting right here in the repo.
 *
 * The API stays authoritative whenever it answers: `useContentPage` overlays the fetched
 * record on top of this one, so a genuine admin edit still wins. This is a floor, not a
 * cache — it only decides what a visitor sees while the request is in flight or failing.
 */
export const STATIC_PAGE_CONTENT: Record<string, Record<string, unknown>> = {
  ...Object.fromEntries(EXTRACTED_PAGES.map((page) => [page.slug, page.data])),
  home: HOME_CONTENT as unknown as Record<string, unknown>,
  company: COMPANY_CONTENT as unknown as Record<string, unknown>,
  careers: CAREERS_CONTENT as unknown as Record<string, unknown>,
  packages: PACKAGES_CONTENT as unknown as Record<string, unknown>,
};
