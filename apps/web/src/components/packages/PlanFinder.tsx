import { useState } from 'react';
import type { PricingTier } from '../../types/content';

interface PlanFinderProps {
  tiers: PricingTier[];
}

const MAX_PROPERTIES = 12;

/**
 * "How many properties?" slider that highlights the matching pricing tier live — a
 * shortcut for an undecided visitor, sitting above the full three-tier comparison
 * (Packages.tsx), not a replacement for it.
 *
 * Boundaries (1 property / up to 5 / unlimited) are the real, restored tier limits from
 * apps/api/scripts/seed-content.ts's PACKAGES_CONTENT — matched by tier position
 * (Starter/Professional/Enterprise, in that order) rather than parsing the `includes`
 * copy, which would be fragile if that wording ever changes. This assumes exactly the
 * three tiers the original site had; if a fourth tier is ever added, the thresholds below
 * need revisiting alongside it.
 */
export function PlanFinder({ tiers }: PlanFinderProps) {
  const [properties, setProperties] = useState(1);

  if (tiers.length !== 3) return null; // see boundary-matching note above

  const matchIndex = properties === 1 ? 0 : properties <= 5 ? 1 : 2;

  return (
    <div className="rounded-xl border border-border bg-canvas-tint p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="plan-finder-slider" className="text-sm font-semibold text-navy">
          How many properties do you need covered?
        </label>
        <span className="font-display text-2xl font-bold text-accent-blue" aria-hidden="true">
          {properties >= MAX_PROPERTIES ? `${MAX_PROPERTIES}+` : properties}
        </span>
      </div>

      <input
        id="plan-finder-slider"
        type="range"
        min={1}
        max={MAX_PROPERTIES}
        step={1}
        value={properties}
        onChange={(e) => setProperties(Number(e.target.value))}
        className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent-blue"
        aria-valuetext={properties >= MAX_PROPERTIES ? `${MAX_PROPERTIES} or more properties` : `${properties} ${properties === 1 ? 'property' : 'properties'}`}
      />

      <div className="mt-6 grid grid-cols-3 gap-3">
        {tiers.map((tier, i) => (
          <div
            key={tier.label}
            className={`rounded-lg border p-3 text-center transition-colors ${
              i === matchIndex ? 'border-accent-blue bg-accent-blue/10' : 'border-border bg-canvas'
            }`}
          >
            <p className="font-display text-sm font-bold text-navy">{tier.label}</p>
            <p className="mt-0.5 text-xs text-slate">{tier.startingFrom}/mo</p>
            <p
              className={`mt-2 text-[10px] font-bold uppercase tracking-wide text-accent-blue ${
                i === matchIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Your match
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
