import { Link } from 'react-router-dom';
import { Icon, type IconName } from '@atlas-south/design-system';
import { QuoteForm } from '../home/QuoteForm';
import { Seo } from '../seo/Seo.js';
import { Markdown } from '../content/Markdown.js';
import { COMPANY } from '@atlas-south/shared';

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
 * Reusable layout for individual service pages. Each service provides content (title, description,
 * features, FAQs), and this component handles the layout, animations, and CTA integration.
 *
 * Also the single place that gives every service page real SEO metadata (title, description,
 * canonical, OG/Twitter, Service + FAQPage JSON-LD) — docs/build/09-SEO-PERFORMANCE-CHECKLIST.md §2 —
 * so it's a structural property of the template rather than something to remember per page.
 */
export function ServiceDetailPage({
  title,
  icon,
  path,
  heroDescription,
  overview,
  features,
  faqs,
  relatedServices,
}: ServiceDetailPageProps) {
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

      {/* Hero section */}
      <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-accent-blue/10 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
              <Icon name={icon} size={40} className="text-accent-blue sm:hidden" />
              <Icon name={icon} size={48} className="hidden text-accent-blue sm:block" />
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

      {/* Features grid */}
      {features.length > 0 && (
        <section className="bg-canvas-tint py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-12 text-center font-display text-3xl font-bold text-navy">
              What we provide
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-lg border border-border bg-canvas p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
                    <Icon name={feature.icon} size={24} className="text-accent-blue" />
                  </div>
                  <h3 className="mb-2 font-semibold text-navy">{feature.title}</h3>
                  <p className="text-sm text-slate">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs section */}
      {faqs.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-8 font-display text-3xl font-bold text-navy">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-lg border border-border p-6 hover:border-accent-blue hover:bg-canvas-tint"
                >
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-navy group-open:text-accent-blue">
                    {faq.question}
                    <Icon name="arrow-right" size={20} className="transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-4 text-sm text-slate">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related services */}
      {relatedServices && relatedServices.length > 0 && (
        <section className="bg-canvas-tint py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h3 className="mb-6 font-semibold text-navy">Related services</h3>
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
