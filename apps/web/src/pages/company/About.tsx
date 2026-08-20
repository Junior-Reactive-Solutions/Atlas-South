import { useContentPage } from '../../hooks/useContentPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { TimelineSection } from '../../components/company/TimelineSection';
import { ValuesGrid } from '../../components/company/ValuesGrid';
import { TeamGrid } from '../../components/company/TeamGrid';
import { CertificationsBar } from '../../components/company/CertificationsBar';
import { Seo } from '../../components/seo/Seo.js';
import { StatBand, StatsMarquee } from '../../components/sections';
import { COMPANY } from '@atlas-south/shared';
import type { CompanyContent } from '../../types/content';

export function About() {
  const { data, isLoading } = useContentPage<CompanyContent>('company');

  if (isLoading || !data) return <PageLoadingFallback />;

  return (
    <>
      <Seo
        title="About Atlas South | Trusted London Trade & Facilities Services"
        description="Founded in 2018, Atlas South has grown into London's full-service facilities company. Meet our team, learn our story."
        path="/company"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: COMPANY.name,
          foundingDate: '2018',
          telephone: COMPANY.phone.tel,
          email: COMPANY.email,
          url: `https://${COMPANY.domain}`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: `${COMPANY.address.line1}, ${COMPANY.address.line2}`,
            addressLocality: COMPANY.address.city,
            postalCode: COMPANY.address.postalCode,
            addressCountry: COMPANY.address.country,
          },
        }}
      />

      {/* Hero section */}
      <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="font-display text-sm uppercase tracking-widest text-accent-blue">Founded 2018 · London</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-navy sm:text-5xl">{data.tagline}</h1>
        </div>
      </section>

      <StatsMarquee />

      {/* Timeline section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-12 font-display text-3xl font-bold text-navy">Our Journey</h2>
          <TimelineSection timeline={data.timeline} />
        </div>
      </section>

      {/* Vision & Mission section. The `id` is load-bearing: COMPANY_PAGES (navigation.ts)
          links the header/footer "About Us" item at /company#vision-mission, and without an
          anchor here that link silently lands at the top of the page instead.

          Two columns, not one "Mission" block: the client's content drop (2026-08-20,
          "Atlas South-About-Us.pdf") supplied both a Vision and a Mission as distinct
          statements, closing a gap navigation.ts used to carry a long comment about — no
          vision statement existed anywhere in verified content, so the nav item pointing at
          one was removed rather than left dead. `visionStatement` is optional on
          CompanyContent (an already-seeded DB row predating this field won't have it), so
          the Vision column only renders when present rather than showing an empty box. */}
      <section id="vision-mission" className="scroll-mt-20 bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 font-display text-3xl font-bold text-navy">Vision & Mission</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {data.visionStatement && (
              <div>
                <h3 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide text-accent-blue">
                  Our Vision
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p>{data.visionStatement}</p>
                </div>
              </div>
            )}
            <div>
              <h3 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide text-accent-blue">
                Our Mission
              </h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p>{data.missionStatement}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-12 font-display text-3xl font-bold text-navy">Why We Do What We Do</h2>
          <ValuesGrid values={data.values} />
        </div>
      </section>

      {/* Team section */}
      <section className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-12 font-display text-3xl font-bold text-navy">Our Team</h2>
          <p className="mb-8 text-slate">Every member of our team is chosen for skill, reliability and character.</p>
          <TeamGrid team={data.team} />
        </div>
      </section>

      {/* Certifications section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 font-display text-3xl font-bold text-navy">Certified, Licensed & Fully Insured</h2>
          <CertificationsBar certifications={data.certifications} />
        </div>
      </section>

      {/*
        Stats section.

        Deliberately ignores `data.stats` from the CMS. That row was seeded with figures
        (100+ clients, 2,000+ jobs, 40+ team members) that contradicted the homepage's
        700+ clients / 12,000+ jobs and have no source — they were invented during content
        seeding. Only the homepage figures are verified, from the client's own live site
        (docs/build/13-COMPANY-FACTS-VERIFIED.md), so this renders the shared StatBand,
        which derives from COMPANY.stats. One set of numbers, one source, no drift.

        "Team members" is dropped entirely rather than guessed — reinstate it here only
        once the client confirms a real headcount.
      */}
      <StatBand />
    </>
  );
}
