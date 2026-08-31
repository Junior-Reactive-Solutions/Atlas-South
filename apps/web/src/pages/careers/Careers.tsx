import { Link } from 'react-router-dom';
import { useContentPage } from '../../hooks/useContentPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { Seo } from '../../components/seo/Seo.js';
import { COMPANY, PAGE_SEO } from '@atlas-south/shared';
import { Icon } from '@atlas-south/design-system';
import type { CareersContent } from '../../types/content';

export function Careers() {
  const { data, isLoading } = useContentPage<CareersContent>('careers');

  if (isLoading || !data) return <PageLoadingFallback />;

  return (
    <>
      <Seo
        {...PAGE_SEO['/company/join-us']}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          hiringOrganization: {
            '@type': 'Organization',
            name: COMPANY.name,
            sameAs: `https://${COMPANY.domain}`,
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: COMPANY.address.city,
              addressCountry: COMPANY.address.country,
            },
          },
        }}
      />

      {/* Hero section */}
      <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="font-display text-4xl font-bold text-navy sm:text-5xl">Join Our Team</h1>
          <p className="mt-4 text-lg text-slate">
            We're hiring talented professionals who share our commitment to excellence in London's facilities sector.
          </p>
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

      {/* Benefits section */}
      <section className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-12 font-display text-3xl font-bold text-navy">Why work with us?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-lg border border-border bg-canvas p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10">
                  {benefit.icon && <Icon name={benefit.icon} size={20} className="text-accent-blue" />}
                </div>
                <h3 className="font-semibold text-navy">{benefit.title}</h3>
                <p className="mt-2 text-sm text-slate">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-12 font-display text-3xl font-bold text-navy">Open Positions</h2>

          {data.openRoles.length === 0 ? (
            <div className="rounded-lg border border-border bg-canvas p-6 text-center">
              <p className="text-slate">No positions are currently open. Please check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.openRoles.map((role) => (
                <Link
                  key={role.slug}
                  to={`/company/join-us/${role.slug}`}
                  className="group block rounded-lg border border-border bg-canvas p-6 transition-colors hover:border-accent-blue hover:bg-canvas-tint"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-navy group-hover:text-accent-blue">{role.title}</h3>
                      {role.summary && <p className="mt-2 text-sm text-slate">{role.summary}</p>}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate">
                        <div className="flex items-center gap-1">
                          <Icon name={role.icon} size={16} />
                          {role.location}
                        </div>
                        <div>{role.hours}</div>
                        <div>Start: {role.startAvailability}</div>
                      </div>
                    </div>
                    <Icon
                      name="arrow-right"
                      size={20}
                      className="mt-1 shrink-0 text-slate-300 transition-colors group-hover:text-accent-blue"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Right to work section */}
      <section className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-sm text-slate">{data.rightToWorkNote}</p>
        </div>
      </section>

      {/* Contact CTA. Company nav now groups "Join Us" and "Contact Us" together (see the
          comment on COMPANY_PAGES in navigation.ts) — the header/footer dropdown no longer
          carries a standalone "Contact Us" item, so this page is one of the routes that
          keeps it reachable for a candidate with a question that isn't "I want to apply". */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-navy">Have a question before you apply?</h2>
          <p className="mt-3 text-slate">
            Get in touch and we'll point you to the right person.
          </p>
          <Link
            to="/company/contact"
            className="mt-6 inline-flex min-h-[44px] items-center rounded bg-accent-blue px-6 text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
