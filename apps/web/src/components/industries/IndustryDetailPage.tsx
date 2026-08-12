import { type IconName } from '@atlas-south/design-system';
import { QuoteForm } from '../home/QuoteForm';
import { Seo } from '../seo/Seo.js';
import { Markdown } from '../content/Markdown.js';
import { COMPANY } from '@atlas-south/shared';
import {
  PhotoHero,
  SectionHeading,
  BenefitPanels,
  StatBand,
  CtaBand,
  CardGrid,
  type GridCard,
} from '../sections';
import { heroImageFor } from '../../content/imagery';
import { parseBulletPanels } from '../../lib/parseBulletPanels';
import { navIdForPath } from '../../lib/navLookup';

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
 *
 * Rebuilt to mirror the section architecture of the inspiration site (abm.co.uk): photo
 * hero → overview → alternating challenge panels → proof-point band → approach panels →
 * mid-page CTA → capability grid → related services → quote form.
 *
 * The previous version rendered the same content as three markdown blocks in a narrow
 * centred column, which is why the client read the site as "completely different" from
 * the inspiration. No copy changed here — `challenges` and `ourApproach` are parsed from
 * their existing bullet form into panels, and fall back to prose when they don't fit that
 * shape (see parseBulletPanels).
 *
 * Also gives every industry page real SEO metadata (title, description, canonical,
 * OG/Twitter, WebPage JSON-LD) as a structural property of the template — see the same
 * note in ServiceDetailPage.tsx.
 */
export function IndustryDetailPage({
  id,
  title,
  path,
  heroDescription,
  overview,
  challenges,
  ourApproach,
  serviceHighlights,
  relatedServices,
}: IndustryDetailPageProps) {
  const challengePanels = parseBulletPanels(challenges);
  const approachPanels = parseBulletPanels(ourApproach);

  const relatedCards: GridCard[] = (relatedServices ?? []).map((service) => ({
    navId: navIdForPath(service.path),
    label: service.label,
    path: service.path,
  }));

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

      <PhotoHero
        eyebrow="Industries"
        title={title}
        description={heroDescription}
        image={heroImageFor(id)}
      />

      {/* Overview */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow={`${title} sector`}
            title={`Facilities services built around ${title.toLowerCase()}`}
          />
          <div className="prose prose-sm mt-8 max-w-3xl sm:prose-base dark:prose-invert">
            <Markdown content={overview} />
          </div>
        </div>
      </section>

      {/* Challenges — panels where the copy allows it, prose where it doesn't */}
      <section className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="The challenge"
            title={`What makes ${title.toLowerCase()} different`}
            subcopy={challengePanels?.lead || undefined}
          />
          <div className="mt-12">
            {challengePanels ? (
              <BenefitPanels panels={challengePanels.panels} />
            ) : (
              <div className="prose prose-sm max-w-3xl sm:prose-base dark:prose-invert">
                <Markdown content={challenges} />
              </div>
            )}
          </div>
        </div>
      </section>

      <StatBand
        eyebrow="Why Atlas South"
        heading="Proof, not promises"
        subcopy={`The numbers behind every ${title.toLowerCase()} contract we run.`}
      />

      {/* Our approach */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Our approach"
            title={`How we serve ${title.toLowerCase()}`}
            subcopy={approachPanels?.lead || undefined}
          />
          <div className="mt-12">
            {approachPanels ? (
              <BenefitPanels panels={approachPanels.panels} />
            ) : (
              <div className="prose prose-sm max-w-3xl sm:prose-base dark:prose-invert">
                <Markdown content={ourApproach} />
              </div>
            )}
          </div>
        </div>
      </section>

      <CtaBand
        heading={`Let's talk about your ${title.toLowerCase()} estate`}
        description="Tell us what you're responsible for and we'll come back within 24 hours with a plan and a price."
        tone="tint"
      />

      {/* Capability grid — these are capabilities, not linkable service pages */}
      {serviceHighlights.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading
              eyebrow={`${title} services`}
              title="What we cover"
              subcopy="Comprehensive support across every system your facility depends on."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {serviceHighlights.map((highlight) => (
                <div
                  key={highlight.serviceLabel}
                  className="rounded-2xl border border-border bg-canvas p-6"
                >
                  <h3 className="font-display text-lg font-bold text-navy">
                    {highlight.serviceLabel}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related services */}
      {relatedCards.length > 0 && (
        <section className="bg-canvas-tint py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading
              eyebrow="Explore solutions"
              title="Services available to this sector"
            />
            <div className="mt-12">
              <CardGrid cards={relatedCards} columns={4} ctaLabel="View service" />
            </div>
          </div>
        </section>
      )}

      <QuoteForm />
    </>
  );
}
