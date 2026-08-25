import { useEffect, useRef } from 'react';
import { COMPANY } from '@atlas-south/shared';
import { animate } from 'animejs';
import { useScrollReveal, DURATION, prefersReducedMotion } from '@atlas-south/design-system';

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
/**
 * Splits "12,000+" into 12000 and "+" so the number can count up while the suffix stays
 * put. Returns null for anything that isn't a plain number with an optional trailing "+"
 * — "24/7" must render as written, and counting up to 24 then appending "/7" would be a
 * bug dressed as an animation.
 */
function parseCountable(value: string): { target: number; suffix: string } | null {
  const match = value.match(/^([\d,]+)(\+?)$/);
  if (!match) return null;
  const target = parseInt(match[1].replace(/,/g, ''), 10);
  if (!Number.isFinite(target) || target === 0) return null;
  return { target, suffix: match[2] };
}

export function StatBand({ eyebrow, heading, subcopy, stats = DEFAULT_STATS }: StatBandProps) {
  const root = useScrollReveal('.stat-item', { distance: 16 });
  const counted = useRef(false);

  // Count the numbers up when the band scrolls into view. Proof numbers are the most
  // persuasive thing on these pages, and a number that ticks up earns a half-second of
  // attention that a static one doesn't.
  useEffect(() => {
    const container = root.current;
    if (!container || prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || counted.current) return;
        counted.current = true;
        observer.disconnect();

        container.querySelectorAll<HTMLElement>('[data-stat-value]').forEach((el) => {
          const parsed = parseCountable(el.dataset.statValue ?? '');
          if (!parsed) return;

          const obj = { value: 0 };
          animate(obj, {
            value: parsed.target,
            duration: DURATION.slow,
            round: 1,
            onUpdate: () => {
              el.textContent = `${obj.value.toLocaleString('en-GB')}${parsed.suffix}`;
            },
          });
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [root, stats]);

  return (
    <section ref={root} className="bg-navy py-16 text-white sm:py-20" data-widget-theme="dark">
      <div className="mx-auto max-w-7xl px-4">
        {(eyebrow || heading || subcopy) && (
          <div className="mb-12 max-w-3xl">
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                {eyebrow}
              </p>
            )}
            {/* text-white is required, not decorative: index.css sets `h1,h2,h3,h4 { text-navy }`
                globally, so a heading inside a navy panel renders navy-on-navy and vanishes
                unless it overrides the colour explicitly. */}
            {heading && (
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                {heading}
              </h2>
            )}
            {subcopy && <p className="mt-4 text-white/80">{subcopy}</p>}
          </div>
        )}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item border-l-2 border-brand-blue pl-4">
              {/* data-stat-value carries the real figure so the counter can restore it
                  exactly; the rendered text is the source of truth if JS never runs. */}
              <dd
                data-stat-value={stat.value}
                className="font-display text-3xl font-black leading-none sm:text-4xl lg:text-5xl"
              >
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
