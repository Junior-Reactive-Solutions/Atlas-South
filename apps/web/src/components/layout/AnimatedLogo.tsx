import { Link } from 'react-router-dom';
import { COMPANY } from '@atlas-south/shared';

/**
 * Symbol-only mark that expands to reveal the wordmark on hover/focus.
 *
 * The "AS" symbol (public/brand/symbol.svg) is the permanent, always-visible mark — it's
 * what sits in the header at rest. Hovering (or focusing, so keyboard users get the same
 * reveal) slides the wordmark (public/brand/wordmark.svg) in beside it.
 *
 * Two things this revision fixes over the first pass:
 *
 * 1. Proportions. The wordmark was rendered at h-7 (28px), and its intrinsic aspect ratio
 *    (900:86 ≈ 10.5:1) means 28px-tall text needs ~293px of width — nearly as wide as the
 *    whole header logo area, badly out of scale next to a 36px symbol. h-5 (20px) needs
 *    ~209px, reading as a companion wordmark rather than a second headline.
 *
 * 2. Layout impact. The reveal used to be a normal-flow inline child, so expanding it
 *    physically pushed the nav dropdowns and CTAs to the right — exactly the "other nav
 *    elements shouldn't be affected by the transition" problem. It's `absolute` now:
 *    the wordmark overlays on top of whatever's to its right instead of displacing it,
 *    so nothing else in the header ever moves. The `bg-canvas/95 backdrop-blur` pill
 *    behind the text keeps it legible on the rare case it overlaps a nav item at narrow
 *    desktop widths, and z-40 keeps it above the header's own dropdown panels (z-20).
 */
export function AnimatedLogo() {
  return (
    <Link
      to="/"
      aria-label={`${COMPANY.name} — home`}
      className="group relative flex h-9 items-center"
    >
      <img src="/brand/symbol.svg" alt="" aria-hidden="true" className="h-9 w-auto shrink-0" />
      {/* pointer-events-none: the reveal is a decorative label, not a separate hit
          target. Without it, moving the mouse off the (small) symbol and onto the
          (wider) revealed text would drop :hover on the Link the instant the cursor
          left the symbol's own box, flickering the reveal shut right as it's being
          read. Any click anywhere in this area still lands on the Link underneath. */}
      <span
        className="pointer-events-none absolute left-full top-1/2 z-40 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded bg-canvas/95 py-1 pr-2 opacity-0 backdrop-blur transition-[transform,opacity] duration-300 ease-out group-hover:translate-x-3 group-hover:opacity-100 group-focus-visible:translate-x-3 group-focus-visible:opacity-100"
      >
        <img src="/brand/wordmark.svg" alt="" aria-hidden="true" className="h-5 w-auto" />
      </span>
    </Link>
  );
}
