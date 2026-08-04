import { useContentPage } from '../../hooks/useContentPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { TimelineSection } from '../../components/company/TimelineSection';
import { ValuesGrid } from '../../components/company/ValuesGrid';
import { TeamGrid } from '../../components/company/TeamGrid';
import { CertificationsBar } from '../../components/company/CertificationsBar';
import { Seo } from '../../components/seo/Seo.js';
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

      {/* Timeline section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-12 font-display text-3xl font-bold text-navy">Our Journey</h2>
          <TimelineSection timeline={data.timeline} />
        </div>
      </section>

      {/* Mission section */}
      <section className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 font-display text-3xl font-bold text-navy">Our Mission</h2>
          <div className="prose prose-sm max-w-none sm:prose-base dark:prose-invert">
            <p>{data.missionStatement}</p>
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

      {/* Stats section */}
      <section className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {data.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="font-display text-3xl font-bold text-navy">{stat.value}</dt>
                <dd className="mt-2 text-sm font-medium text-slate">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
