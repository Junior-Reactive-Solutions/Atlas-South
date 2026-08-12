import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HARD_SERVICES, SOFT_SERVICES } from '@atlas-south/shared';
import { Icon, prefersReducedMotion } from '@atlas-south/design-system';
import { useVisibleNavItems } from '../../hooks/useNavVisibility.js';

/**
 * Where each node sits inside the graphic, as percentages of the panel, plus how strongly
 * it reacts to scroll.
 *
 * Positions are hand-placed rather than generated: they need to sit *on* the curves below,
 * and an even distribution would read as a grid, which is the opposite of the effect. The
 * varied `drift` values are what create depth — nodes moving at identical rates read as
 * one flat layer sliding, which looks like a bug rather than parallax.
 *
 * All `left` values stay above 54%. The copy column is `max-w-xl` inside a `max-w-7xl`
 * container, so it occupies roughly the left 45%; anything further left than this drops
 * icons on top of the headline. Node centres are offset by `-translate-x-1/2`, so a node
 * at 58% with the largest size still clears the text.
 *
 * `drift` is pixels of travel across the full scroll of the section, and `lag` is how
 * strongly the node responds to scroll *velocity* — see the two-part motion note on the
 * component below. Signs are mixed on purpose so nodes cross past each other.
 *
 * Slots cap how many nodes the graphic shows; the accessible list below renders every
 * service regardless, so a service is never hidden by running out of slots.
 */
const NODE_SLOTS = [
  { top: 12, left: 60, drift: 150, lag: 1.5, size: 'md' },
  { top: 28, left: 84, drift: -110, lag: -1.0, size: 'sm' },
  { top: 42, left: 58, drift: 190, lag: 1.9, size: 'lg' },
  { top: 56, left: 88, drift: -140, lag: -1.3, size: 'md' },
  { top: 70, left: 64, drift: 120, lag: 1.1, size: 'sm' },
  { top: 84, left: 80, drift: -170, lag: -1.7, size: 'md' },
  { top: 20, left: 74, drift: 95, lag: 0.8, size: 'sm' },
  { top: 62, left: 74, drift: -85, lag: -0.7, size: 'sm' },
] as const;

/**
 * Below `lg` the scattered layout is replaced by a grid, and the same motion is applied
 * *per column* rather than per node.
 *
 * That distinction is the whole trick on small screens. Grid cells sit in normal flow, so
 * giving each cell its own offset would let vertically-adjacent cells slide into each
 * other. Driving whole columns instead means every cell in a column moves together — the
 * columns cross against each other exactly like the desktop nodes do, and two cells can
 * never collide because cells only ever share a column with cells moving identically.
 *
 * Indexed by column, and the grid is `grid-cols-2 sm:grid-cols-3`, so three entries covers
 * both layouts.
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

/**
 * "Every service, one point of contact" — the scroll-reactive network panel.
 *
 * Modelled on the inspiration site's (abm.co.uk) homepage panel, which floats circular
 * portrait bubbles along thin curved lines over a navy field and drifts them as you
 * scroll. Ours substitutes service icons for the portraits, which does the same job of
 * making the section feel alive while actually saying something about the offering — and
 * unlike ABM's, each node is a real link to that service.
 *
 * The motion has two parts, and they do different jobs:
 *
 * 1. **Position drift.** Each node's offset is a function of how far the panel has
 *    travelled through the viewport. Because it is a pure function of scroll *position*,
 *    it retraces itself exactly in reverse when you scroll back up — scrolling up doesn't
 *    just stop the motion, it runs it backwards.
 *
 * 2. **Velocity lag.** A second offset proportional to current scroll *speed*, which
 *    decays back to zero when you stop. This is what makes the panel feel reactive rather
 *    than merely animated: flick the wheel and the nodes visibly get pushed, and the push
 *    is the opposite way for an upward flick. Nodes with a negative `lag` are shoved
 *    against the scroll direction, so the group splits and crosses rather than sliding as
 *    one sheet.
 *
 * Because part 2 decays to nothing the moment scrolling stops, nodes always settle to a
 * stable resting place — which is what keeps them clickable. That mattered enough to
 * shape the design: a link that keeps drifting under a stationary cursor is a worse
 * outcome than no animation.
 *
 * Implementation notes:
 * - Transform only. No layout properties are touched, so this stays on the compositor.
 * - One rAF loop for the whole panel, not a listener per node, and it only runs while the
 *   panel is on screen. It also parks itself once everything has settled, so a stationary
 *   reader isn't burning a frame callback indefinitely.
 * - Velocity is clamped before it is used, so a trackpad fling or a "scroll to bottom"
 *   keypress can't launch the nodes off the panel.
 *
 * The same motion runs at every screen size, but drives a different layout below `lg`.
 * Scattered absolute positioning collapses into overlap at 375px, so small screens get a
 * grid instead — and the motion is applied per *column* there, so whole columns cross
 * against each other while cells within a column stay locked together and can never
 * collide. Both the velocity ceiling and the lag scale are lowered for that layout: touch
 * scrolling produces far larger per-frame deltas than a wheel, and grid columns sit closer
 * together than free-floating nodes, so there is less room to move into.
 *
 * Under prefers-reduced-motion no loop is started and everything renders at rest.
 */
