import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@atlas-south/design-system';
import { COMPANY, ARTICLES, SITE_ORIGIN } from '@atlas-south/shared';
import { Seo } from '../../components/seo/Seo.js';
import type { ArticleContent } from '../../types/content';

interface ArticleListItem {
  slug: string;
  path: string;
  data: ArticleContent;
  publishedAt?: string;
}

/**
 * The insight-article library.
 *
 * Renders whatever the client has published, and an honest empty state when nothing is —
 * which is the current situation by design. The section shipped complete and the content
 * shipped empty because an article is published under Atlas South's name and read as its
 * professional position; see packages/shared/src/content/articles.ts for why none were
 * written to fill the space.
 *
 * The empty state deliberately isn't "coming soon" filler. It says plainly that nothing is
 * published yet and points at the contact page, which is a real next step for someone who
 * came looking for expertise, rather than a dead end.
 */
export function Insights() {
  const [items, setItems] = useState<ArticleListItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Bundled set first so the page renders instantly and still works with the API down —
    // the same offline-safe pattern every other content page uses.
    const fallback = ARTICLES as unknown as ArticleListItem[];

    fetch('/api/articles')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('unavailable'))))
      .then((json) => {
        if (cancelled) return;
        const fromApi = (json.articles ?? []).map(
          (p: { slug: string; path: string; publishedData: ArticleContent; publishedAt?: string }) => ({
            slug: p.slug,
            path: p.path,
            data: p.publishedData,
            publishedAt: p.publishedAt,
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
        title="Insights — Facilities Management Guidance"
        description="Practical guidance on facilities management, compliance and building services from the Atlas South team, for people responsible for commercial premises across London and the South East."
        path="/insights"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Atlas South Insights',
          url: `${SITE_ORIGIN}/insights`,
          publisher: { '@type': 'Organization', name: COMPANY.name },
          // Only advertise posts that genuinely exist. An empty Blog node is accurate;
          // listing placeholder entries to look established is the failure this whole
          // section's documentation exists to prevent.
          ...(items && items.length > 0
            ? {
                blogPost: items.map((item) => ({
                  '@type': 'BlogPosting',
                  headline: item.data.title,
                  url: `${SITE_ORIGIN}/insights/${item.slug}`,
                  ...(item.data.datePublished ? { datePublished: item.data.datePublished } : {}),
                })),
              }
            : {}),
        }}
      />

      <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="font-display text-sm uppercase tracking-widest text-accent-blue">Insights</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-navy sm:text-5xl">
            Guidance from the Atlas South team
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate">
            Practical notes on facilities management, compliance and keeping commercial
            buildings running — written for the people responsible for them.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          {items === null && <p className="text-slate">Loading…</p>}

          {isEmpty && (
            <div className="mx-auto max-w-2xl rounded-xl border border-border bg-canvas p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
                <Icon name="newspaper" size={22} className="text-accent-blue" />
              </div>
              <h2 className="font-display text-xl font-bold text-navy">Articles coming shortly</h2>
              <p className="mt-3 text-slate">
                We're preparing a set of practical guides drawn from the work our teams do every
                day. In the meantime, if you have a specific question about your building or
                contract, our team will answer it directly — no obligation.
              </p>
              <Link
                to="/company/contact"
                className="mt-6 inline-flex min-h-[44px] items-center rounded bg-accent-blue px-6 text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy"
              >
                Ask our team
              </Link>
            </div>
          )}

          {items !== null && items.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.slug}
                  to={`/insights/${item.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-canvas p-6 transition-colors hover:border-accent-blue hover:bg-canvas-tint"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10">
                    <Icon name={item.data.icon ?? 'newspaper'} size={20} className="text-accent-blue" />
                  </div>
                  {item.data.category && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent-blue">
                      {item.data.category}
                    </p>
                  )}
                  <h2 className="mt-1 font-semibold text-navy group-hover:text-accent-blue">
                    {item.data.title}
                  </h2>
                  {item.data.summary && (
                    <p className="mt-3 flex-1 text-sm text-slate">{item.data.summary}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                    {item.data.author && <span>{item.data.author}</span>}
                    {item.data.readMinutes && <span>{item.data.readMinutes} min read</span>}
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
