import { Link, useParams } from 'react-router-dom';
import { useContentPage } from '../../hooks/useContentPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { JobApplicationForm } from '../../components/careers/JobApplicationForm';
import { Seo } from '../../components/seo/Seo.js';
import { COMPANY } from '@atlas-south/shared';
import { Icon } from '@atlas-south/design-system';
import type { CareersContent } from '../../types/content';

/** Splits an admin-edited "one bullet per line" field into a real list — see the field
 * comments on OpenRole in types/content.ts for why these stay flat strings in the CMS
 * rather than nested arrays (the admin editor's generic ReorderableList only edits flat
 * string fields). Blank lines are dropped so an editor's stray Enter press doesn't add an
 * empty bullet. */
function bulletsFrom(value?: string): string[] {
  if (!value) return [];
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm text-slate">
          <Icon name="badge-check" size={16} className="mt-0.5 shrink-0 text-accent-blue" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * A role's own full-screen page — JD + application form. Replaces the previous pattern of
 * expanding the role inline as an accordion on the Careers listing (client feedback,
 * 2026-08-31: "it should open its own screen not just a drop down box").
 */
export function CareerDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useContentPage<CareersContent>('careers');

  if (isLoading || !data) return <PageLoadingFallback />;

  const role = data.openRoles.find((r) => r.slug === slug);

  if (!role) {
    return (
      <section className="py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="font-display text-3xl font-bold text-navy">Role not found</h1>
          <p className="mt-3 text-slate">This position may no longer be open.</p>
          <Link
            to="/company/join-us"
            className="mt-6 inline-flex min-h-[44px] items-center rounded bg-accent-blue px-6 text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy"
          >
            View open roles
          </Link>
        </div>
      </section>
    );
  }

  const responsibilities = bulletsFrom(role.responsibilities);
  const requirements = bulletsFrom(role.requirements);
  const whatWeOffer = bulletsFrom(role.whatWeOffer);

  return (
    <>
      <Seo
        title={role.title}
        description={role.summary || role.roleOverview || `Join Atlas South as a ${role.title}.`}
        path={`/company/join-us/${role.slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: role.title,
          description: role.roleOverview || role.summary || role.description || role.title,
          datePosted: new Date().toISOString().slice(0, 10),
          employmentType: role.hours.toUpperCase().includes('FULL') ? 'FULL_TIME' : undefined,
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

      {/* Hero */}
      <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <Link
            to="/company/join-us"
            className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-accent-blue hover:underline"
          >
            <Icon name="chevron-up" size={14} className="-rotate-90" />
            All open roles
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-blue/10">
              <Icon name={role.icon} size={28} className="text-accent-blue" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">{role.title}</h1>
              {role.summary && <p className="mt-3 max-w-2xl text-lg text-slate">{role.summary}</p>}
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-lg border border-border bg-canvas p-5 sm:grid-cols-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Location</dt>
              <dd className="mt-1 flex items-center gap-1 text-sm font-medium text-navy">
                <Icon name="map-pin" size={14} />
                {role.location}
              </dd>
            </div>
            {role.department && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Department</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{role.department}</dd>
              </div>
            )}
            {role.reportsTo && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reports to</dt>
                <dd className="mt-1 text-sm font-medium text-navy">{role.reportsTo}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Job type</dt>
              <dd className="mt-1 text-sm font-medium text-navy">{role.hours}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-4xl gap-12 px-4 lg:grid-cols-5 lg:gap-16">
          <div className="space-y-10 lg:col-span-3">
            {(role.roleOverview || role.description) && (
              <div>
                <h2 className="font-display text-xl font-bold text-navy">Role Overview</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate">{role.roleOverview || role.description}</p>
              </div>
            )}

            {responsibilities.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-navy">Key Responsibilities</h2>
                <BulletList items={responsibilities} />
              </div>
            )}

            {requirements.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-navy">What We're Looking For</h2>
                <BulletList items={requirements} />
              </div>
            )}

            {role.workingPattern && (
              <div>
                <h2 className="font-display text-xl font-bold text-navy">Working Pattern</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate">{role.workingPattern}</p>
              </div>
            )}

            {whatWeOffer.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-navy">What We Offer</h2>
                <BulletList items={whatWeOffer} />
              </div>
            )}
          </div>

          {/* Apply form — sticky on desktop so it stays reachable while reading a long JD. */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <h2 className="mb-4 font-display text-xl font-bold text-navy">Apply for this role</h2>
              <JobApplicationForm roleTitle={role.title} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
