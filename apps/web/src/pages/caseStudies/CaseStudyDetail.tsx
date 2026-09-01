import { Link, useParams } from 'react-router-dom';
import { Icon } from '@atlas-south/design-system';
import { COMPANY } from '@atlas-south/shared';
import { useContentPage } from '../../hooks/useContentPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { Seo } from '../../components/seo/Seo.js';
import { NotFound } from '../NotFound';
import { QuoteForm } from '../../components/home/QuoteForm';
import type { CaseStudyContent } from '../../types/content';

/**
 * One case study.
 *
 * Follows the same three-part structure the audit asked for — the situation, what was done,
 * what changed — because that is what makes a case study useful as proof rather than as
 * advertising. Results and testimonial render only when present: a job without a defensible
 * metric is still worth writing up, and inventing one to fill the section is exactly the
 * failure this page type is most exposed to.
 */
export function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useContentPage<CaseStudyContent>(slug ?? '');

  if (isLoading) return <PageLoadingFallback />;
  if (error || !data) return <NotFound />;

  return (
    <>
      <Seo
        title={data.seoTitle ?? `${data.title} — Case Study`}
        description={
          data.seoDescription ??
          `${data.summary} Case study from Atlas South Technical Services. Call ${COMPANY.phone.display}.`
        }
        path={`/case-studies/${slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.title,
          about: data.client,
          publisher: { '@type': 'Organization', name: COMPANY.name },
          ...(data.completedAt ? { datePublished: data.completedAt } : {}),
        }}
      />

      {/* Hero */}
      <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent-blue hover:underline"
          >
            <Icon name="arrow-right" size={14} className="rotate-180" />
            All case studies
          </Link>
          <h1 className="mt-4 font-display text-4xl font-bold text-navy sm:text-5xl">{data.title}</h1>
          <p className="mt-3 text-lg text-slate">{data.summary}</p>

          <dl className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Client</dt>
              <dd className="mt-1 font-semibold text-navy">{data.client}</dd>
            </div>
            {data.location && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Location</dt>
                <dd className="mt-1 font-semibold text-navy">{data.location}</dd>
              </div>
            )}
            {data.timeline && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Timeline</dt>
                <dd className="mt-1 font-semibold text-navy">{data.timeline}</dd>
              </div>
            )}
            {data.serviceIds && data.serviceIds.length > 0 && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Services</dt>
                <dd className="mt-1 font-semibold text-navy">{data.serviceIds.length}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* The situation → what we did → what changed */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-10 px-4">
          {[
            { label: 'The challenge', body: data.challenge },
            { label: 'Our approach', body: data.approach },
            { label: 'The outcome', body: data.outcome },
          ]
            .filter((s) => s.body)
            .map((s) => (
              <div key={s.label}>
                <h2 className="font-display text-sm uppercase tracking-widest text-accent-blue">
                  {s.label}
                </h2>
                <div className="prose prose-sm mt-3 max-w-none text-slate sm:prose-base">
                  {s.body.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Results — only when the job actually produced figures worth standing behind. */}
      {data.results && data.results.length > 0 && (
        <section className="bg-navy py-14 text-white" data-widget-theme="dark">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {data.results.map((r) => (
                <div key={r.label}>
                  <p className="font-display text-3xl font-bold text-white">{r.value}</p>
                  <p className="mt-1 text-sm text-white/70">{r.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Client quote — rendered only when one was actually given and cleared. */}
      {data.testimonial && (
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <blockquote className="border-l-4 border-accent-blue pl-6">
              <p className="font-display text-xl font-medium leading-relaxed text-navy">
                “{data.testimonial.quote}”
              </p>
              <footer className="mt-4 text-sm text-slate">— {data.testimonial.attribution}</footer>
            </blockquote>
          </div>
        </section>
      )}

      {data.images && data.images.length > 0 && (
        <section className="pb-16">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-2">
            {data.images.map((img) => (
              <figure key={img.src}>
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full rounded-xl border border-border object-cover"
                />
                {img.caption && (
                  <figcaption className="mt-2 text-sm text-slate-400">{img.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      <QuoteForm />
    </>
  );
}
