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
 * Every track is routed so the node never overlaps the copy block. While a node is left of
 * roughly x=562 (the right edge of the `max-w-xl` column) it stays either above y=88 or
 * below y=572, which are the copy's top and bottom in this coordinate space; the corners
 * and vertical runs all happen at x>600, clear of the text. That constraint is what lets
 * the node layer sit *above* the copy, and therefore stay hoverable for the entire journey
 * rather than going dead while it passes behind the headline. The checked-in geometry
 * script asserts it, because it is easy to break by nudging a single number.
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
  // Consecutive delays alternate between the band above the copy and the band below it.
  // Neither band is tall enough to hold two nodes side by side, so same-band neighbours are
  // kept apart in *time* instead — which is why the delays matter as much as the geometry,
  // and why the checked-in script replays the timeline to prove no pair ever overlaps.
  {
    d: 'M-100,40 L580,40 Q640,40 640,110 L640,240 Q640,300 700,300 L1120,300',
    endX: 1120,
    endY: 300,
    delay: 0,
    size: 'md',
  },
  {
    d: 'M-100,700 L800,700 Q860,700 860,640 L860,620 Q860,560 920,560 L1120,560',
    endX: 1120,
    endY: 560,
    delay: 0.1,
    size: 'md',
  },
  {
    // Parks short of the right edge, between tracks 0 and 3 rather than level with either.
    // Earlier rest points at y=360 and y=400 each clipped a neighbour by ~12px mid-transit.
    // Entry at y=72 rather than 88: at 88 this node cleared the copy box by only 8px.
    d: 'M-100,72 L760,72 Q820,72 820,160 L820,320 Q820,380 880,380 L940,380',
    endX: 940,
    endY: 380,
    delay: 0.2,
    size: 'sm',
  },
  {
    d: 'M-100,620 L560,620 Q620,620 620,560 L620,520 Q620,460 680,460 L1120,460',
    endX: 1120,
    endY: 460,
    delay: 0.3,
    size: 'md',
  },
  {
    d: 'M-100,40 L700,40 Q760,40 760,90 L760,100 Q760,140 820,140 L880,140',
    endX: 880,
    endY: 140,
    delay: 0.4,
    size: 'sm',
  },
  {
    d: 'M-100,760 L640,760 Q700,760 700,720 L700,700 Q700,660 760,660 L1000,660',
    endX: 1000,
    endY: 660,
    delay: 0.5,
    size: 'md',
  },
  {
    d: 'M-100,96 L700,96 Q760,96 760,160 L760,180 Q760,220 820,220 L860,220',
    endX: 860,
    endY: 220,
    delay: 0.6,
    size: 'sm',
  },
  {
    d: 'M-100,680 L500,680 Q560,680 560,730 L560,750 Q560,780 620,780 L820,780',
    endX: 820,
    endY: 780,
    delay: 0.7,
    size: 'sm',
  },
] as const;

/**
 * Portrait counterpart to TRACKS, ridden below `lg` in a self-contained "stage" box (see
 * the JSX) rather than across the full section. On a phone or tablet, the copy column runs
 * full-width above this stage instead of sitting beside it, so there is no clear lane to
 * route a landscape-style track through — the same "run, corner, run" idiom TRACKS uses is
 * kept, but folded into a compact two-column grid of parking spots instead of one long run
 * across a 1200-unit-wide canvas.
 *
 * Direction is deliberately different from TRACKS, not just re-scaled: TRACKS travels
 * left-to-right because that's the reading/scan direction on a wide desktop panel, but a
 * phone or tablet is scrolled vertically, so these enter from *above* and descend — motion
 * that reads as "arriving as you scroll down" rather than a sideways slide that has nothing
 * to do with how the page is actually being navigated.
 *
 * Column 0 (x=100) tracks run mostly straight down — there's no text to dodge in this
 * dedicated stage, so the elbow that matters is reserved for column 1 (x=300), which
 * dog-legs sideways into its column after descending, keeping the same "turning a corner
 * reads as following a track" principle TRACKS relies on, just rotated 90°. Index order
 * matches TRACKS/services 1:1 (both are 8 long), alternating column each step exactly as
 * TRACKS alternates band, so the same delay stagger keeps neighbours apart in time.
 */
