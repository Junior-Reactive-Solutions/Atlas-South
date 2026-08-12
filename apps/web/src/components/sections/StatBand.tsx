import { COMPANY } from '@atlas-south/shared';
import { animate, stagger } from 'animejs';
import { useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';

export interface Stat {
  value: string;
  /** Short unit line under the number, e.g. "years". Optional. */
  unit?: string;
  label: string;
}

interface StatBandProps {
  eyebrow?: string;
  heading?: string;
  subcopy?: string;
  /** Defaults to the canonical company stats — see the note on DEFAULT_STATS. */
  stats?: Stat[];
}

/**
 * The site-wide proof numbers, derived from COMPANY.stats in @atlas-south/shared.
 *
 * Deriving rather than restating is deliberate. The site previously carried two
 * contradicting sets of figures — the homepage claimed 700+ clients / 12,000+ jobs while
 * the About page content claimed 100+ clients / 2,000+ jobs — because each was typed out
 * where it was displayed. Anything rendering proof numbers should read them from
 * COMPANY.stats so a single edit moves every surface at once.
 */
const DEFAULT_STATS: Stat[] = [
  { value: COMPANY.stats.clients, label: 'Clients served across London & the South East' },
  { value: COMPANY.stats.jobsCompleted, label: 'Jobs completed since 2018' },
  { value: COMPANY.stats.coverage, label: 'Emergency cover, every day of the year' },
  {
    value: `${new Date().getFullYear() - COMPANY.foundedYear}+`,
    unit: 'years',
    label: 'Operating as a London facilities partner',
  },
];

/**
 * Proof-point band — the inspiration site (abm.co.uk) runs one of these on every industry
 * and service page ("40+ years", "500+ vehicles", "70+ hospitals serviced"), and it is a
 * large part of why those pages read as credible. This is that block in our palette.
 */
export function StatBand({ eyebrow, heading, subcopy, stats = DEFAULT_STATS }: StatBandProps) {
  const root = useAnimationScope(
    (self) => {
      self?.add('reveal', () => {
        animate('.stat-item', {
          opacity: [0, 1],
          translateY: [16, 0],
          delay: stagger(STAGGER_GAP),
          duration: DURATION.slow,
          ease: EASE.standard,
        });
      });
    },
    [stats.length],
  );

  return (
    <section ref={root} className="bg-navy py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4">
        {(eyebrow || heading || subcopy) && (
          <div className="mb-12 max-w-3xl">
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{heading}</h2>
            )}
            {subcopy && <p className="mt-4 text-white/80">{subcopy}</p>}
          </div>
        )}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item border-l-2 border-brand-blue pl-4">
              <dd className="font-display text-3xl font-black leading-none sm:text-4xl lg:text-5xl">
                {stat.value}
              </dd>
              {stat.unit && (
                <dd className="mt-1 font-display text-base font-bold text-white/70">{stat.unit}</dd>
              )}
              <dt className="mt-3 text-sm leading-snug text-white/75">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
