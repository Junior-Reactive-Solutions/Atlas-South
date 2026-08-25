import { useState } from 'react';

interface HoverImageProps {
  src: string;
  /** A second photograph shown on hover/focus. Without one, this just renders `src`. */
  altSrc?: string | null;
  className?: string;
}

/**
 * Crossfades to a second photograph on hover — pairs with `imageAlt` on GridCard
 * (CardGrid.tsx) and content/imagery.ts's heroImageAltFor(). Pure CSS (opacity
 * transition on a Tailwind `group`), not JS-driven state — the parent card element
 * already carries the `group` class for its own hover effects (border/shadow), so this
 * rides the same hover trigger rather than adding a second one.
 *
 * Applied to card grids specifically, not full-bleed page hero backgrounds — a card has
 * a clear boundary and hover affordance (it's already a link), whereas swapping a page's
 * entire background image on an untargeted mouse-move would read as an accidental glitch
 * rather than a deliberate interaction.
 *
 * The alt image only starts downloading on the first hover/focus, not on mount — every
 * card grid on the site (industries, services, areas, sibling cross-links) was previously
 * shipping two full photographs per card the moment it scrolled into view, and the
 * second one is dead weight for the large majority of visitors who never hover a given
 * card. Deferring it to the actual interaction that reveals it roughly halves the image
 * bytes a grid-heavy page like Home or an industry page pulls over the wire, which matters
 * most on exactly the slow/mobile connections this was meant to be optimised for. The
 * crossfade still reads as instant on a warm cache or fast connection; on a slow one the
 * base photo is what's on screen anyway until the swap completes.
 */
export function HoverImage({ src, altSrc, className }: HoverImageProps) {
  const [altRequested, setAltRequested] = useState(false);

  if (!altSrc) {
    return <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" className={className} />;
  }

  // Both images are absolutely positioned to stack within the caller's `relative`
  // container — including the base image, which otherwise renders in normal flow and
  // would push the alt image (or get pushed by it) instead of overlaying it.
  return (
    <div className="contents" onMouseEnter={() => setAltRequested(true)}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`${className ?? ''} absolute inset-0 transition-opacity duration-500 group-hover:opacity-0`}
      />
      {/* Not rendered until the first hover/focus — see the note above. Once mounted it
          stays mounted (no unmount-on-mouseleave), so repeat hovers reuse the cached
          image rather than re-fetching it. */}
      {altRequested && (
        <img
          src={altSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className={`${className ?? ''} absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        />
      )}
    </div>
  );
}
