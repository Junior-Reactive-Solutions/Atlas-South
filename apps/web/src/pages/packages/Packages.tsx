import { Link } from 'react-router-dom';
import { useContentPage } from '../../hooks/useContentPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { Seo } from '../../components/seo/Seo.js';
import { Icon } from '@atlas-south/design-system';
import { COMPANY } from '@atlas-south/shared';
import type { PackagesContent } from '../../types/content';
import { trackCTAClick } from '../../lib/analytics.js';

/**
 * Pricing & packages — restored to match the pre-rebuild live site, not redesigned.
 *
 * The audit (docs/audit/report.html §5.4, citing docs/audit/screenshots/atlas-sec-packages.png)
 * named this section a genuine strength worth protecting: "Transparent tiers, clear feature
 * comparison, explicit inclusions/exclusions." An earlier seed quietly replaced the real
 * three-tier £75/£180/£450 structure with four invented tiers at different prices — this
 * template renders the restored data (apps/api/scripts/seed-content.ts) with the same
 * fidelity the original had: a "Most Popular" badge and highlighted card on the middle
 * tier, and both what's included AND what's excluded per tier, not just the included list.
 */
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
          {data.eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-blue">
              {data.eyebrow}
            </p>
          )}
          <h1 className="mt-3 font-display text-4xl font-bold uppercase text-navy sm:text-5xl">
            {data.title}
          </h1>
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

      {/* Pricing tiers — three columns, matching the original's three plans rather than
          the four the rebuild had invented. */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {data.tiers.map((tier) => (
              <div
                key={tier.label}
                className={`relative flex flex-col rounded-lg border p-6 ${
                  tier.popular
                    ? 'border-accent-blue bg-accent-blue/5 shadow-lg'
                    : 'border-border bg-canvas'
                }`}
              >
                {/* "MOST POPULAR" badge — the original's Professional tier carried this,
                    which is real information (it tells a buyer what most people like them
                    chose), not decoration. */}
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-blue px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Most Popular
                  </span>
                )}

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10">
                  <Icon name={tier.icon} size={20} className="text-accent-blue" />
                </div>
                <h3 className="font-display text-lg font-bold text-navy">{tier.label}</h3>
                <p className="mt-2 text-sm font-semibold text-accent-blue">
                  {tier.startingFrom}
                  <span className="font-normal text-slate">/month</span>
                </p>
                <p className="mt-4 text-sm text-slate">{tier.description}</p>

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

                {/* Excludes — greyed out with an X, mirroring the original exactly. Showing
                    what a tier does NOT cover is what lets a buyer self-select the right
                    plan before enquiring, rather than finding out after contact. */}
                {tier.excludes && tier.excludes.length > 0 && (
                  <ul className="mt-2 space-y-2">
                    {tier.excludes.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-slate/50"
                      >
                        <Icon name="x" size={16} className="mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {/*
                  PayPal Subscribe button goes here — see apps/web/src/components/packages/
                  PayPalSubscribeButton.tsx once that lands. Kept as a link to the quote
                  form in the meantime so every tier still has a working call to action;
                  ?package= pre-fills the enquiry message with which tier was chosen
                  (see QuoteForm.tsx) so that context survives the navigation.
                */}
                <Link
                  to={`/company/contact?package=${encodeURIComponent(tier.label)}`}
                  onClick={() => trackCTAClick(`package-${tier.label}`)}
                  className={`mt-6 flex min-h-[44px] items-center justify-center rounded-lg px-4 text-sm font-semibold ${
                    tier.popular
                      ? 'bg-accent-blue text-white hover:bg-brand-blue'
                      : 'border border-navy text-navy hover:bg-navy hover:text-white'
                  }`}
                >
                  Subscribe — {tier.startingFrom}/mo
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-slate">
            <Icon name="shield-check" size={14} className="mr-1.5 inline text-accent-blue" />
            Secure payments via PayPal
            {data.cancellationNote && <> &nbsp;·&nbsp; {data.cancellationNote}</>}
          </p>
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
