import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { prefersReducedMotion } from '@atlas-south/design-system';

/** How long to keep looking for the target before giving up. */
const TIMEOUT_MS = 3000;
/** Gap between attempts. Short enough to feel immediate, long enough not to busy-loop. */
const RETRY_MS = 50;

/**
 * Scrolls to `location.hash`'s element once it exists.
 *
 * The browser's own hash handling is useless in this app and silently did nothing: it tries
 * to scroll at navigation time, but every page here renders its body *after* an async step
 * (a lazy route chunk, then content from useContentPage), so at that moment the target
 * element does not exist yet. Observed concretely with /company#mission — the anchor was
 * present in the DOM a moment later, yet the page sat at scrollY 0, so the header/footer
 * "Mission" link appeared to do nothing.
 *
 * Retries until the element appears rather than waiting one guessed delay, because how long
 * that takes depends on chunk download and content fetch time — a fixed timeout would be
 * either too short on a slow connection or a visible pause on a fast one. Gives up after
 * TIMEOUT_MS so a genuinely bad hash can't retry forever.
 *
 * Uses setTimeout rather than requestAnimationFrame deliberately: rAF callbacks are paused
 * entirely while a tab is hidden, so a hash link opened in a background tab would never
 * resolve its target. setTimeout is merely throttled, so it still fires.
 */
export function useHashScroll(): void {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));
    let timer = 0;
    const deadline = Date.now() + TIMEOUT_MS;

    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        });
        return;
      }
      if (Date.now() < deadline) timer = window.setTimeout(tryScroll, RETRY_MS);
    };

    tryScroll();
    return () => window.clearTimeout(timer);
    // pathname is a dependency so navigating from /company#mission to another page and back
    // re-runs this; hash alone wouldn't change in that case.
  }, [pathname, hash]);
}
