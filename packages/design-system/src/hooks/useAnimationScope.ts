import { useEffect, useRef, type RefObject } from 'react';
import { createScope, type Scope } from 'animejs';

/**
 * Wraps anime.js v4's createScope/cleanup pattern so every animated component uses the
 * exact same setup rather than reimplementing it (and risking a skipped cleanup, which
 * leaks animation listeners on route change in the SPA). See
 * docs/build/02-ANIMATION-SYSTEM.md §1 and §5 — this hook IS that shared implementation.
 *
 * Usage:
 *   const root = useAnimationScope((self) => {
 *     animate('.card', { opacity: [0, 1], translateY: [24, 0], duration: DURATION.slow });
 *   });
 *   return <div ref={root}>...</div>;
 */
export function useAnimationScope(
  setup: (self: Scope | undefined) => void,
  deps: React.DependencyList = [],
): RefObject<HTMLDivElement> {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<Scope | null>(null);

  useEffect(() => {
    scope.current = createScope({ root }).add(setup);
    return () => scope.current?.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return root;
}
