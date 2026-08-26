import { type IconName } from '@atlas-south/design-system';
import { QuoteForm } from '../home/QuoteForm';
import { Seo } from '../seo/Seo.js';
import { Markdown } from '../content/Markdown.js';
import { COMPANY, HARD_SERVICES, SOFT_SERVICES } from '@atlas-south/shared';
import {
  PhotoHero,
  SectionHeading,
  BenefitPanels,
  StatBand,
  CtaBand,
  CardGrid,
  type GridCard,
} from '../sections';
import { heroImageFor, heroImageAltFor, heroImageSrcSetFor } from '../../content/imagery';
import { parseBulletPanels } from '../../lib/parseBulletPanels';
import { useVisibleNavItems } from '../../hooks/useNavVisibility.js';

interface ServiceAreaDetailPageProps {
  id: string;
  title: string;
  icon: IconName;
  /** Route this page is mounted at, e.g. "/areas/central-london" — feeds Seo's canonical/OG URL. */
  path: string;
  heroDescription: string;
  overview: string;
  responseTime: string;
  coverage: string;
  localProof?: string;
}

/**
 * Service area detail page template — docs/build/06-PAGE-SPECIFICATIONS.md "Service Areas".
 * Reusable layout for individual service area pages. All six areas (Central London, etc.) use
 * one shared template with location-specific data swapped in. Per the spec, no separate
 * content brief is required per area — these are structurally identical pages.
 *
 * Rebuilt alongside the service and industry templates to mirror the inspiration site's
 * (abm.co.uk) section architecture, so all 21 detail pages share one visual language
 * rather than three. The response-time commitment is promoted into the hero-adjacent stat
 * band, since for a local-services page it is the single most persuasive fact on the page.
 *
 * Also gives every area page local-SEO metadata (title, description, canonical, OG/Twitter,
 * LocalBusiness JSON-LD scoped to that area via areaServed) — docs/build/09-SEO-PERFORMANCE-
 * CHECKLIST.md §8 requires each area page to target its specific location, not a generic
 * templated page with only the place-name swapped.
 */
export function ServiceAreaDetailPage({
  id,
  title,
  path,
  heroDescription,
  overview,
  responseTime,
  coverage,
  localProof,
}: ServiceAreaDetailPageProps) {
  const coveragePanels = parseBulletPanels(coverage);

  // Every service is available in every area, so the cross-link grid is the full service
  // list rather than a per-area subset — minus placeholder ("Coming Soon") and
  // admin-hidden entries, which the client doesn't want visible at all; see the shared
  // filter's own doc comment in useNavVisibility.tsx.
  const serviceCards: GridCard[] = useVisibleNavItems([...HARD_SERVICES, ...SOFT_SERVICES]).map((service) => ({
    navId: service.id,
    label: service.label,
    path: service.path,
    icon: service.icon,
    // Same per-slug photography the homepage's service grids already use
    // (content/imagery.ts) — this grid was rendering plain gradient tiles with no image,
    // unlike every equivalent card on the homepage.
    image: heroImageFor(service.id, 700),
    imageAlt: heroImageAltFor(service.id, 700),
  }));

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

      <PhotoHero
        eyebrow="Areas we cover"
        title={title}
        description={heroDescription}
        image={heroImageFor(id)}
        imageSrcSet={heroImageSrcSetFor(id)}
      />

      {/* Overview */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading eyebrow={title} title={`Facilities services across ${title}`} />
          <div className="prose prose-sm mt-8 max-w-3xl sm:prose-base dark:prose-invert">
            <Markdown content={overview} />
          </div>
        </div>
      </section>

      {/* responseTime is a full sentence, not a number, so it reads as the supporting line
          rather than the heading — as an H2 it rendered as an unwieldy all-caps paragraph. */}
      <StatBand
        eyebrow="Response commitment"
        heading={`Rapid response across ${title}`}
        subcopy={responseTime}
      />

      {/* Coverage */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Coverage"
            title={`Where we work in ${title}`}
            subcopy={coveragePanels?.lead || undefined}
          />
          <div className="mt-12">
            {coveragePanels ? (
              <BenefitPanels panels={coveragePanels.panels} slug={id} />
            ) : (
              <div className="prose prose-sm max-w-3xl sm:prose-base dark:prose-invert">
                <Markdown content={coverage} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Local proof */}
      {localProof && (
        <section className="bg-canvas-tint py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading eyebrow="Local track record" title="Trusted by local organisations" />
            <div className="prose prose-sm mt-8 max-w-3xl sm:prose-base dark:prose-invert">
              <Markdown content={localProof} />
            </div>
          </div>
        </section>
      )}

      <CtaBand
        heading={`Need a contractor in ${title}?`}
        description="Emergency call-outs and planned works both start with the same 24-hour response."
        tone="tint"
      />

      {/* All services, cross-linked */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Available here"
            title="Every service we offer"
            subcopy={`All Atlas South services are available across ${title}.`}
          />
          <div className="mt-12">
            <CardGrid cards={serviceCards} columns={4} ctaLabel="View service" />
          </div>
        </div>
      </section>

      <QuoteForm />
    </>
  );
}
