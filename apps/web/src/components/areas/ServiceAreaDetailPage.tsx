import { ReactNode } from 'react';
import { Icon, type IconName } from '@atlas-south/design-system';
import { QuoteForm } from '../home/QuoteForm';
import { Seo } from '../seo/Seo.js';
import { COMPANY } from '@atlas-south/shared';

interface ServiceAreaDetailPageProps {
  id: string;
  title: string;
  icon: IconName;
  /** Route this page is mounted at, e.g. "/areas/central-london" — feeds Seo's canonical/OG URL. */
  path: string;
  heroDescription: string;
  overview: ReactNode;
  responseTime: string;
  coverage: ReactNode;
  localProof?: ReactNode;
}

/**
 * Service area detail page template — docs/build/06-PAGE-SPECIFICATIONS.md "Service Areas".
 * Reusable layout for individual service area pages. All six areas (Central London, etc.) use
 * one shared template with location-specific data swapped in. Per the spec, no separate
 * content brief is required per area — these are structurally identical pages.
 *
 * Also gives every area page local-SEO metadata (title, description, canonical, OG/Twitter,
 * LocalBusiness JSON-LD scoped to that area via areaServed) — docs/build/09-SEO-PERFORMANCE-
 * CHECKLIST.md §8 requires each area page to target its specific location, not a generic
 * templated page with only the place-name swapped.
 */
export function ServiceAreaDetailPage({
  title,
  icon,
  path,
  heroDescription,
  overview,
  responseTime,
  coverage,
  localProof,
}: ServiceAreaDetailPageProps) {
  return (
    <>
      <Seo
        title={`Trades & Facilities Services in ${title}`}
        description={heroDescription}
        path={path}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: `${COMPANY.name} — ${title}`,
          telephone: COMPANY.phone.tel,
          url: `https://${COMPANY.domain}${path}`,
          areaServed: title,
          address: {
            '@type': 'PostalAddress',
            addressLocality: title,
            addressCountry: COMPANY.address.country,
          },
        }}
      />

      {/* Hero section */}
      <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-accent-blue/10 sm:h-24 sm:w-24">
              <Icon name={icon} size={48} className="text-accent-blue" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-slate">{heroDescription}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="prose prose-sm max-w-none sm:prose-base dark:prose-invert">
            {overview}
          </div>
        </div>
      </section>

      {/* Response time highlight */}
      <section className="bg-canvas-tint py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-lg border border-accent-blue bg-accent-blue/5 p-6 sm:p-8">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-accent-blue">
              Response time commitment
            </p>
            <p className="mt-2 text-center font-display text-2xl font-bold text-navy sm:text-3xl">
              {responseTime}
            </p>
          </div>
        </div>
      </section>

      {/* Coverage section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 font-display text-2xl font-bold text-navy sm:text-3xl">
            Coverage in {title.toLowerCase()}
          </h2>
          <div className="prose prose-sm max-w-none sm:prose-base dark:prose-invert">
            {coverage}
          </div>
        </div>
      </section>

      {/* Local proof section */}
      {localProof && (
        <section className="bg-canvas-tint py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-8 font-display text-2xl font-bold text-navy sm:text-3xl">
              Trusted by local organisations
            </h2>
            <div className="prose prose-sm max-w-none sm:prose-base dark:prose-invert">
              {localProof}
            </div>
          </div>
        </section>
      )}

      {/* Quote form CTA */}
      <QuoteForm />
    </>
  );
}
