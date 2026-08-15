import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SERVICE_AREAS } from '@atlas-south/shared';
import { Icon } from '@atlas-south/design-system';

/**
 * Schematic coverage map — the six real Service Area pages (SERVICE_AREAS,
 * @atlas-south/shared), currently reachable only from the nav dropdown, given a visual
 * home on the page most visitors land on first. "Do you cover me?" is one of the first
 * things a new visitor wants answered, and this turns it into a two-second glance instead
 * of a nav hunt.
 *
 * Deliberately schematic rather than a literal street map (no real geography, no mapping
 * library/API key) — a radial layout around a central hub, in the same decorative-node
 * language ServiceNetwork.tsx already established for this site (SVG lines behind, real
 * HTML links on top). Reads as precise/technical, consistent with the single-stroke icon
 * language, rather than promising cartographic accuracy it doesn't have. Node positions
 * are fixed percentages, not derived from real coordinates.
 *
 * The centre node is Central London itself, not a decorative "HQ" marker — the office
 * address (docs/build/13-COMPANY-FACTS-VERIFIED.md: Fitzrovia, W1T 6EB) genuinely is in
 * central London, so every one of the six real areas gets a working node; nothing here
 * is decoration standing in for a real page.
 */
const OUTER_AREA_IDS = ['north-london', 'east-london', 'south-east-london', 'surrey-kent', 'west-london'] as const;

const OUTER_POSITIONS: Record<(typeof OUTER_AREA_IDS)[number], { top: string; left: string }> = {
  'north-london': { top: '6%', left: '50%' },
  'east-london': { top: '30%', left: '87%' },
  'south-east-london': { top: '76%', left: '80%' },
  'surrey-kent': { top: '94%', left: '50%' },
  'west-london': { top: '76%', left: '20%' },
};

export function CoverageMap() {
  const centre = SERVICE_AREAS.find((a) => a.id === 'central-london');
  const outerNodes = OUTER_AREA_IDS.map((id) => SERVICE_AREAS.find((a) => a.id === id)).filter(
    (a): a is NonNullable<typeof a> => Boolean(a),
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const active = SERVICE_AREAS.find((a) => a.id === activeId);

  if (!centre || outerNodes.length !== OUTER_AREA_IDS.length) return null; // data shape changed — fail closed, not silently wrong

  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy px-4 py-12 sm:p-12">
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[1fr_260px] lg:items-center">
        {/* Radial layout */}
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          {/* Decorative connecting lines — aria-hidden, purely visual */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
            {outerNodes.map((node) => {
              const pos = OUTER_POSITIONS[node.id as (typeof OUTER_AREA_IDS)[number]];
              return (
                <line
                  key={node.id}
                  x1="50"
                  y1="50"
                  x2={parseFloat(pos.left)}
                  y2={parseFloat(pos.top)}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="0.6"
                  strokeDasharray="2 3"
                />
              );
            })}
          </svg>

          {/* Centre node — Central London */}
          <Link
            to={centre.path}
            onMouseEnter={() => setActiveId(centre.id)}
            onFocus={() => setActiveId(centre.id)}
            onMouseLeave={() => setActiveId(null)}
            onBlur={() => setActiveId(null)}
            className={`absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-colors ${
              activeId === centre.id ? 'bg-accent-blue' : 'bg-brand-blue hover:bg-accent-blue'
            }`}
            style={{ top: '50%', left: '50%' }}
          >
            <Icon name="map-pin" size={16} className="mb-0.5" />
            Central
          </Link>

          {/* Outer area nodes — real links, keyboard-focusable; hover/focus updates the
              detail panel. Each is still a fully working link even before any hover. */}
          {outerNodes.map((node) => {
            const pos = OUTER_POSITIONS[node.id as (typeof OUTER_AREA_IDS)[number]];
            return (
              <Link
                key={node.id}
                to={node.path}
                onMouseEnter={() => setActiveId(node.id)}
                onFocus={() => setActiveId(node.id)}
                onMouseLeave={() => setActiveId(null)}
                onBlur={() => setActiveId(null)}
                className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border px-1 text-center text-[9px] font-bold uppercase leading-tight text-white transition-colors ${
                  activeId === node.id
                    ? 'border-brand-blue bg-accent-blue'
                    : 'border-white/25 bg-navy-deep hover:border-brand-blue'
                }`}
                style={{ top: pos.top, left: pos.left }}
              >
                {node.label.replace(' London', '')}
              </Link>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="rounded-xl border border-white/15 bg-white/5 p-5 text-white">
          {active ? (
            <>
              <p className="font-display text-lg font-bold">{active.label}</p>
              <p className="mt-2 text-sm text-white/70">
                Full coverage details, response times and the local team for this area.
              </p>
              <Link
                to={active.path}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-brand-blue"
              >
                View {active.label} coverage
                <Icon name="arrow-right" size={14} />
              </Link>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-bold">London &amp; the South East</p>
              <p className="mt-2 text-sm text-white/70">Hover or tab through a node to see coverage for that area.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
