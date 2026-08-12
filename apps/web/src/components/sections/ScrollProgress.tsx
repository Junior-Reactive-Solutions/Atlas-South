import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@atlas-south/design-system';

/**
 * Thin reading-progress bar pinned under the header.
 *
 * The detail pages are long now that content is presented as full panels rather than a
 * prose column, and a progress indicator is the cheapest honest way to signal "there is a
 * finite amount of this left" — which is what keeps someone scrolling instead of bailing
 * at the second fold. It's an editorial convention (long-form news, documentation), not a
 * decorative flourish.
 *
 * Deliberately restrained: 2px, brand accent, no percentage readout, no animation on the
 * fill itself. It reads as chrome rather than as a widget demanding attention.
 *
 * Hidden entirely under prefers-reduced-motion — a bar that tracks scroll is motion tied
 * to input, and someone who has asked for less of that should not get a moving element
 * fixed to their viewport.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    setEnabled(true);

    // rAF-throttled: scroll fires far more often than the screen repaints, and updating
    // React state per event is what makes progress bars feel janky on long pages.
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(1, Math.max(0, window.scrollY / scrollable)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    >
      <div
        className="h-full bg-accent-blue"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
