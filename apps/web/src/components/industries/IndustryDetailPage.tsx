import { Link } from 'react-router-dom';
import { Icon, type IconName } from '@atlas-south/design-system';
import { QuoteForm } from '../home/QuoteForm';
import { Seo } from '../seo/Seo.js';
import { Markdown } from '../content/Markdown.js';
import { COMPANY } from '@atlas-south/shared';

interface ServiceHighlight {
  serviceLabel: string;
  description: string;
}

interface IndustryDetailPageProps {
  id: string;
  title: string;
  icon: IconName;
  /** Route this page is mounted at, e.g. "/industries/healthcare" — feeds Seo's canonical/OG URL. */
  path: string;
  heroDescription: string;
  overview: string;
  challenges: string;
  ourApproach: string;
  serviceHighlights: ServiceHighlight[];
  relatedServices?: Array<{ label: string; path: string }>;
}

/**
 * Industry detail page template — docs/build/06-PAGE-SPECIFICATIONS.md "Industries rows".
 * Reusable layout for individual industry pages. Each industry provides content
 * (title, description, challenges, approach), and this component handles the layout,
 * styling, and CTA integration.
 *
 * Also gives every industry page real SEO metadata (title, description, canonical,
 * OG/Twitter, WebPage JSON-LD) as a structural property of the template — see the same
 * note in ServiceDetailPage.tsx.
 */
export function IndustryDetailPage({
  title,
  icon,
  path,
  heroDescription,
  overview,
  challenges,
  ourApproach,
  serviceHighlights,
  relatedServices,
}: IndustryDetailPageProps) {
  return (
    <>
      <Seo
        title={`${title} Facilities & Technical Services`}
        description={heroDescription}
        path={path}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${title} Facilities & Technical Services`,
          description: heroDescription,
          about: title,
          isPartOf: {
            '@type': 'Organization',
            name: COMPANY.name,
            url: `https://${COMPANY.domain}`,
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
            <Markdown content={overview} />
          </div>
        </div>
      </section>

      {/* Challenges section */}
      <section className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 font-display text-2xl font-bold text-navy sm:text-3xl">
            Challenges specific to {title.toLowerCase()}
          </h2>
          <div className="prose prose-sm max-w-none sm:prose-base dark:prose-invert">
            <Markdown content={challenges} />
          </div>
        </div>
      </section>

      {/* Our approach section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 font-display text-2xl font-bold text-navy sm:text-3xl">
            How we serve {title.toLowerCase()}
          </h2>
          <div className="prose prose-sm max-w-none sm:prose-base dark:prose-invert">
            <Markdown content={ourApproach} />
          </div>
        </div>
      </section>

      {/* Service highlights grid */}
      {serviceHighlights.length > 0 && (
        <section className="bg-canvas-tint py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-12 text-center font-display text-3xl font-bold text-navy">
              Relevant services
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {serviceHighlights.map((highlight) => (
                <div key={highlight.serviceLabel} className="rounded-lg border border-border bg-canvas p-6">
                  <h3 className="mb-3 font-semibold text-navy">{highlight.serviceLabel}</h3>
                  <p className="text-sm text-slate">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related services */}
      {relatedServices && relatedServices.length > 0 && (
        <section className="bg-canvas-tint py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h3 className="mb-6 font-semibold text-navy">Explore all services</h3>
            <div className="flex flex-wrap gap-3">
              {relatedServices.map((service) => (
                <Link
                  key={service.path}
                  to={service.path}
                  className="inline-block rounded-lg border border-border bg-canvas px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-accent-blue hover:text-accent-blue"
                >
                  {service.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quote form CTA */}
      <QuoteForm />
    </>
  );
}
