import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Scrolls to the top of the page on navigation.
 *
 * A browser resets scroll position on a full page load, but a single-page app never
 * reloads — React Router swaps the component tree and the window keeps whatever scroll
 * offset the previous page left behind. So following a footer link from halfway down a
 * long page landed the visitor halfway down the next one, usually past its heading and
 * sometimes (on a short page) at the very bottom, looking like a blank or broken page.
 *
 * Three behaviours, in the order they're checked:
 *
 * 1. POP (browser Back/Forward) is left alone. The browser has its own remembered scroll
 *    position for those entries and restoring it is what a visitor expects — jumping them
 *    to the top on Back would lose their place in a list they'd scrolled through.
 * 2. A `#hash` link is left alone, so in-page anchors still reach their target. The
 *    element may not exist yet on a route that just mounted, so this scrolls to it once
 *    found rather than assuming it's there.
 * 3. Everything else (PUSH/REPLACE — a normal link click) goes to the top.
 *
 * Keyed on `pathname` only, deliberately not `search`: a filter or pagination change that
 * only rewrites the query string shouldn't yank the page back to the top mid-interaction.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') return;

    if (hash) {
      // The target element belongs to the route that is mounting right now, so it may not
      // be in the DOM on this tick. One frame is enough for the committed render.
      const raf = requestAnimationFrame(() => {
        const target = document.querySelector(hash);
        if (target) target.scrollIntoView();
      });
      return () => cancelAnimationFrame(raf);
    }

    // `instant`, not `smooth`: this is a page change, not an in-page movement, and
    // animating it means the visitor watches the old page's content race past. It also
    // respects users with reduced-motion preferences without needing to check for them.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash, navigationType]);

  return null;
}
