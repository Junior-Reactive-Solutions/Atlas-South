import { Link, useParams } from 'react-router-dom';
import { Icon } from '@atlas-south/design-system';
import { COMPANY, SITE_ORIGIN } from '@atlas-south/shared';
import { useContentPage } from '../../hooks/useContentPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { Seo } from '../../components/seo/Seo.js';
import { Markdown } from '../../components/content/Markdown';
import { NotFound } from '../NotFound';
import { QuoteForm } from '../../components/home/QuoteForm';
import type { ArticleContent } from '../../types/content';

/**
 * One insight article.
 *
 * Every element below the headline is conditional, because a client-authored article is
 * routinely incomplete: no byline yet, no hero image, no category. The page renders what
 * exists and silently omits what doesn't, rather than showing an empty label or inventing
 * a default — an article bylined to a made-up author is the same category of failure as a
 * fabricated testimonial, just quieter.
 */
export function InsightArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useContentPage<ArticleContent>(slug ?? '');

  if (isLoading) return <PageLoadingFallback />;
  if (error || !data) return <NotFound />;

  const description =
    data.seoDescription ??
    data.summary ??
    `Guidance from the Atlas South Technical Services team. Call ${COMPANY.phone.display}.`;

  return (
    <>
      <Seo
        title={data.seoTitle ?? data.title}
        description={description}
        path={`/insights/${slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: data.title,
          description,
          // mainEntityOfPage is what tells search engines this URL is the article's
          // canonical home rather than one of several places it's syndicated.
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_ORIGIN}/insights/${slug}` },
          publisher: {
            '@type': 'Organization',
            name: COMPANY.name,
            logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/email-logo.png` },
          },
          // Each of these is emitted only when the author actually supplied it. A
          // structured-data date or byline that doesn't correspond to anything real is
          // worse than its absence: it's a machine-readable claim.
          ...(data.author ? { author: { '@type': 'Person', name: data.author } } : {}),
          ...(data.datePublished ? { datePublished: data.datePublished } : {}),
          ...(data.dateModified ? { dateModified: data.dateModified } : {}),
          ...(data.image ? { image: data.image.src } : {}),
        }}
      />

      <article>
        {/* Header */}
        <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <Link
              to="/insights"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent-blue hover:underline"
            >
              <Icon name="arrow-right" size={14} className="rotate-180" />
              All insights
            </Link>

            {data.category && (
              <p className="mt-6 font-display text-sm uppercase tracking-widest text-accent-blue">
                {data.category}
              </p>
            )}
            <h1 className="mt-2 font-display text-4xl font-bold text-navy sm:text-5xl">
              {data.title}
            </h1>
            {data.summary && <p className="mt-4 text-lg text-slate">{data.summary}</p>}

            {(data.author || data.datePublished || data.readMinutes) && (
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-6 text-sm text-slate">
                {data.author && (
                  <span className="font-semibold text-navy">
                    {data.author}
                    {data.authorRole && (
                      <span className="font-normal text-slate"> · {data.authorRole}</span>
                    )}
                  </span>
                )}
                {data.datePublished && (
                  <time dateTime={data.datePublished}>
                    {new Date(data.datePublished).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                )}
                {data.readMinutes && <span>{data.readMinutes} min read</span>}
              </div>
            )}
          </div>
        </section>

        {data.image && (
          <div className="mx-auto max-w-3xl px-4 pt-10">
            <img
              src={data.image.src}
              alt={data.image.alt}
              className="w-full rounded-xl border border-border"
              loading="lazy"
            />
          </div>
        )}

        {/* Body */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-navy prose-a:text-accent-blue">
              <Markdown content={data.body ?? ''} />
            </div>

            <div className="mt-12 border-t border-border pt-8">
              <Link
                to="/insights"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent-blue hover:underline"
              >
                <Icon name="arrow-right" size={14} className="rotate-180" />
                Back to all insights
              </Link>
            </div>
          </div>
        </section>
      </article>

      {/* The article's natural next step. Same component the service and case study pages
          close with, so a reader who arrived from search has the same route to a
          conversation they'd have anywhere else on the site. */}
      <QuoteForm />
    </>
  );
}
