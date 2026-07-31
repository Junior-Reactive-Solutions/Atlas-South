import { Hero } from '../components/home/Hero';
import { ServiceCard } from '../components/home/ServiceCard';
import { Testimonials } from '../components/home/Testimonials';
import { QuoteForm } from '../components/home/QuoteForm';
import { HARD_SERVICES } from '@atlas-south/shared';

/**
 * Home — docs/build/06-PAGE-SPECIFICATIONS.md "Home & Company" table.
 * Hero: built out in full per docs/build/03-HERO-SECTION-SPEC.md (Sprint 1).
 * Hard Services grid: teaser for each service line (Sprint 3).
 * Testimonials: client quotes (Sprint 3).
 * Quote form: enquiry submission (Sprint 3).
 * Soft Services and beyond: Sprint 4+.
 */
export function Home() {
  return (
    <>
      <Hero />

      {/* Hard Services section — docs/build/06-PAGE-SPECIFICATIONS.md "Hard Services row" */}
      <section aria-label="Hard services" className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <p className="font-display text-sm uppercase tracking-widest text-accent-blue">
              Our core services
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-navy sm:text-4xl">
              Building services you can rely on
            </h2>
            <p className="mt-4 text-slate">
              From emergency response to routine maintenance, we handle every aspect of your building's
              technical systems.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HARD_SERVICES.slice(0, 6).map((service) => (
              <ServiceCard
                key={service.id}
                label={service.label}
                icon={service.icon}
                description={`Expert ${service.label.toLowerCase()} services for facilities of all sizes.`}
                path={service.path}
              />
            ))}
          </div>

          {HARD_SERVICES.length > 6 && (
            <div className="mt-8 text-center">
              <a href="/hard-services" className="text-sm font-semibold text-accent-blue hover:underline">
                View all hard services →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials section */}
      <Testimonials />

      {/* Quote form section */}
      <QuoteForm />

      {/* Soft Services teaser — link to Sprint 4 work */}
      <section aria-label="Soft services preview" className="py-16 text-center sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="font-display text-sm uppercase tracking-widest text-accent-blue">
            Coming soon
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-navy sm:text-4xl">
            Soft Services · Industries · Packages
          </h2>
          <p className="mt-4 text-slate">
            Additional service lines and industry-specific solutions built in Sprint 4+.
          </p>
        </div>
      </section>
    </>
  );
}
