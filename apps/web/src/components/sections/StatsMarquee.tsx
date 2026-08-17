import { COMPANY } from '@atlas-south/shared';
import { prefersReducedMotion } from '@atlas-south/design-system';

/**
 * A slim, continuously-scrolling strip of the site's verified proof numbers — deliberately
 * lighter and more ambient than StatBand.tsx's fuller grid treatment (which keeps its own
 * dedicated section further down the page); this is meant to be glanced at while scrolling
 * past, not read as its own destination. Same source of truth as StatBand: every figure
 * here comes from COMPANY.stats/COMPANY.foundedYear/COMPANY.certifications/
 * COMPANY.publicLiabilityInsurance — nothing here is a new claim, only a different way of
 * showing the same already-verified ones (docs/build/13-COMPANY-FACTS-VERIFIED.md).
 *
 * One component, used on both Home (below the hero) and About (page header) — see
 * docs/build/02-ANIMATION-SYSTEM.md's point that the same standard of motion should hold
 * "no matter how far from the homepage": this is that principle applied to content as well
 * as motion — one definition of "the numbers", never a second copy that can drift.
 */
export function StatsMarquee() {
  const items: Array<{ value: string; label: string }> = [
    { value: COMPANY.stats.clients, label: 'Clients served' },
    { value: COMPANY.stats.jobsCompleted, label: 'Jobs completed' },
    { value: COMPANY.stats.coverage, label: 'Emergency cover' },
    { value: String(COMPANY.foundedYear), label: 'Founded' },
    { value: COMPANY.certifications.length.toString(), label: 'Trade certifications held' },
    { value: COMPANY.publicLiabilityInsurance, label: 'Public liability insurance' },
  ];

  // Reduced motion: render once, statically, centred — no duplicate/scroll, so a
  // screen-reader or keyboard user never encounters the doubled list at all.
  if (prefersReducedMotion()) {
    return (
      <div className="border-y border-white/10 bg-navy py-5" aria-label="Atlas South at a glance">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-10 gap-y-3 px-4">
          {items.map((item) => (
            <span key={item.label} className="flex items-baseline gap-2 text-white">
              <span className="font-display text-xl font-black">{item.value}</span>
              <span className="text-xs uppercase tracking-wide text-white/60">{item.label}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden border-y border-white/10 bg-navy py-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
      aria-label="Atlas South at a glance"
    >
      <div className="flex w-max animate-stats-marquee">
        {/* Rendered twice back-to-back so the CSS animation (translateX -50%) loops with
            no visible seam — see the `stats-marquee` keyframe in tailwind.config.js. The
            duplicate is aria-hidden; screen readers only get the first, real copy. */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex" aria-hidden={copy === 1}>
            {items.map((item) => (
              <span
                key={item.label}
                className="flex items-baseline gap-2 whitespace-nowrap border-r border-white/10 px-8 text-white first:pl-4"
              >
                <span className="font-display text-2xl font-black">{item.value}</span>
                <span className="text-xs uppercase tracking-wide text-white/60">{item.label}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
