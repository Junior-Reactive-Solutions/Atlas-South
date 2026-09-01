/**
 * Case studies — client work written up as proof.
 *
 * ── This array is deliberately EMPTY, and that is the correct state until real jobs are
 * ── supplied and signed off. Do not populate it with examples, samples or placeholders.
 *
 * The site audit called the absence of case studies "the single biggest credibility gap"
 * and recommended six to ten. The gap is real. But a case study is not marketing copy: it
 * names a client, describes work done for them, and frequently quotes them. Every one of
 * those is a factual claim about a third party.
 *
 * This project already has form here. Three testimonials attributed to named people with
 * job titles and specific claims ("engineer on site within 40 minutes") were invented
 * during content seeding and shipped live as fact, alongside client counts and job figures
 * that contradicted the verified numbers used elsewhere on the same site. They were removed
 * on 2026-08-12. A fabricated case study is that failure with more surface area: it is
 * harder to spot, it implies a client relationship that may not exist, and if it names a
 * real organisation without permission it is their problem as much as ours.
 *
 * So the system ships complete and the content ships empty. The listing page handles that
 * state properly, and the nav entry stays hidden until there is something behind it.
 *
 * TO ADD A REAL ONE: author it in the admin panel (Content → Case Studies), where it stays
 * in `draft` until explicitly published. Mirror it here only if it should also render when
 * the API is unreachable — the same offline-safe fallback pattern every other page uses.
 *
 * Before publishing any case study, confirm:
 *   1. The work described actually happened, as described.
 *   2. The client has agreed to be named — or `client` is an honest anonymisation
 *      ("A central London law firm"), with `clientAnonymised: true`.
 *   3. Every figure in `results` is one someone will stand behind if challenged.
 *   4. Any `testimonial` was actually said by the person it is attributed to, and they
 *      have agreed to it appearing publicly.
 *   5. Photographs are of the actual job. Stock imagery in a case study is a lie about
 *      work you did.
 */
export interface CaseStudySummary {
  slug: string;
  path: string;
  data: Record<string, unknown>;
}

export const CASE_STUDIES: CaseStudySummary[] = [];
