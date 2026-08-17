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
 * Both images render whenever an alternate exists (not lazily swapped on hover), so the
 * transition is instant rather than waiting on a network fetch the first time a visitor
 * hovers.
 */
export function HoverImage({ src, altSrc, className }: HoverImageProps) {
  if (!altSrc) {
    return <img src={src} alt="" aria-hidden="true" loading="lazy" className={className} />;
  }

  // Both images are absolutely positioned to stack within the caller's `relative`
  // container — including the base image, which otherwise renders in normal flow and
  // would push the alt image (or get pushed by it) instead of overlaying it.
  return (
    <>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className={`${className ?? ''} absolute inset-0 transition-opacity duration-500 group-hover:opacity-0`}
      />
      <img
        src={altSrc}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className={`${className ?? ''} absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />
    </>
  );
}
