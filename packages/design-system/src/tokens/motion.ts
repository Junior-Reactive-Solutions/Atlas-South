/**
 * Shared motion tokens — the single reference every animated component imports from.
 * This is what makes "the same standard of animation for each element, no matter how
 * far from the homepage" an enforceable fact rather than a design intention.
 * See docs/build/02-ANIMATION-SYSTEM.md §2 for the full rationale.
 */

export const DURATION = {
  instant: 120, // micro-interactions: icon colour flip, checkbox toggle
  fast: 220, // button/link hover, nav underline
  base: 320, // card hover-lift, dropdown open/close
  slow: 480, // scroll-reveal entrance, page-section fade-in
  hero: 700, // hero entrance sequence only
} as const;

export const EASE = {
  standard: 'out(3)', // default for entrances and hovers
  emphasis: 'inOut(3)', // state changes (open/close, expand/collapse)
  spring: { bounce: 0.35 }, // CTA button press feedback only — used sparingly
} as const;

export const STAGGER_GAP = 60; // ms between staggered children (cards, nav items, footer columns)

/** Respect prefers-reduced-motion once, everywhere — WCAG 2.1 2.3.3. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Returns a duration collapsed to near-zero if the user has requested reduced motion. */
export function motionDuration(duration: number): number {
  return prefersReducedMotion() ? 1 : duration;
}