export function ServiceNetwork() {
  const sectionRef = useRef<HTMLElement>(null);
  const nodeRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const cellRefs = useRef<Array<HTMLLIElement | null>>([]);

  // Hidden services must not be advertised here either — this reads through the same
  // visibility switches as the header, footer and card grids.
  const services = useVisibleNavItems([...HARD_SERVICES, ...SOFT_SERVICES]).slice(
    0,
    NODE_SLOTS.length,
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    /** Hard ceiling on velocity, in px/frame, before it is multiplied by a node's lag. */
    const MAX_VELOCITY = 55;
    /** How quickly the smoothed velocity chases the real one. Lower = more lag. */
    const VELOCITY_EASING = 0.12;
    /** Below this the panel is treated as settled and the loop parks. */
    const SETTLED = 0.05;

    /**
     * Ceiling on the velocity term alone, per layout.
     *
     * Touch scrolling reaches far higher per-frame deltas than a mouse wheel, and momentum
     * keeps them there for a while after the finger lifts. Without a cap on the *result*
     * (not just the input), a hard flick on a phone would fling a whole column well past
     * its neighbours. The mobile figure is deliberately much smaller than desktop's:
     * columns are in normal flow and sit close together, so there is far less room to move
     * into before it stops looking deliberate.
     */
    const MAX_VELOCITY_OFFSET = { desktop: 70, compact: 20 };

    /** Multiplier applied to `lag` before it meets the velocity, per layout. */
    const LAG_SCALE = { desktop: 3, compact: 1.1 };

    let frame = 0;
    let running = false;
    let lastScrollY = window.scrollY;
    let smoothedVelocity = 0;
    const curves = section.querySelectorAll<SVGElement>('[data-network-curves]');

    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    /** Mirrors the grid's own `grid-cols-2 sm:grid-cols-3`, so columns can't fall out of sync. */
    const threeColQuery = window.matchMedia('(min-width: 640px)');

    /** Clears both element sets so a layout switch can't strand a stale transform. */
    const resetTransforms = () => {
      nodeRefs.current.forEach((el) => el && (el.style.transform = ''));
      cellRefs.current.forEach((el) => el && (el.style.transform = ''));
    };

    const render = () => {
      const rect = section.getBoundingClientRect();

      // 0 when the panel's top edge first reaches the bottom of the viewport, 1 when its
      // bottom edge leaves the top. Centred on 0 so nodes sit at their resting position
      // when the panel is mid-screen, and travel symmetrically either side.
      const span = rect.height + window.innerHeight;
      const raw = (window.innerHeight - rect.top) / span;
      const centred = Math.min(1, Math.max(0, raw)) - 0.5;

      // Raw per-frame scroll delta, clamped so a fling can't throw nodes off the panel.
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      const clamped = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, delta));

      // Chase the real velocity rather than snapping to it. The gap between the two is
      // the lag that makes the nodes feel weighted instead of glued to the scrollbar.
      smoothedVelocity += (clamped - smoothedVelocity) * VELOCITY_EASING;

      const isDesktop = desktopQuery.matches;
      const mode = isDesktop ? 'desktop' : 'compact';
      const lagScale = LAG_SCALE[mode];
      const cap = MAX_VELOCITY_OFFSET[mode];

      /** Velocity contribution for a given lag, capped so a fling can't overshoot. */
      const velocityOffset = (lag: number) => {
        const raw = smoothedVelocity * lag * lagScale;
        return Math.max(-cap, Math.min(cap, raw));
      };

      if (isDesktop) {
        nodeRefs.current.forEach((node, index) => {
          if (!node) return;
          const slot = NODE_SLOTS[index % NODE_SLOTS.length];
          const offset = centred * slot.drift + velocityOffset(slot.lag);
          node.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        });
      } else {
        const columns = threeColQuery.matches ? 3 : 2;
        cellRefs.current.forEach((cell, index) => {
          if (!cell) return;
          const motion = COLUMN_MOTION[index % columns];
          const offset = centred * motion.drift + velocityOffset(motion.lag);
          cell.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        });
      }

      // The curve network shifts gently the other way, so the icons read as moving
      // through the lines rather than the whole picture sliding as one plane.
      curves.forEach((curve) => {
        curve.style.transform = `translate3d(0, ${(centred * -40).toFixed(2)}px, 0)`;
      });

      // Park once the velocity component has effectively died. Position drift alone needs
      // no frames — the next scroll event restarts the loop.
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

    // Crossing the lg boundary swaps which element set is driven. Without clearing first,
    // whichever set stopped being driven keeps the transform it happened to hold — leaving
    // a grid cell or a node permanently nudged off-position after a rotate or resize.
    const onLayoutChange = () => {
      resetTransforms();
      start();
    };

    desktopQuery.addEventListener('change', onLayoutChange);
    threeColQuery.addEventListener('change', onLayoutChange);

    // Only run while the panel is actually on screen.
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
      if (attached) window.removeEventListener('scroll', start);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [services.length]);

  if (services.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-label="Our services"
      // Taller at lg than the copy needs: the drift is proportional to how far the panel
      // travels through the viewport, so a short panel gives the nodes almost nothing to
      // move across. This is the room the effect needs to be visible at all.
      className="relative overflow-hidden bg-navy py-20 text-white sm:py-24 lg:min-h-[760px] lg:py-32"
    >
      {/*
        The connecting curves. Purely decorative, so aria-hidden and stroked in brand-blue
        — the raw logo blue is barred from text by the brand system for failing AA, but
        graphic strokes are exactly what it is reserved for (01-BRAND-SYSTEM.md §2).

        Two variants rather than one responsive SVG. A landscape 1200x700 network squeezed
        into a tall narrow phone panel would either distort the curves into near-vertical
        streaks (preserveAspectRatio="none") or crop away most of the interesting part
        ("slice"). The portrait variant is drawn for that shape instead.

        -inset-y-24 gives the curves room to counter-move without revealing a hard edge at
        the top or bottom of the panel as they shift.
      */}
      <svg
        aria-hidden="true"
        data-network-curves
        viewBox="0 0 1200 700"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -inset-y-24 left-0 hidden h-[calc(100%+12rem)] w-full opacity-40 lg:block"
      >
        <g fill="none" stroke="#0078FC" strokeWidth="2">
          <path d="M-40,150 C220,150 340,470 620,470 C860,470 980,210 1260,210" />
          <path d="M-40,470 C200,470 300,110 560,110 C820,110 900,360 1260,360" />
          <path d="M-40,300 C260,300 420,620 720,620 C960,620 1060,300 1260,300" />
          <path d="M180,-40 C180,180 420,240 420,520 C420,660 300,700 300,760" />
          <path d="M940,-40 C940,200 760,280 760,540 C760,680 880,720 880,760" />
        </g>
      </svg>

      {/* Portrait variant for phone and tablet — curves run mostly top-to-bottom, matching
          the direction the columns travel. */}
      <svg
        aria-hidden="true"
        data-network-curves
        viewBox="0 0 400 900"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -inset-y-24 left-0 h-[calc(100%+12rem)] w-full opacity-25 lg:hidden"
      >
        <g fill="none" stroke="#0078FC" strokeWidth="2">
          <path d="M60,-40 C60,180 300,260 300,520 C300,760 120,820 120,980" />
          <path d="M340,-40 C340,200 90,300 90,540 C90,780 280,840 280,980" />
          <path d="M-20,220 C120,220 180,420 320,420 C400,420 420,340 460,340" />
          <path d="M-20,660 C140,660 200,480 340,480" />
        </g>
      </svg>

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

        {/* Desktop: nodes scattered across the curves. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
          {services.map((service, index) => {
            const slot = NODE_SLOTS[index % NODE_SLOTS.length];
            return (
              <Link
                key={service.id}
                to={service.path}
                ref={(el) => {
                  nodeRefs.current[index] = el;
                }}
                title={service.label}
                tabIndex={-1}
                style={{ top: `${slot.top}%`, left: `${slot.left}%` }}
                className={`pointer-events-auto absolute flex ${SIZE_CLASS[slot.size]} -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-navy-deep/90 shadow-lg backdrop-blur-sm transition-colors hover:border-brand-blue hover:bg-accent-blue`}
              >
                <Icon name={service.icon} size={ICON_SIZE[slot.size]} className="text-white" />
              </Link>
            );
          })}
        </div>

        {/*
          The real, accessible list of services.

          Visible as a grid below lg; `lg:sr-only` on larger screens rather than
          `lg:hidden`, which matters: the scattered nodes above are aria-hidden decoration
          with tabIndex={-1} (so they neither double-announce nor add tab stops), so if
          this list were display:none on desktop, a screen-reader or keyboard user would
          get no service links from this section at all. sr-only keeps it in the
          accessibility tree and the tab order while taking no visual space.
        */}
        {/* gap-y is generous because whole columns travel vertically against each other;
            a tight row gap would let a rising column's cells sit level with a falling
            column's and read as a broken grid rather than as depth. */}
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
