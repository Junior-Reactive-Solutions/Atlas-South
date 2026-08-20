import { Link } from 'react-router-dom';
import { COMPANY } from '@atlas-south/shared';

/**
 * Symbol-only mark that expands to reveal the wordmark on hover/focus.
 *
 * The "AS" symbol (apps/web/public/brand/symbol.svg) is the permanent, always-visible
 * mark — it's what sits in the header at rest. Hovering (or focusing, so keyboard users
 * get the same reveal) slides the wordmark (public/brand/wordmark.svg) in beside it.
 *
 * A plain CSS max-width/opacity transition rather than the anime.js scope other header
 * interactions (NavDropdown, the mobile drawer) use: this is a single two-property
 * hover transition with no stagger and no imperative open/close state to coordinate —
 * exactly what `group-hover:` is for, and it gets prefers-reduced-motion handling for
 * free from the global transition-duration override in index.css instead of needing its
 * own branch.
 *
 * The wordmark is capped at h-7 (28px) rather than matching the symbol's h-9 (36px):
 * the wordmark's intrinsic aspect ratio (900:86 ≈ 10.5:1) means a 36px-tall render would
 * need ~377px of reveal width, which risks overlapping the nav links on narrower desktop
 * viewports. At 28px it needs ~293px — sized to clear that plus a little breathing room.
 */
export function AnimatedLogo() {
  return (
    <Link
      to="/"
      aria-label={`${COMPANY.name} — home`}
      className="group flex h-9 items-center"
    >
      <img src="/brand/symbol.svg" alt="" aria-hidden="true" className="h-9 w-auto shrink-0" />
      <span
        className="ml-0 max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity,margin-left] duration-300 ease-out group-hover:ml-2 group-hover:max-w-[300px] group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-[300px] group-focus-visible:opacity-100"
      >
        <img src="/brand/wordmark.svg" alt="" aria-hidden="true" className="h-7 w-auto" />
      </span>
    </Link>
  );
}
