import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HARD_SERVICES, SOFT_SERVICES } from '@atlas-south/shared';
import { Icon, prefersReducedMotion } from '@atlas-south/design-system';
import { useVisibleNavItems } from '../../hooks/useNavVisibility.js';

/** The landscape SVG's coordinate space. Track and rest positions are in these units. */
const VB_W = 1200;
const VB_H = 820;

/**
 * One track per node: the line it rides, where it parks, and when it sets off.
 *
 * The shape of these paths is the whole point, and it is taken from how the inspiration
 * site (abm.co.uk) actually does it. Theirs is an After Effects composition exported to
 * Lottie and scrubbed by GSAP ScrollTrigger; reading its keyframe data shows each bubble
 * has only four position keys with spatial bezier tangents, describing a **run, a rounded
 * corner, then another run** — a circuit-board elbow, not a gentle S-curve. That corner is
 * what makes a viewer read the bubble as *following a track*: a shallow curve is
 * indistinguishable from drifting, whereas turning a corner can only be following
 * something.
 *
 * So each path here is: straight in from off the left edge → rounded corner (a quadratic,
 * which is what gives the constant-radius bend) → vertical run → second corner → straight
 * out to the resting point on the right.
 *
 * Unlike ABM's, these stop. Theirs continue off the left or right edge and loop; the brief
 * here was that they reach the right and stay, so progress is clamped at 1 and `endX/endY`
 * is a real parking spot rather than an exit.
 *
 * `endX`/`endY` must equal the final point of `d`, because they double as the node's CSS
 * resting position — where it sits with JavaScript off or reduced motion on. If they
 * disagree the node visibly jumps on first paint.
 */
const TRACKS = [
  {
    d: 'M-100,120 L240,120 Q300,120 300,180 L300,240 Q300,300 360,300 L1120,300',
    endX: 1120,
    endY: 300,
    delay: 0,
    size: 'lg',
  },
  {
    d: 'M-100,300 L360,300 Q420,300 420,240 L420,200 Q420,140 480,140 L1120,140',
    endX: 1120,
    endY: 140,
    delay: 0.08,
    size: 'md',
  },
  {
    d: 'M-100,460 L200,460 Q260,460 260,540 L260,600 Q260,660 320,660 L1000,660',
    endX: 1000,
    endY: 660,
    delay: 0.16,
    size: 'md',
  },
  {
    d: 'M-100,620 L460,620 Q520,620 520,560 L520,520 Q520,460 580,460 L1120,460',
    endX: 1120,
    endY: 460,
    delay: 0.24,
    // md, not lg: at lg its 48px radius left only a 12px gap to the node parked at y=560.
    size: 'md',
  },
  {
    d: 'M-100,180 L580,180 Q640,180 640,240 L640,320 Q640,380 700,380 L960,380',
    endX: 960,
    endY: 380,
    delay: 0.32,
    size: 'sm',
  },
  {
    d: 'M-100,700 L720,700 Q780,700 780,640 L780,620 Q780,560 840,560 L1120,560',
    endX: 1120,
    endY: 560,
    delay: 0.4,
    size: 'md',
  },
  {
    d: 'M-100,40 L140,40 Q200,40 200,100 L200,160 Q200,220 260,220 L880,220',
    endX: 880,
    endY: 220,
    delay: 0.48,
    size: 'sm',
  },
  {
    d: 'M-100,780 L300,780 Q360,780 360,720 L360,660 Q360,600 420,600 L1000,600',
    endX: 1000,
    endY: 600,
    delay: 0.56,
    size: 'sm',
  },
] as const;

/**
 * Below `lg` the panel becomes a grid, and motion is applied per *column* rather than per
 * cell. Grid cells sit in normal flow, so per-cell offsets would let vertically adjacent
 * cells slide into each other; driving whole columns means a cell only ever shares a
 * column with cells moving identically, so two cells can never collide.
 */
const COLUMN_MOTION = [
  { drift: -34, lag: -0.55 },
  { drift: 28, lag: 0.45 },
  { drift: -20, lag: -0.3 },
] as const;

const SIZE_CLASS = {
  sm: 'h-16 w-16',
  md: 'h-20 w-20',
  lg: 'h-24 w-24',
} as const;

const ICON_SIZE = { sm: 26, md: 32, lg: 38 } as const;

