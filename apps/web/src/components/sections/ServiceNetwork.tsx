import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HARD_SERVICES, SOFT_SERVICES } from '@atlas-south/shared';
import { Icon, prefersReducedMotion } from '@atlas-south/design-system';
import { useVisibleNavItems } from '../../hooks/useNavVisibility.js';

/** The landscape SVG's coordinate space. Node positions are expressed in these units. */
const VB_W = 1200;
const VB_H = 760;

/**
 * One track per node: the curve it rides, where it comes to rest, and when it sets off.
 *
 * Each `d` starts off the left edge (x = -80) and ends on the right, so a node entering at
 * the path's start is genuinely off-screen and arrives at a resting point that is still
 * comfortably inside the panel — the brief was that they reach the right and stay, not that
 * they fly off it.
 *
 * The left-hand portion of every curve is routed through the top or bottom margin
 * (y < ~100 or y > ~560 while x < 640). The copy column occupies the middle-left of the
 * panel, and a node travelling straight across would drag an icon over the headline on its
 * way past. Routing around it is what lets them enter from the far left at all.
 *
 * `endX`/`endY` duplicate the final point of `d` because they double as the node's CSS
 * resting position — that is where it sits with JavaScript disabled or reduced motion on,
 * so the two must agree or the node would visibly jump on first paint.
 *
 * `delay` staggers arrival: without it all six reach the right edge on the same frame,
 * which reads as one object splitting rather than as traffic along separate lines.
 */
const TRACKS = [
  {
    d: 'M-80,40 C240,40 460,52 680,95 C860,130 990,175 1120,210',
    endX: 1120,
    endY: 210,
    delay: 0,
    size: 'md',
  },
  {
    d: 'M-80,70 C260,70 480,80 700,95 C880,150 1010,250 1120,330',
    endX: 1120,
    endY: 330,
    delay: 0.1,
    size: 'lg',
  },
  {
    d: 'M-80,10 C280,10 480,25 680,50 C860,72 1000,95 1120,110',
    endX: 1120,
    endY: 110,
    delay: 0.18,
    size: 'sm',
  },
  {
    d: 'M-80,720 C240,720 440,700 640,660 C840,620 990,590 1120,560',
    endX: 1120,
    endY: 560,
    delay: 0.06,
    size: 'md',
  },
  {
    d: 'M-80,690 C260,690 460,660 660,610 C860,560 1000,490 1120,450',
    endX: 1120,
    endY: 450,
    delay: 0.14,
    size: 'sm',
  },
  {
    d: 'M-80,750 C300,750 520,745 700,730 C880,715 1010,690 1120,670',
    endX: 1120,
    endY: 670,
    delay: 0.22,
    size: 'md',
  },
  {
    d: 'M-80,45 C260,45 480,58 700,92 C830,125 940,205 1010,270',
    endX: 1010,
    endY: 270,
    delay: 0.26,
    size: 'sm',
  },
  {
    d: 'M-80,740 C260,740 480,720 680,690 C840,665 950,640 1010,610',
    endX: 1010,
    endY: 610,
    delay: 0.3,
    size: 'sm',
  },
] as const;

/**
 * Below `lg` the panel becomes a grid, and the motion is applied per *column* rather than
 * per cell. Grid cells sit in normal flow, so per-cell offsets would let vertically
 * adjacent cells slide into each other; driving whole columns means a cell only ever
 * shares a column with cells moving identically, so two cells can never collide.
 *
 * Indexed by column against `grid-cols-2 sm:grid-cols-3`.
 */
const COLUMN_MOTION = [
  { drift: -34, lag: -0.55 },
  { drift: 28, lag: 0.45 },
  { drift: -20, lag: -0.3 },
] as const;

const SIZE_CLASS = {
  sm: 'h-14 w-14',
  md: 'h-20 w-20',
  lg: 'h-24 w-24',
} as const;

const ICON_SIZE = { sm: 22, md: 30, lg: 36 } as const;

/** Decelerating arrival — fast entry, gentle settle. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * "Everything your building needs" — the scroll-reactive services panel.
 *
 * Modelled on the inspiration site's (abm.co.uk) homepage panel. Ours substitutes service
 * icons for ABM's portrait bubbles, so the section says something about the offering, and
 * every node is a real link to that service.
 *
 * At `lg` and above the nodes **ride the curves**. Each is bound to one path; scrolling the
 * panel into view walks it from the path's off-screen left start to its resting point on
 * the right, following the line the whole way. Position is read straight off the SVG
 * geometry with `getPointAtLength`, so the icons sit on the drawn line by construction
 * rather than by two sets of coordinates being kept in sync by hand.
 *
 * Motion is a pure function of scroll position, clamped to [0,1]:
 * - Scrolling up runs the journey backwards rather than merely stopping.
 * - Progress cannot exceed 1, so nodes arrive at the right and stay there. They never
 *   continue off the edge.
 * - A small velocity term is added on top, so a fast flick nudges them along the line and
 *   settles when you stop. It decays to nothing, which is what keeps them clickable.
 *
 * Below `lg` there are no curves to ride — the layout is a grid — so that breakpoint keeps
 * the per-column drift described on COLUMN_MOTION.
 *
 * Under prefers-reduced-motion no loop starts and every node renders at its resting point,
 * which is also exactly where it sits with JavaScript disabled.
 */
