import { useEffect, useRef, type RefObject } from 'react';
import { animate, stagger } from 'animejs';
import { DURATION, EASE, STAGGER_GAP, prefersReducedMotion } from '../tokens/motion.js';

interface ScrollRevealOptions {
  /** Distance in px the elements rise from. */
  distance?: number;
  /** Gap between staggered children, ms. */
  stagger?: number;
  duration?: number;
  /**
   * How far into the viewport the container's leading edge must come before revealing,
   * as a percentage of viewport height.
   *
   * Expressed as a rootMargin rather than an IntersectionObserver `threshold`, because a
   * threshold is a fraction of *the observed element* — and these containers are far
   * taller than the viewport. A six-panel section measures ~4000px against a ~550px
   * viewport, so it can never be more than ~14% visible and a 15% threshold would simply
   * never fire. That is exactly the bug this replaced.
   */
  revealAtPercent?: number;
}

/**
 * Reveals `selector` children with a fade + rise the first time the container scrolls
 * into view — docs/build/02-ANIMATION-SYSTEM.md "scroll-reveal entrance".
 *
 * This replaces the previous `useAnimationScope(self => self?.add('reveal', ...))`
 * pattern, which never actually animated anything. In anime.js v4, `scope.add(name, fn)`
 * *registers a callable method* on the scope rather than running it; nothing in the app
 * ever called `.reveal()`, so every one of those blocks was dead code and the site
 * rendered entirely static. This hook runs the animation for real.
 *
 * Degradation is deliberate and safe:
 * - Under prefers-reduced-motion nothing is hidden and nothing animates; content is
 *   simply there. The reduced-motion path is the no-op path, not a different animation.
 * - If JavaScript never runs, no inline opacity is ever set, so content is visible. The
 *   hidden state is applied by this hook, which means it can only be applied when
 *   something exists to undo it — content can't get stranded invisible.
 * - Each container reveals once, then stops observing.
 */
export function useScrollReveal(
  selector: string,
  { distance = 24, stagger: gap = STAGGER_GAP, duration = DURATION.slow, revealAtPercent = 12 }:
    ScrollRevealOptions = {},
): RefObject<HTMLDivElement> {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container) return;

    // Reduced motion: leave everything visible and untouched.
    if (prefersReducedMotion()) return;

    const targets = Array.from(container.querySelectorAll<HTMLElement>(selector));
    if (targets.length === 0) return;

    // Apply the pre-reveal state only now that we know we can animate out of it.
    targets.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = `translateY(${distance}px)`;
    });

    let done = false;

    const reveal = () => {
      if (done) return;
      done = true;

      animate(targets, {
        opacity: [0, 1],
        translateY: [distance, 0],
        delay: stagger(gap),
        duration,
        ease: EASE.standard,
        onComplete: () => {
          // Hand styling back to CSS so nothing is left pinned by inline styles —
          // otherwise a later hover transform on a card would fight this one.
          targets.forEach((el) => {
            el.style.opacity = '';
            el.style.transform = '';
          });
        },
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      // threshold 0 = fire as soon as any part crosses the (shrunken) root box.
      { threshold: 0, rootMargin: `0px 0px -${revealAtPercent}% 0px` },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      // If we unmount before revealing, clear the hidden state so a remount (or a
      // route change reusing the node) never leaves content stuck at opacity 0.
      if (!done) {
        targets.forEach((el) => {
          el.style.opacity = '';
          el.style.transform = '';
        });
      }
    };
  }, [selector, distance, gap, duration, revealAtPercent]);

  return root;
}