/** Decelerating arrival — quick along the track, gentle settle at the end. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * "Everything your building needs" — the scroll-reactive services panel.
 *
 * Mirrors the inspiration site's homepage panel, with service icons in place of ABM's
 * portrait bubbles so the section says something about the offering, and with each node a
 * real link to that service.
 *
 * At `lg` and up, each node rides one of the drawn lines. Scroll position scrubs a single
 * timeline (as ScrollTrigger scrubs their Lottie playhead), walking every node from its
 * off-screen left start, along the line, round the corners, to its parking spot on the
 * right. Positions come from `getPointAtLength` on the rendered path, so an icon is on the
 * line by construction rather than by two sets of coordinates being hand-matched.
 *
 * Three things make it read as *following a track* rather than floating, and all three
 * came from reading ABM's actual animation data:
 * - The paths turn corners. Gentle curves read as drift.
 * - The nodes sit **behind the copy** (the whole graphic is a background layer there too),
 *   which is what allows a track to cross the middle of the panel at all.
 * - Arrival is staggered, so nodes travel as separate traffic rather than one formation.
 *
 * Motion is a pure function of scroll position, clamped to [0,1]: scrolling up runs the
 * journey backwards, and progress cannot exceed 1, so nodes park on the right and stay.
 * A small velocity term nudges them along the line on a flick and decays when you stop,
 * which is what keeps them reliably clickable.
 *
 * Below `lg` there are no lines to ride — the layout is a grid — so that breakpoint keeps
 * the per-column drift described on COLUMN_MOTION.
 *
 * Under prefers-reduced-motion no loop starts and every node renders parked, which is also
 * where it sits with JavaScript disabled.
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
    const MAX_VELOCITY_OFFSET = { desktop: 70, compact: 20 };
    const LAG_SCALE = { desktop: 3, compact: 1.1 };
    /** How far a flick advances a node along its line, as a fraction of the path. */
    const PATH_VELOCITY_SCALE = 0.0016;

    let frame = 0;
    let running = false;
    let lastScrollY = window.scrollY;
    let smoothedVelocity = 0;

    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const threeColQuery = window.matchMedia('(min-width: 640px)');

    const paths = Array.from(section.querySelectorAll<SVGPathElement>('[data-track-path]'));
    /** Cached — getTotalLength forces geometry work and only changes on resize. */
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

      if (isDesktop) {
        // The SVG and the node layer cover the same box and the viewBox preserves no
        // aspect ratio, so viewBox units convert to pixels by a plain scale.
        const scaleX = rect.width / VB_W;
        const scaleY = rect.height / VB_H;

        // 0 as the panel's top edge reaches the bottom of the viewport, 1 shortly after its
        // top passes the top of the viewport. Spanning slightly more than a screen height
        // means the journey occupies a real stretch of scrolling rather than snapping
        // through while the panel is still arriving.
        const travel = clamp01((window.innerHeight - rect.top) / (window.innerHeight * 1.15));

        nodeRefs.current.forEach((node, index) => {
          const path = paths[index];
          if (!node || !path) return;

          const track = TRACKS[index % TRACKS.length];
          const total = pathLengths[index];

          // A zero length means geometry wasn't measurable when cached (the SVG is
          // `hidden lg:block`). Park the node rather than pinning it off-screen at t=0.
          if (!total) {
            node.style.transform = '';
            return;
          }

          // Stagger, then re-normalise so every node still completes by travel = 1.
          const staggered = clamp01((travel - track.delay) / (1 - track.delay));
          const t = clamp01(
            easeOutCubic(staggered) + smoothedVelocity * PATH_VELOCITY_SCALE,
          );

          const current = path.getPointAtLength(t * total);
          const rest = path.getPointAtLength(total);

          const dx = (current.x - rest.x) * scaleX;
          const dy = (current.y - rest.y) * scaleY;
          node.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
        });
      } else {
        const span = rect.height + window.innerHeight;
        const centred = clamp01((window.innerHeight - rect.top) / span) - 0.5;
        const cap = MAX_VELOCITY_OFFSET.compact;
        const columns = threeColQuery.matches ? 3 : 2;

        cellRefs.current.forEach((cell, index) => {
          if (!cell) return;
          const motion = COLUMN_MOTION[index % columns];
          const raw = smoothedVelocity * motion.lag * LAG_SCALE.compact;
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
      className="relative overflow-hidden bg-navy py-20 text-white sm:py-24 lg:min-h-[820px] lg:py-32"
    >
      {/*
        The lines the nodes ride. Decorative, so aria-hidden, and stroked in brand-blue —
        barred from text by the brand system for failing AA, but graphic strokes are exactly
        what it is reserved for (01-BRAND-SYSTEM.md §2).

        inset-0 with preserveAspectRatio="none" is load-bearing: the node layer covers the
        identical box, so viewBox units convert to pixels by a plain scale and the icons
        land on the drawn line.
      */}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full opacity-[0.35] lg:block"
      >
        <g fill="none" stroke="#0078FC" strokeWidth="2">
          {TRACKS.map((track) => (
            <path key={track.d} data-track-path d={track.d} />
          ))}
        </g>
      </svg>

      {/* Portrait variant for phone and tablet. The landscape network squeezed into a tall
          panel would distort the lines into near-vertical streaks; this is drawn for that
          shape. Nothing rides these — below lg the layout is a grid. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 900"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-25 lg:hidden"
      >
        <g fill="none" stroke="#0078FC" strokeWidth="2">
          <path d="M60,-40 L60,200 Q60,260 120,260 L300,260 Q360,260 360,320 L360,980" />
          <path d="M340,-40 L340,140 Q340,200 280,200 L100,200 Q40,200 40,260 L40,980" />
          <path d="M-20,560 L140,560 Q200,560 200,620 L200,980" />
          <path d="M420,700 L300,700 Q240,700 240,760 L240,980" />
        </g>
      </svg>

      {/*
        Node layer — a sibling of the SVG covering the identical box, and sitting *behind*
        the copy (z-10 vs the content's z-20).

        That stacking is what makes the whole effect possible: on ABM the animation is a
        background layer (`possibilities-section_bg`) and bubbles pass behind the headline.
        Keeping ours in front would force every track to detour around the copy column,
        which is precisely what made the earlier attempt read as floating rather than
        travelling.
      */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
        {services.map((service, index) => {
          const track = TRACKS[index % TRACKS.length];
          return (
            // The positioning wrapper carries the centring translate so it can't be
            // clobbered by the animated transform written onto the link itself.
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
                className={`pointer-events-auto flex ${SIZE_CLASS[track.size]} items-center justify-center rounded-full border border-brand-blue/40 bg-navy-deep shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-colors will-change-transform hover:border-brand-blue hover:bg-accent-blue`}
              >
                <Icon name={service.icon} size={ICON_SIZE[track.size]} className="text-white" />
              </Link>
            </div>
          );
        })}
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-4">
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
