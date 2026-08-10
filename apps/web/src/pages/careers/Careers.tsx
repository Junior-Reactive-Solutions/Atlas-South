import { useState } from 'react';
import { useContentPage } from '../../hooks/useContentPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { JobApplicationForm } from '../../components/careers/JobApplicationForm';
import { Seo } from '../../components/seo/Seo.js';
import { COMPANY } from '@atlas-south/shared';
import { Icon } from '@atlas-south/design-system';
import type { CareersContent } from '../../types/content';

export function Careers() {
  const { data, isLoading } = useContentPage<CareersContent>('careers');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  if (isLoading || !data) return <PageLoadingFallback />;

  return (
    <>
      <Seo
        title="Careers at Atlas South | Join Our Team"
        description="Grow with Atlas South. We're hiring talented professionals to join our London-based team."
        path="/company/join-us"
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
                <div
                  key={role.title}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer rounded-lg border border-border bg-canvas p-6 transition-colors hover:bg-canvas-tint"
                  onClick={() => setSelectedRole(selectedRole === role.title ? null : role.title)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRole(selectedRole === role.title ? null : role.title); } }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-navy">{role.title}</h3>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate">
                        <div className="flex items-center gap-1">
                          <Icon name={role.icon} size={16} />
                          {role.location}
                        </div>
                        <div>{role.hours}</div>
                        <div>{role.payRange}</div>
                        <div>Start: {role.startAvailability}</div>
                      </div>
                    </div>
                  </div>

                  {selectedRole === role.title && (
                    <div className="mt-6 space-y-6 border-t border-border pt-6">
                      <div>
                        <h4 className="font-semibold text-navy">About this role</h4>
                        <p className="mt-2 text-sm text-slate">{role.description}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-navy">Apply now</h4>
                        <div className="mt-4">
                          <JobApplicationForm roleTitle={role.title} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
    </>
  );
}
