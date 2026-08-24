import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY } from '@atlas-south/shared';
import { prefersReducedMotion } from '@atlas-south/design-system';

/** True only for devices with a real hover-capable, precise pointer (mouse/trackpad) —
 * false for touch, including tablets. Computed once as a lazy useState initializer so it's
 * correct on the very first render (no flash-then-flip after mount). */
function computeCanHover(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Delay before the reveal auto-plays on a touch device, in ms. Long enough that it reads
 * as a deliberate brand moment once the header has settled, short enough that a visitor
 * scanning the page on load still sees it happen rather than missing it entirely. */
const TOUCH_AUTOPLAY_DELAY_MS = 700;

/**
 * Symbol-only mark that expands to reveal the wordmark — on hover/focus for devices where
 * that's a real, distinct interaction from tapping, and auto-played once on load for
 * devices where it isn't.
 *
 * This replaced a pure-CSS `group-hover`/`group-focus-visible` version that never fully
 * animated on touch devices: tapping a `<Link>` doesn't produce a real `:hover` state (it
 * either never applies, or "sticks" inconsistently across mobile browsers until the next
 * tap elsewhere) and doesn't produce `:focus-visible` either (that's keyboard-only in
 * every current browser). The reveal was therefore either invisible or stuck, on every
 * touch device — mobile and tablet alike, matching what testing surfaced.
 *
 * Fix: detect real hover capability with `matchMedia('(hover: hover) and (pointer: fine)')`
 * and branch on it explicitly:
 *   - Hover-capable (desktop/laptop mouse or trackpad): the wordmark starts hidden and
 *     reveals on mouseenter/focus, driven by React state rather than CSS pseudo-classes —
 *     more predictable than `:hover` cascading through an absolutely-positioned,
 *     pointer-events-none descendant, and it's what let this bug hide in the first place.
 *   - Touch (phones, tablets): there's no hover gesture to reveal *into*, so instead of
 *     gating the brand moment behind an interaction the device can't perform, the same
 *     reveal auto-plays once, a beat after mount, and then stays revealed — every visitor
 *     gets the animation, not just the ones with a mouse.
 *
 * The `matchMedia` listener keeps `canHover` correct if a device's pointer situation
 * changes at runtime (a 2-in-1 laptop switching between keyboard+mouse and tablet mode, an
 * external mouse being connected to a tablet) — not just a snapshot taken once on mount.
 */
export function AnimatedLogo() {
  const [canHover, setCanHover] = useState(computeCanHover);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onChange = () => setCanHover(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Touch devices auto-play the reveal once, since there's no hover to trigger it. Skipped
  // (revealed immediately, no animation) under prefers-reduced-motion — same "renders
  // parked" rule the rest of the site's scroll/hover animations follow.
  useEffect(() => {
    if (canHover) return;
    if (prefersReducedMotion()) {
      setRevealed(true);
      return;
    }
    const timer = window.setTimeout(() => setRevealed(true), TOUCH_AUTOPLAY_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [canHover]);

  const symbol = <img src="/brand/symbol.svg" alt="" aria-hidden="true" className="h-9 w-auto shrink-0" />;
  // max-w-none: the global `img { max-width: 100% }` reset (needed everywhere else on the
  // site for responsive images) resolves that 100% against this element's containing
  // block — but the reveal `<span>` below is `position: absolute` with no explicit width
  // of its own, sized via shrink-to-fit *from this very image*. That's a circular
  // percentage the browser can't resolve, and it computes to 0 rather than falling back to
  // "no cap": the wordmark was loading correctly (confirmed via naturalWidth) and the
  // reveal's opacity/transform state was toggling correctly, but the image itself rendered
  // at 0px wide — invisible despite every other part of the animation firing correctly.
  const wordmark = <img src="/brand/wordmark.svg" alt="" aria-hidden="true" className="h-5 w-auto max-w-none" />;

  // Same markup for both paths — only the interaction that flips `revealed` differs (mouse/
  // focus handlers below vs. the auto-play effect above) — so the two can't drift into two
  // different-looking reveals by accident.
  const hoverHandlers = canHover
    ? {
        onMouseEnter: () => setRevealed(true),
        onMouseLeave: () => setRevealed(false),
        onFocus: () => setRevealed(true),
        onBlur: () => setRevealed(false),
      }
    : {};

  return (
    <Link
      to="/"
      aria-label={`${COMPANY.name} — home`}
      className="relative flex h-9 items-center"
      {...hoverHandlers}
    >
      {symbol}
      {/* pointer-events-none: the reveal is a decorative label, not a separate hit
          target. Without it, moving the mouse off the (small) symbol and onto the
          (wider) revealed text would fire onMouseLeave the instant the cursor left the
          symbol's own box, flickering the reveal shut right as it's being read. Any
          click anywhere in this area still lands on the Link underneath. */}
      <span
        className={`pointer-events-none absolute left-full top-1/2 z-40 -translate-y-1/2 whitespace-nowrap rounded bg-canvas/95 py-1 pr-2 backdrop-blur transition-[transform,opacity] duration-300 ease-out ${
          revealed ? 'translate-x-3 opacity-100' : 'translate-x-1 opacity-0'
        }`}
      >
        {wordmark}
      </span>
    </Link>
  );
}
