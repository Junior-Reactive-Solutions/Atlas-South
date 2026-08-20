import { useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY } from '@atlas-south/shared';

/** True only for devices with a real hover-capable, precise pointer (mouse/trackpad) —
 * false for touch, including tablets. Computed once as a lazy useState initializer so it's
 * correct on the very first render (no flash-then-flip after mount). */
function computeCanHover(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * Symbol-only mark that expands to reveal the wordmark on hover/focus — but only on
 * devices where "hover" is a real, distinct interaction from "tap".
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
 *   - Everything else (touch — phones, tablets): there's no hover to animate into, so the
 *     wordmark is just always shown, in normal flow next to the symbol. No animation,
 *     because there's nothing to animate in response to.
 *
 * The `matchMedia` listener keeps this correct if a device's pointer situation changes at
 * runtime (a 2-in-1 laptop switching between keyboard+mouse and tablet mode, an external
 * mouse being connected to a tablet) — not just a snapshot taken once on mount.
 */
export function AnimatedLogo() {
  const [canHover] = useState(computeCanHover);
  const [revealed, setRevealed] = useState(false);

  const symbol = <img src="/brand/symbol.svg" alt="" aria-hidden="true" className="h-9 w-auto shrink-0" />;
  const wordmark = <img src="/brand/wordmark.svg" alt="" aria-hidden="true" className="h-5 w-auto" />;

  if (!canHover) {
    // Touch devices: no hover concept, so show the full mark permanently rather than
    // gating brand recognition behind an interaction the device can't perform.
    return (
      <Link to="/" aria-label={`${COMPANY.name} — home`} className="flex h-9 items-center gap-2">
        {symbol}
        {wordmark}
      </Link>
    );
  }

  return (
    <Link
      to="/"
      aria-label={`${COMPANY.name} — home`}
      className="relative flex h-9 items-center"
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      onFocus={() => setRevealed(true)}
      onBlur={() => setRevealed(false)}
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
