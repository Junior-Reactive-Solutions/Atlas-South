import { useEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion } from '../tokens/motion.js';

/**
 * Tracks pointer position within an element and exposes it as `--spot-x`/`--spot-y` CSS
 * custom properties, for the `.spotlight-card` class (apps/web/src/index.css) to paint a
 * soft glow that follows the cursor. Pairs with `useMagneticHover` as the same "sitewide
 * micro-interaction" proposal — one hook, applied to every card grid that wants it
 * (ServiceNetwork panel, Packages pricing cards) rather than a per-page reimplementation,
 * so the effect is identical everywhere it appears.
 *
 * No-ops under prefers-reduced-motion — the CSS class itself also hides the glow in that
 * case (`.spotlight-card` in index.css), this just avoids the pointless listener too.
 */
export function useSpotlight<T extends HTMLElement>(): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      el!.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
      el!.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
    }

    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  return ref;
}
