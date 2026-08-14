import { Link } from 'react-router-dom';
import { useContentPage } from '../../hooks/useContentPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { Seo } from '../../components/seo/Seo.js';
import { Icon } from '@atlas-south/design-system';
import { COMPANY } from '@atlas-south/shared';
import type { PackagesContent } from '../../types/content';
import { trackCTAClick } from '../../lib/analytics.js';

export function Packages() {
  const { data, isLoading } = useContentPage<PackagesContent>('packages');

  if (isLoading || !data) return <PageLoadingFallback />;

  return (
    <>
      <Seo
        title="Pricing & Packages | Atlas South"
        description="Flexible commercial facilities management service agreements from Atlas South. Find the right SLA tier for your business."
        path="/packages"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: COMPANY.name,
          telephone: COMPANY.phone.tel,
          email: COMPANY.email,
          url: `https://${COMPANY.domain}`,
        }}
      />

      {/* Hero section */}
      <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="font-display text-4xl font-bold text-navy sm:text-5xl">{data.title}</h1>
          <p className="mt-4 text-lg text-slate">{data.heroDescription}</p>
        </div>
      </section>

      {/* Intro section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="prose prose-sm max-w-none sm:prose-base dark:prose-invert">
            <p>{data.intro}</p>
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {data.tiers.map((tier) => (
              <div key={tier.label} className="flex flex-col rounded-lg border border-border bg-canvas p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10">
                  <Icon name={tier.icon} size={20} className="text-accent-blue" />
                </div>
                <h3 className="font-display text-lg font-bold text-navy">{tier.label}</h3>
                <p className="mt-2 text-sm font-semibold text-accent-blue">{tier.startingFrom}</p>
                <p className="mt-4 text-sm text-slate">{tier.description}</p>

                {/* `includes` was already part of the content model but never rendered —
                    a price with nothing shown next to it justifying it is a weaker CTA
                    than the same price beside a concrete list of what it buys. It's
                    optional in practice: the live seeded content doesn't set it for any
                    tier today, so this renders nothing extra until the client supplies
                    real inclusions rather than this inventing placeholder bullet copy. */}
                {tier.includes && tier.includes.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {tier.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate">
                        <Icon
                          name="badge-check"
                          size={16}
                          className="mt-0.5 flex-shrink-0 text-accent-blue"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {/*
                  Previously a bare <button> with no href, no onClick, and no form to
                  submit — a dead click target on every one of these four cards. Now a
                  real link into the quote form, carrying which tier was chosen through
                  as a `?package=` query param (see QuoteForm.tsx) so that context isn't
                  lost the way it would be sending everyone to the same blank contact page.
                */}
                <Link
                  to={`/company/contact?package=${encodeURIComponent(tier.label)}`}
                  onClick={() => trackCTAClick(`package-${tier.label}`)}
                  className="mt-6 flex min-h-[44px] items-center justify-center rounded-lg bg-accent-blue px-4 text-sm font-semibold text-white hover:bg-brand-blue"
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-navy">Ready to find your package?</h2>
          <p className="mt-4 text-slate">Get in touch with us to discuss which tier is right for you.</p>
          <Link
            to="/company/contact"
            onClick={() => trackCTAClick('packages-bottom-cta')}
            className="mt-6 inline-block rounded-lg bg-accent-blue px-8 py-3 font-semibold text-white hover:bg-brand-blue"
          >
            Get a quote
          </Link>
        </div>
      </section>
    </>
  );
}