export function ServiceNetwork() {
  const sectionRef = useRef<HTMLElement>(null);
  const nodeRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const cellRefs = useRef<Array<HTMLLIElement | null>>([]);

  // Hidden services must not be advertised here either — this reads through the same
  // visibility switches as the header, footer and card grids.
  const services = useVisibleNavItems([...HARD_SERVICES, ...SOFT_SERVICES]).slice(
    0,
    TRACKS.length,
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    const MAX_VELOCITY = 55;
    const VELOCITY_EASING = 0.12;
    const SETTLED = 0.05;

    /** Ceiling on the velocity term alone. Touch reaches far higher per-frame deltas. */
    const MAX_VELOCITY_OFFSET = { desktop: 70, compact: 20 };
    const LAG_SCALE = { desktop: 3, compact: 1.1 };
    /** How much a flick advances a node along its curve, as a fraction of the path. */
    const PATH_VELOCITY_SCALE = 0.0016;

    let frame = 0;
    let running = false;
    let lastScrollY = window.scrollY;
    let smoothedVelocity = 0;

    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const threeColQuery = window.matchMedia('(min-width: 640px)');

    const paths = Array.from(
      section.querySelectorAll<SVGPathElement>('[data-track-path]'),
    );
    /** Cached: getTotalLength forces geometry work, and it only changes on resize. */
    let pathLengths = paths.map((p) => p.getTotalLength());

    const resetTransforms = () => {
      nodeRefs.current.forEach((el) => el && (el.style.transform = ''));
      cellRefs.current.forEach((el) => el && (el.style.transform = ''));
    };

    const render = () => {
      const rect = section.getBoundingClientRect();

      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      const clamped = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, delta));
      smoothedVelocity += (clamped - smoothedVelocity) * VELOCITY_EASING;

      const isDesktop = desktopQuery.matches;
      const mode = isDesktop ? 'desktop' : 'compact';

      if (isDesktop) {
        // The SVG and the node layer both cover the section box exactly, and the viewBox
        // has no preserved aspect ratio, so viewBox units map to pixels by a plain scale.
        // Doing the conversion here rather than via getScreenCTM keeps it obvious and
        // avoids a matrix allocation per node per frame.
        const scaleX = rect.width / VB_W;
        const scaleY = rect.height / VB_H;

        // 0 as the panel's top edge reaches the bottom of the viewport, 1 by the time it
        // has risen most of a screen. The journey is therefore complete while the panel is
        // still arriving, which is what leaves the nodes parked on the right as you read.
        const travel = clamp01((window.innerHeight - rect.top) / (window.innerHeight * 0.9));

        nodeRefs.current.forEach((node, index) => {
          const path = paths[index];
          if (!node || !path) return;

          const track = TRACKS[index % TRACKS.length];
          const total = pathLengths[index];

          // A zero length means the geometry wasn't measurable when it was cached — the
          // SVG is `hidden lg:block`, so a browser that reports nothing for a non-rendered
          // path would otherwise leave every node pinned at t=0, i.e. off-screen left and
          // invisible. Bail to the resting position instead of hiding the whole panel.
          if (!total) {
            node.style.transform = '';
            return;
          }

          // Stagger, then re-normalise so every node still completes at travel = 1.
          const staggered = clamp01((travel - track.delay) / (1 - track.delay));
          const nudge = smoothedVelocity * PATH_VELOCITY_SCALE;
          const t = clamp01(easeOutCubic(staggered) + nudge);

          const current = path.getPointAtLength(t * total);
          const rest = path.getPointAtLength(total);

          const dx = (current.x - rest.x) * scaleX;
          const dy = (current.y - rest.y) * scaleY;
          node.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
        });
      } else {
        const span = rect.height + window.innerHeight;
        const centred = clamp01((window.innerHeight - rect.top) / span) - 0.5;
        const cap = MAX_VELOCITY_OFFSET[mode];
        const columns = threeColQuery.matches ? 3 : 2;

        cellRefs.current.forEach((cell, index) => {
          if (!cell) return;
          const motion = COLUMN_MOTION[index % columns];
          const raw = smoothedVelocity * motion.lag * LAG_SCALE[mode];
          const offset = centred * motion.drift + Math.max(-cap, Math.min(cap, raw));
          cell.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        });
      }

      if (Math.abs(smoothedVelocity) < SETTLED && Math.abs(delta) < SETTLED) {
        running = false;
        frame = 0;
        return;
      }

      frame = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(render);
    };

    // Crossing a breakpoint swaps which element set is driven; clear both first, or
    // whichever set stopped being driven keeps its last transform for good.
    const onLayoutChange = () => {
      pathLengths = paths.map((p) => p.getTotalLength());
      resetTransforms();
      start();
    };

    desktopQuery.addEventListener('change', onLayoutChange);
    threeColQuery.addEventListener('change', onLayoutChange);
    window.addEventListener('resize', onLayoutChange, { passive: true });

    let attached = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible && !attached) {
          lastScrollY = window.scrollY;
          window.addEventListener('scroll', start, { passive: true });
          attached = true;
          start();
        } else if (!visible && attached) {
          window.removeEventListener('scroll', start);
          attached = false;
          running = false;
          if (frame) window.cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0 },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      desktopQuery.removeEventListener('change', onLayoutChange);
      threeColQuery.removeEventListener('change', onLayoutChange);
      window.removeEventListener('resize', onLayoutChange);
      if (attached) window.removeEventListener('scroll', start);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [services.length]);

  if (services.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-label="Our services"
      className="relative overflow-hidden bg-navy py-20 text-white sm:py-24 lg:min-h-[760px] lg:py-32"
    >
      {/*
        The curves the nodes ride. Decorative, so aria-hidden, and stroked in brand-blue —
        barred from text by the brand system for failing AA, but graphic strokes are
        precisely what it is reserved for (01-BRAND-SYSTEM.md §2).

        inset-0 with preserveAspectRatio="none" is deliberate and load-bearing: the node
        layer below covers the same box, so viewBox units convert to pixels by a plain
        scale factor and the icons land exactly on the drawn line.
      */}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-40 lg:block"
      >
        <g fill="none" stroke="#0078FC" strokeWidth="2">
          {TRACKS.map((track) => (
            <path key={track.d} data-track-path d={track.d} />
          ))}
        </g>
      </svg>

      {/* Portrait variant for phone and tablet. The landscape network squeezed into a tall
          panel would distort the curves into near-vertical streaks; this is drawn for that
          shape. Nothing rides these — below lg the layout is a grid. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 900"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-25 lg:hidden"
      >
        <g fill="none" stroke="#0078FC" strokeWidth="2">
          <path d="M60,-40 C60,180 300,260 300,520 C300,760 120,820 120,980" />
          <path d="M340,-40 C340,200 90,300 90,540 C90,780 280,840 280,980" />
          <path d="M-20,220 C120,220 180,420 320,420 C400,420 420,340 460,340" />
          <path d="M-20,660 C140,660 200,480 340,480" />
        </g>
      </svg>

      {/*
        Node layer — a sibling of the SVG covering the identical box, NOT nested inside the
        padded content container. Sharing one coordinate space with the SVG is what allows
        a node's resting percentage and the path's end point to be the same number.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        {services.map((service, index) => {
          const track = TRACKS[index % TRACKS.length];
          return (
            // Positioning wrapper carries the centring translate so it can't be clobbered
            // by the animated transform written onto the link itself.
            <div
              key={service.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(track.endX / VB_W) * 100}%`,
                top: `${(track.endY / VB_H) * 100}%`,
              }}
            >
              <Link
                to={service.path}
                ref={(el) => {
                  nodeRefs.current[index] = el;
                }}
                title={service.label}
                tabIndex={-1}
                className={`pointer-events-auto flex ${SIZE_CLASS[track.size]} items-center justify-center rounded-full border border-white/20 bg-navy-deep/90 shadow-lg backdrop-blur-sm transition-colors will-change-transform hover:border-brand-blue hover:bg-accent-blue`}
              >
                <Icon name={service.icon} size={ICON_SIZE[track.size]} className="text-white" />
              </Link>
            </div>
          );
        })}
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
            One contractor, every discipline
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Everything your building needs, under one contract
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">
            Hard services and soft services from a single team, with one point of contact
            and one invoice. No coordinating four contractors when something fails at 2am.
          </p>
          <Link
            to="/company/contact"
            className="group mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-accent-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-blue"
          >
            Talk to our team
            <Icon
              name="arrow-right"
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/*
          The real, accessible list of services.

          `lg:sr-only` rather than `lg:hidden`: the nodes above are aria-hidden decoration
          with tabIndex={-1} so they neither double-announce nor add tab stops, so hiding
          this list outright would leave a screen-reader or keyboard user with no service
          links from this section at all on desktop.

          Generous gap-y because whole columns travel vertically against each other below
          lg; a tight row gap lets a rising column sit level with a falling one and read as
          a broken grid.
        */}
        <ul className="mt-14 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-y-10 lg:sr-only">
          {services.map((service, index) => (
            <li
              key={service.id}
              ref={(el) => {
                cellRefs.current[index] = el;
              }}
              className="will-change-transform"
            >
              <Link
                to={service.path}
                className="flex min-h-[44px] items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3 text-sm font-medium text-white transition-colors hover:border-brand-blue hover:bg-white/10"
              >
                <Icon name={service.icon} size={20} className="flex-shrink-0 text-white/80" />
                <span className="leading-tight">{service.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
