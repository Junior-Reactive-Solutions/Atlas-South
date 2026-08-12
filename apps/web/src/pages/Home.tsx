import { Link } from 'react-router-dom';
import { Hero } from '../components/home/Hero';
import { QuoteForm } from '../components/home/QuoteForm';
import { Seo } from '../components/seo/Seo.js';
import { useContentPage } from '../hooks/useContentPage';
import { HARD_SERVICES, SOFT_SERVICES, INDUSTRIES, COMPANY } from '@atlas-south/shared';
import { Icon } from '@atlas-south/design-system';
import {
  SectionHeading,
  StatBand,
  CtaBand,
  CardGrid,
  ServiceNetwork,
  type GridCard,
} from '../components/sections';
import { photo } from '../content/imagery';

interface HomeContent {
  headlineLines: [string, string, string];
  subcopy: string;
  primaryCtaLabel: string;
  homeCtaLabel: string;
  businessCtaLabel: string;
  /** Optional — falls back to MISSION_FALLBACK so an un-reseeded database still renders. */
  missionStatement?: string;
}

/**
 * Short brand statement shown under the hero.
 *
 * Defaulted in code rather than required from the CMS so this section renders correctly
 * against a production database that predates the field. The wording is the mission
 * statement already approved in the company content seed — not new marketing copy.
 */
const MISSION_FALLBACK =
  "To be London's most trusted facilities partner, delivering exceptional service with integrity, reliability, and professionalism.";

/**
 * Reasons to choose Atlas South, built entirely from verified facts in COMPANY
 * (docs/build/13-COMPANY-FACTS-VERIFIED.md) rather than written as claims. Anything not
 * confirmed by that document does not belong in this list.
 */
const WHY_US = [
  {
    icon: 'clock',
    title: 'Round-the-clock cover',
    body: `${COMPANY.stats.coverage} emergency response across London and the South East, every day of the year.`,
  },
  {
    icon: 'badge-check',
    title: 'Certified and accredited',
    body: `${COMPANY.certifications.join(', ')} — every trade covered by the right accreditation.`,
  },
  {
    icon: 'shield',
    title: 'Fully insured',
    body: `${COMPANY.publicLiabilityInsurance} public liability insurance on every job we undertake.`,
  },
  {
    icon: 'map-pin',
    title: 'London specialists',
    body: `Operating from ${COMPANY.address.city} since ${COMPANY.foundedYear}, with engineers based across the region.`,
  },
];

/**
 * Home — docs/build/06-PAGE-SPECIFICATIONS.md "Home & Company" table.
 *
 * Restructured as a portal, mirroring the inspiration site's (abm.co.uk) homepage
 * architecture: hero → brand statement → industries grid → hard services → soft services
 * → proof band → why-us → careers → quote form.
 *
 * What was removed and why:
 * - The "COMING SOON — Soft Services · Industries" block. Both now have real sections;
 *   advertising the site as unfinished on its own homepage was the single most damaging
 *   thing on the page.
 * - The <Testimonials> section. Its three quotes were invented placeholder copy attributed
 *   to named people with job titles, which is not something that should be live. It comes
 *   back when the client supplies real, attributable client quotes.
 * - The per-service filler description ("Expert {service} services for facilities of all
 *   sizes.", repeated with the noun swapped). Cards now carry no description rather than a
 *   generated one; real teaser copy belongs in the CMS.
 */
export function Home() {
  const { data: content } = useContentPage<HomeContent>('home');

  const industryCards: GridCard[] = INDUSTRIES.map((industry) => ({
    navId: industry.id,
    label: industry.label,
    path: industry.path,
    icon: industry.icon,
    placeholder: industry.placeholder,
  }));

  const hardServiceCards: GridCard[] = HARD_SERVICES.map((service) => ({
    navId: service.id,
    label: service.label,
    path: service.path,
    icon: service.icon,
    placeholder: service.placeholder,
  }));

  const softServiceCards: GridCard[] = SOFT_SERVICES.map((service) => ({
    navId: service.id,
    label: service.label,
    path: service.path,
    icon: service.icon,
    placeholder: service.placeholder,
  }));

  return (
    <>
      <Seo
        title="Trades & Facilities Services in London & the South East"
        description="Atlas South delivers electrical, plumbing, fire safety and full facilities management for commercial buildings across London and the South East. 24/7 emergency cover."
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: COMPANY.name,
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
          foundingDate: String(COMPANY.foundedYear),
        }}
      />

      <Hero
        headlineLines={content?.headlineLines}
        subcopy={content?.subcopy}
        primaryCtaLabel={content?.primaryCtaLabel}
        businessCtaLabel={content?.businessCtaLabel}
      />

      {/* Brand statement */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="font-display text-2xl font-bold leading-snug text-navy sm:text-3xl lg:text-4xl">
            {content?.missionStatement ?? MISSION_FALLBACK}
          </p>
        </div>
      </section>

      {/* Scroll-reactive services panel — sits between the brand statement and the
          industries grid, the same slot the inspiration site uses for its equivalent. */}
      <ServiceNetwork />

      {/* Industries */}
      <section aria-label="Industries" className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Expertise tailored for you"
            title="Deep expertise in your industry"
            subcopy="Your estate has constraints a general contractor won't know about. Ours do."
            align="center"
          />
          <div className="mt-12">
            <CardGrid cards={industryCards} columns={4} ctaLabel="Explore industry" />
          </div>
        </div>
      </section>

      {/* Hard services */}
      <section aria-label="Hard services" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Hard services"
            title="The systems your building runs on"
            subcopy="Engineering, maintenance and compliance for the physical infrastructure of your facility."
          />
          <div className="mt-12">
            <CardGrid cards={hardServiceCards} columns={4} ctaLabel="View service" />
          </div>
        </div>
      </section>

      {/* Soft services */}
      <section aria-label="Soft services" className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Soft services"
            title="The services your people experience"
            subcopy="Cleaning, security, catering and front-of-house — delivered under the same single point of accountability."
          />
          <div className="mt-12">
            <CardGrid cards={softServiceCards} columns={4} ctaLabel="View service" />
          </div>
        </div>
      </section>

      <StatBand
        eyebrow="Track record"
        heading="Trusted by organisations across London"
        subcopy="Built steadily since 2018, one contract at a time."
      />

      {/* Why Atlas South */}
      <section aria-label="Why Atlas South" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Why Atlas South"
            title="What you get with every contract"
            align="center"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((reason) => (
              <div
                key={reason.title}
                className="rounded-2xl border border-border bg-canvas p-6"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
                  <Icon name={reason.icon} size={24} className="text-accent-blue" />
                </div>
                <h3 className="font-display text-lg font-bold text-navy">{reason.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate">{reason.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section aria-label="Careers" className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16">
          <img
            src={photo('crewOnSite', 1000)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
          />
          <div>
            <SectionHeading
              eyebrow="Join our team"
              title="Build your career with Atlas South"
              subcopy="We're always looking for qualified engineers and trades professionals who take ownership of their work."
            />
            <Link
              to="/company/join-us"
              className="group mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-accent-blue px-6 py-3 font-semibold text-white transition-all hover:bg-brand-blue"
            >
              View open roles
              <Icon
                name="arrow-right"
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        heading="Let's talk about your facility"
        description="Whether it's a one-off call-out or a fully managed contract, we'll come back within 24 hours."
        tone="navy"
      />

      <QuoteForm />
    </>
  );
}
