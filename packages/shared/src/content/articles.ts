/**
 * Insight articles — the SEO/thought-leadership library at /insights.
 *
 * ── This array is deliberately EMPTY, and that is the correct state until the client
 * ── supplies real articles. Do not populate it with samples, examples or placeholders.
 *
 * The reasoning is the same one that governs case-studies.ts, and it is not hypothetical
 * on this project: three testimonials attributed to named people, plus client counts and
 * job figures that contradicted the verified numbers elsewhere on the same site, were
 * invented during content seeding and shipped live as fact (removed 2026-08-12). Two
 * fabricated job vacancies — "Experienced Plumber" and "Facilities Manager" — were found
 * still live on 2026-09-03, advertised to real applicants for roles that did not exist.
 *
 * An article carries the same exposure in a subtler form. It is published under Atlas
 * South's name, it ranks in search, and readers treat it as the company's professional
 * position. An invented statistic, a misstated regulation, or advice the company would not
 * actually give is a claim the client has to stand behind — to a prospect, a regulator, or
 * in a dispute. The site's own audit asked for content depth; content depth invented by a
 * contractor is not depth, it is a liability with good grammar.
 *
 * So the system ships complete and the content ships empty. The listing page handles that
 * state honestly and the nav entry stays hidden until something is published behind it.
 *
 * TO ADD A REAL ONE: author it in the admin panel (Content → New article), where it stays
 * in `draft` until explicitly published. Mirror it here only if it should also render when
 * the API is unreachable — the same offline-safe fallback every other page type uses.
 *
 * WHEN THE FIRST ARTICLE GOES LIVE, two things outside the admin panel need doing, and
 * neither happens automatically:
 *   1. Drop `placeholder: true` from the `insights` entry in constants/navigation.ts, so
 *      the section starts appearing in the header and footer. Until then the pages work
 *      and are linkable, but nothing advertises them.
 *   2. Add the article URLs to apps/web/public/sitemap.xml. The sitemap is a static file,
 *      so published articles are invisible to search engines until it is updated — and
 *      /insights is deliberately NOT listed there while empty, because submitting an empty
 *      section to a search engine earns a thin-content signal rather than a ranking.
 *
 * Before publishing any article, confirm:
 *   1. Every factual claim, figure and date is correct and sourced.
 *   2. Any regulation, standard or legal duty cited (HSE, COSHH, BS/EN standards, fire
 *      safety, waste) is quoted accurately and is current — these change, and being
 *      confidently out of date is worse than saying nothing.
 *   3. The advice given is advice Atlas South would actually stand behind on a live site.
 *   4. The named author is a real person who has approved being credited.
 *   5. Nothing describes work for a specific client without that client's agreement —
 *      that belongs in a case study, under the checks in case-studies.ts.
 */
export interface ArticleSummary {
  slug: string;
  path: string;
  data: Record<string, unknown>;
}

export const ARTICLES: ArticleSummary[] = [];