const MOBILE_VB_W = 400;
const MOBILE_VB_H = 420;
const MOBILE_TRACKS = [
  { d: 'M100,-120 L100,55', endX: 100, endY: 55, delay: 0, size: 'sm' },
  { d: 'M340,-120 L340,25 Q340,55 300,55', endX: 300, endY: 55, delay: 0.1, size: 'sm' },
  { d: 'M100,-120 L100,155', endX: 100, endY: 155, delay: 0.2, size: 'sm' },
  { d: 'M340,-120 L340,125 Q340,155 300,155', endX: 300, endY: 155, delay: 0.3, size: 'sm' },
  { d: 'M100,-120 L100,255', endX: 100, endY: 255, delay: 0.4, size: 'sm' },
  { d: 'M340,-120 L340,225 Q340,255 300,255', endX: 300, endY: 255, delay: 0.5, size: 'sm' },
  { d: 'M100,-120 L100,355', endX: 100, endY: 355, delay: 0.6, size: 'sm' },
  { d: 'M340,-120 L340,325 Q340,355 300,355', endX: 300, endY: 355, delay: 0.7, size: 'sm' },
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
 * At every breakpoint each node rides one of a set of drawn lines, scrubbed by scroll
 * position exactly like a single ScrollTrigger-driven timeline: walking every node from
 * its off-screen start, along the line, round the corners, to its parking spot. Positions
 * come from `getPointAtLength` on the rendered path, so an icon is on the line by
 * construction rather than by two sets of coordinates being hand-matched.
 *
 * `lg` and up rides the landscape TRACKS across the full section — see the doc comment on
 * that constant. Below `lg` there's no room to route a line around full-width copy, so a
 * dedicated "stage" box below the copy carries its own compact MOBILE_TRACKS instead (see
 * that constant's doc comment) — same riding mechanism, same corner-elbow idiom, same
 * scroll-driven progress and velocity nudge, just folded into a two-column grid sized for a
 * narrow screen rather than spread across a full desktop-width canvas.
 *
 * Three things make it read as *following a track* rather than floating, and all three
 * came from reading ABM's actual animation data:
 * - The paths turn corners. Gentle curves read as drift.
 * - The nodes sit **above the copy** at every breakpoint, which is what keeps every node
 *   hoverable/tappable for its entire journey rather than going dead passing behind text.
 * - Arrival is staggered, so nodes travel as separate traffic rather than one formation.
 *
 * Motion is a pure function of scroll position, clamped to [0,1]: scrolling up runs the
 * journey backwards, and progress cannot exceed 1, so nodes park and stay.
 * A small velocity term nudges them along the line on a flick and decays when you stop,
 * which is what keeps them reliably clickable/tappable.
 *
 * Under prefers-reduced-motion no loop starts and every node renders parked, which is also
 * where it sits with JavaScript disabled.
 */
export function ServiceNetwork() {
  const sectionRef = useRef<HTMLElement>(null);
  const mobileStageRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const mobileNodeRefs = useRef<Array<HTMLAnchorElement | null>>([]);

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
    /** How far a flick advances a node along its line, as a fraction of the path. */
    const PATH_VELOCITY_SCALE = 0.0016;

    let frame = 0;
    let running = false;
    let lastScrollY = window.scrollY;
    let smoothedVelocity = 0;

    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    const desktopPathEls = Array.from(section.querySelectorAll<SVGPathElement>('[data-track-path]'));
    const mobilePathEls = Array.from(
      section.querySelectorAll<SVGPathElement>('[data-track-path-mobile]'),
    );
    /** Cached — getTotalLength forces geometry work and is constant in viewBox units. */
    let desktopPathLengths = desktopPathEls.map((p) => p.getTotalLength());
    let mobilePathLengths = mobilePathEls.map((p) => p.getTotalLength());

    const resetTransforms = () => {
      nodeRefs.current.forEach((el) => el && (el.style.transform = ''));
      mobileNodeRefs.current.forEach((el) => el && (el.style.transform = ''));
    };

    const render = () => {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      const clamped = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, delta));
      smoothedVelocity += (clamped - smoothedVelocity) * VELOCITY_EASING;

      const isDesktop = desktopQuery.matches;
      const stageEl = isDesktop ? section : mobileStageRef.current;

      if (!stageEl) {
        running = false;
        frame = 0;
        return;
      }

      const rect = stageEl.getBoundingClientRect();
      const vbW = isDesktop ? VB_W : MOBILE_VB_W;
      const vbH = isDesktop ? VB_H : MOBILE_VB_H;

      // The SVG and the node layer cover the same box in both modes, and neither viewBox
      // preserves aspect ratio, so viewBox units convert to pixels by a plain scale.
      const scaleX = rect.width / vbW;
      const scaleY = rect.height / vbH;

      // 0 as the stage's top edge reaches the bottom of the viewport, 1 shortly after its
      // top passes the top of the viewport. Spanning slightly more than a screen height
      // means the journey occupies a real stretch of scrolling rather than snapping
      // through while the stage is still arriving.
      const travel = clamp01((window.innerHeight - rect.top) / (window.innerHeight * 1.15));

      const tracks = isDesktop ? TRACKS : MOBILE_TRACKS;
      const paths = isDesktop ? desktopPathEls : mobilePathEls;
      const lengths = isDesktop ? desktopPathLengths : mobilePathLengths;
      const nodes = isDesktop ? nodeRefs.current : mobileNodeRefs.current;

      nodes.forEach((node, index) => {
        const path = paths[index];
        if (!node || !path) return;

        const track = tracks[index % tracks.length];
        const total = lengths[index];

        // A zero length means geometry wasn't measurable when cached (the SVG was
        // display:none at mount). Park the node rather than pinning it off-screen at t=0.
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

    // Crossing the breakpoint swaps which element set is driven; clear both first, or
    // whichever set stopped being driven keeps its last transform for good.
    const onLayoutChange = () => {
      desktopPathLengths = desktopPathEls.map((p) => p.getTotalLength());
      mobilePathLengths = mobilePathEls.map((p) => p.getTotalLength());
      resetTransforms();
      start();
    };

    desktopQuery.addEventListener('change', onLayoutChange);
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
      window.removeEventListener('resize', onLayoutChange);
      if (attached) window.removeEventListener('scroll', start);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [services.length]);

  if (services.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-label="Our services"
      // `isolate` is load-bearing, not decorative. The header is `sticky z-30`
      // (Header.tsx), and the node layer below is also z-30 — with no stacking context
      // between them, those two z-30s compete directly and DOM order breaks the tie: this
      // section renders after the header, so its nodes painted OVER the sticky nav once you
      // scrolled past the panel. `isolate` gives this section its own stacking context, so
      // every z-index inside it (the curves, the nodes, the copy) is contained here and can
      // never out-rank anything outside — the header stays on top regardless of scroll.
      // `scroll-mt-20` (80px, header is 65px) is for the hero's "For Your Business" anchor
      // link (Hero.tsx) — without it, the sticky header would cover the top of this panel
      // whenever it's scrolled to via #services.
      className="isolate relative scroll-mt-20 overflow-hidden bg-navy py-20 text-white sm:py-24 lg:min-h-[820px] lg:py-32"
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

      {/* Node layer — a sibling of the SVG covering the identical box, at z-30, i.e. *above*
          the copy.

          It started below the copy (matching ABM, whose animation is a background layer and
          whose bubbles pass behind the headline). That looked right but broke interaction:
          a node behind the text is not hoverable, so each icon went dead for part of its
          journey. Since the tracks are now routed clear of the copy block (see the note on
          TRACKS), nothing is gained by keeping them underneath — and putting them on top is
          what makes them hoverable from the moment they enter to the moment they park. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 hidden lg:block">
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

      {/*
        pointer-events-none on this wrapper is load-bearing, not tidiness.

        It is a full-width block sitting at z-20 above the node layer, so with pointer
        events enabled it swallowed every hover across the whole panel — including the empty
        right-hand area where the nodes park. Four of the six services were simply not
        hoverable. Capture is re-enabled below on the copy column and the service list,
        which are the only parts that actually need it, so the transparent gutter around
        them no longer blocks the icons behind it.
      */}
      <div className="pointer-events-none relative z-20 mx-auto max-w-7xl px-4">
        <div className="pointer-events-auto max-w-xl">
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

        {/* Mobile/tablet stage — the same track-riding bubbles as the desktop node layer
            above, just folded into a compact two-column grid (MOBILE_TRACKS) sized for a
            screen with no room to route a line around full-width copy. Sits in normal flow
            below the copy (this wrapper is `relative`, not `absolute`, so nothing here
            fights the desktop layer for space), and is its own self-contained box: the
            decorative SVG and the node layer both cover exactly this box, the same
            same-box-same-scale relationship the desktop layer has with the full section. */}
        <div
          ref={mobileStageRef}
          className="pointer-events-none relative mt-10 h-[420px] w-full lg:hidden"
        >
          <svg
            aria-hidden="true"
            viewBox={`0 0 ${MOBILE_VB_W} ${MOBILE_VB_H}`}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
          >
            <g fill="none" stroke="#0078FC" strokeWidth="2">
              {MOBILE_TRACKS.map((track) => (
                <path key={track.d} data-track-path-mobile d={track.d} />
              ))}
            </g>
          </svg>

          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {services.map((service, index) => {
              const track = MOBILE_TRACKS[index % MOBILE_TRACKS.length];
              return (
                <div
                  key={service.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(track.endX / MOBILE_VB_W) * 100}%`,
                    top: `${(track.endY / MOBILE_VB_H) * 100}%`,
                  }}
                >
                  <Link
                    to={service.path}
                    ref={(el) => {
                      mobileNodeRefs.current[index] = el;
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
        </div>

        {/*
          The real, accessible list of services.

          `sr-only` at every breakpoint, not just `lg:sr-only`: the nodes above (both the
          desktop layer and the mobile stage) are aria-hidden decoration with tabIndex={-1}
          so they neither double-announce nor add tab stops, so hiding this list outright
          would leave a screen-reader or keyboard user with no service links from this
          section at all, on any device.
        */}
        <ul className="sr-only">
          {services.map((service) => (
            <li key={service.id}>
              <Link to={service.path}>{service.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
