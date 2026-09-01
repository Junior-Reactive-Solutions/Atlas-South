import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@atlas-south/design-system';
import { COMPANY, CASE_STUDIES } from '@atlas-south/shared';
import { Seo } from '../../components/seo/Seo.js';
import type { CaseStudyContent } from '../../types/content';

interface CaseStudyListItem {
  slug: string;
  path: string;
  data: CaseStudyContent;
}

/**
 * Case study library.
 *
 * Renders whatever is published, and an honest empty state when nothing is — which is the
 * current situation by design. The system shipped complete and the content shipped empty
 * because a case study makes factual claims about a real client; see the note in
 * packages/shared/src/content/case-studies.ts on why none were written to fill the space.
 *
 * The empty state is deliberately not "coming soon" filler dressed up as content. It says
 * plainly that write-ups are being prepared and points at the contact page, which is a
 * genuine next step for a prospect wanting proof, rather than a dead end.
 */
export function CaseStudies() {
  const [items, setItems] = useState<CaseStudyListItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Bundled set first so the page renders instantly and still works with the API down —
    // the same offline-safe pattern every other content page uses.
    const fallback = CASE_STUDIES as unknown as CaseStudyListItem[];

    fetch('/api/case-studies')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('unavailable'))))
      .then((json) => {
        if (cancelled) return;
        const fromApi = (json.caseStudies ?? []).map(
          (p: { slug: string; path: string; publishedData: CaseStudyContent }) => ({
            slug: p.slug,
            path: p.path,
            data: p.publishedData,
          })
        );
        setItems(fromApi.length > 0 ? fromApi : fallback);
      })
      .catch(() => {
        if (!cancelled) setItems(fallback);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isEmpty = items !== null && items.length === 0;

  return (
    <>
      <Seo
        title="Case Studies — Commercial Facilities Work"
        description="Written-up examples of facilities and trades work Atlas South has delivered for commercial, corporate and government sites across London and the South East."
        path="/case-studies"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Atlas South Case Studies',
          publisher: { '@type': 'Organization', name: COMPANY.name },
        }}
      />

      <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="font-display text-sm uppercase tracking-widest text-accent-blue">Our work</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-navy sm:text-5xl">Case Studies</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate">
            Real jobs, written up properly — what the site needed, what we did, and what changed.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          {items === null && <p className="text-slate">Loading…</p>}

          {isEmpty && (
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-canvas p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
                <Icon name="file-text" size={22} className="text-accent-blue" />
              </div>
              <h2 className="font-display text-xl font-bold text-navy">Write-ups in preparation</h2>
              <p className="mt-3 text-slate">
                We're preparing detailed write-ups of recent work, published only where the client
                has agreed to it. In the meantime, we're happy to talk through relevant jobs and put
                you in touch with references directly.
              </p>
              <Link
                to="/company/contact"
                className="mt-6 inline-flex min-h-[44px] items-center rounded bg-accent-blue px-6 text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy"
              >
                Ask about relevant work
              </Link>
            </div>
          )}

          {items !== null && items.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.slug}
                  to={`/case-studies/${item.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-canvas p-6 transition-colors hover:border-accent-blue hover:bg-canvas-tint"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10">
                    <Icon name={item.data.icon ?? 'briefcase'} size={20} className="text-accent-blue" />
                  </div>
                  <h2 className="font-semibold text-navy group-hover:text-accent-blue">
                    {item.data.title}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-400">{item.data.client}</p>
                  <p className="mt-3 flex-1 text-sm text-slate">{item.data.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                    {item.data.location && <span>{item.data.location}</span>}
                    {item.data.timeline && <span>{item.data.timeline}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
