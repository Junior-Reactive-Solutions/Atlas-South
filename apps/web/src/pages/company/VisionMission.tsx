import { useContentPage } from '../../hooks/useContentPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { Seo } from '../../components/seo/Seo.js';
import { COMPANY } from '@atlas-south/shared';
import type { CompanyContent } from '../../types/content';

export function VisionMission() {
  const { data, isLoading } = useContentPage<CompanyContent>('company');

  if (isLoading || !data) return <PageLoadingFallback />;

  return (
    <>
      <Seo
        title="Vision & Mission | Atlas South"
        description="Our vision is to be the most trusted facilities partner for organisations where standards and compliance are always on the line. Our mission drives every job we deliver."
        path="/company/vision-mission"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: COMPANY.name,
          url: `https://${COMPANY.domain}`,
        }}
      />

      {/* Hero */}
      <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="font-display text-sm uppercase tracking-widest text-accent-blue">Who We Are</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-navy sm:text-5xl">Vision & Mission</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate">
            The principles that guide how we work, who we work with, and the standard we hold ourselves to on every site.
          </p>
        </div>
      </section>

      {/* Vision */}
      {data.visionStatement && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-10">
              <div className="shrink-0">
                <span className="inline-block rounded-full bg-accent-blue/10 px-4 py-1 font-display text-xs font-semibold uppercase tracking-widest text-accent-blue">
                  Our Vision
                </span>
              </div>
              <blockquote className="border-l-4 border-accent-blue pl-6">
                <p className="font-display text-xl font-medium leading-relaxed text-navy sm:text-2xl">
                  {data.visionStatement}
                </p>
              </blockquote>
            </div>
          </div>
        </section>
      )}

      {/* Mission */}
      <section className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-10">
            <div className="shrink-0">
              <span className="inline-block rounded-full bg-navy/10 px-4 py-1 font-display text-xs font-semibold uppercase tracking-widest text-navy">
                Our Mission
              </span>
            </div>
            <blockquote className="border-l-4 border-navy pl-6">
              <p className="font-display text-xl font-medium leading-relaxed text-navy sm:text-2xl">
                {data.missionStatement}
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Values teaser → links to About */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 font-display text-2xl font-bold text-navy">Want to know more?</h2>
          <p className="mb-8 text-slate">
            Read our full story — how we started, who we are, and the certifications that back every job we deliver.
          </p>
          <a
            href="/company"
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 font-semibold text-white transition-colors hover:bg-navy/90"
          >
            About Atlas South →
          </a>
        </div>
      </section>
    </>
  );
}
