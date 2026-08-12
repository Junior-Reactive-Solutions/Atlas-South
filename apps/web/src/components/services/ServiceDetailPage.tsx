import { Icon, type IconName } from '@atlas-south/design-system';
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

interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ServiceDetailPageProps {
  id: string;
  title: string;
  icon: IconName;
  /** Route this page is mounted at, e.g. "/hard-services/electricals" — feeds Seo's canonical/OG URL. */
  path: string;
  heroDescription: string;
  overview: string;
  features: Feature[];
  faqs: FAQ[];
  relatedServices?: Array<{ label: string; path: string }>;
}

/**
 * Service detail page template — docs/build/06-PAGE-SPECIFICATIONS.md "Hard/Soft Services rows".
 *
 * Rebuilt to mirror the inspiration site's (abm.co.uk) service-page architecture: photo
 * hero → benefits as alternating image/text panels → proof-point band → mid-page CTA →
 * FAQs → sibling services → quote form. The previous version put a 40px outline icon on a
 * pale strip and then rendered everything as prose in a narrow column, which is the main
 * reason the site read as documentation rather than as a marketing page.
 *
 * `features` already carried title/description/icon triples, so the panel layout reuses
 * the existing copy unchanged — no content migration was needed.
 *
 * Also the single place that gives every service page real SEO metadata (title, description,
 * canonical, OG/Twitter, Service + FAQPage JSON-LD) — docs/build/09-SEO-PERFORMANCE-CHECKLIST.md §2 —
 * so it's a structural property of the template rather than something to remember per page.
 */
export function ServiceDetailPage({
  id,
  title,
  path,
  heroDescription,
  overview,
  features,
  faqs,
  relatedServices,
}: ServiceDetailPageProps) {
  const relatedCards: GridCard[] = (relatedServices ?? []).map((service) => ({
    label: service.label,
    path: service.path,
  }));

  return (
    <>
      <Seo
        title={title}
        description={heroDescription}
        path={path}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: title,
            description: heroDescription,
            provider: {
              '@type': 'LocalBusiness',
              name: COMPANY.name,
              telephone: COMPANY.phone.tel,
              url: `https://${COMPANY.domain}`,
            },
            areaServed: 'London and the South East',
          },
          ...(faqs.length > 0
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faqs.map((faq) => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: faq.answer,
                    },
                  })),
                },
              ]
            : []),
        ]}
      />

      <PhotoHero
        eyebrow="Our services"
        title={title}
        description={heroDescription}
        image={heroImageFor(id)}
      />

      {/* Overview */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading eyebrow="Overview" title={`${title} you can rely on`} />
          <div className="prose prose-sm mt-8 max-w-3xl sm:prose-base dark:prose-invert">
            <Markdown content={overview} />
          </div>
        </div>
      </section>

      {/* Benefits — the former "What we provide" grid, now full panels */}
      {features.length > 0 && (
        <section className="bg-canvas-tint py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading
              eyebrow="Benefits"
              title="What we provide"
              subcopy="Every engagement covers the full lifecycle — not just the call-out."
            />
            <div className="mt-12">
              <BenefitPanels panels={features} />
            </div>
          </div>
        </section>
      )}

      <StatBand
        eyebrow="Why Atlas South"
        heading="Experience makes the difference"
        subcopy="The track record behind every job we take on."
      />

      <CtaBand
        heading={`Need ${title.toLowerCase()}?`}
        description="Tell us what you need and we'll respond within 24 hours — or call now for emergency cover."
        tone="tint"
      />

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <SectionHeading eyebrow="FAQs" title="Frequently asked questions" />
            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-border p-6 transition-colors hover:border-accent-blue hover:bg-canvas-tint"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-navy group-open:text-accent-blue">
                    {faq.question}
                    <Icon
                      name="arrow-right"
                      size={20}
                      className="flex-shrink-0 transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-slate">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related services */}
      {relatedCards.length > 0 && (
        <section className="bg-canvas-tint py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading eyebrow="More services" title="Related services" />
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
