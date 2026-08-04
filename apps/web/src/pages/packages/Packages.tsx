import { useContentPage } from '../../hooks/useContentPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { Seo } from '../../components/seo/Seo.js';
import { COMPANY } from '@atlas-south/shared';
import type { PackagesContent } from '../../types/content';

export function Packages() {
  const { data, isLoading } = useContentPage<PackagesContent>('packages');

  if (isLoading || !data) return <PageLoadingFallback />;

  return (
    <>
      <Seo
        title="Pricing & Packages | Atlas South"
        description="Flexible residential and landlord property management packages from Atlas South. Find the right tier for your needs."
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
                <h3 className="font-display text-lg font-bold text-navy">{tier.label}</h3>
                <p className="mt-2 text-sm font-semibold text-accent-blue">{tier.startingFrom}</p>
                <p className="mt-4 text-sm text-slate">{tier.description}</p>
                <button className="mt-6 rounded-lg bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Get started
                </button>
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
          <a
            href="/company/contact"
            className="mt-6 inline-block rounded-lg bg-accent-blue px-8 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Get a quote
          </a>
        </div>
      </section>
    </>
  );
}
