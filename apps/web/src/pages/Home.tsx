import { Hero } from '../components/home/Hero';

/**
 * Home — docs/build/06-PAGE-SPECIFICATIONS.md "Home & Company" table.
 * Hero is built out in full per docs/build/03-HERO-SECTION-SPEC.md (Sprint 1 priority).
 * The teaser grids (Hard Services / Soft Services / Industries / Packages / stats /
 * testimonials / quote form) are Sprint 3+ per the roadmap in
 * docs/build/00-MASTER-PLAN.md — left as a clearly marked placeholder rather than
 * built out shallow, so it's obvious this page isn't finished rather than looking
 * silently incomplete.
 */
export function Home() {
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-7xl px-4 py-16 text-center text-slate">
        <p className="font-display text-lg uppercase tracking-wide text-navy">
          Homepage sections below the hero
        </p>
        <p className="mt-2">
          Hard Services · Soft Services · Industries · Packages · testimonials · quote
          form — built in Sprint 3 onward per docs/build/00-MASTER-PLAN.md.
        </p>
      </section>
    </>
  );
}
