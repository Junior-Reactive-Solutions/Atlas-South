import { useEffect } from 'react';

/**
 * Marks the current page noindex,nofollow — for the /admin/* subtree per
 * docs/build/08-ADMIN-PANEL-SPEC.md §1. robots.txt already blocks crawling of /admin
 * entirely; this is the belt-and-braces per-page tag for any crawler that ignores it or
 * for a page that gets linked to directly from somewhere robots.txt doesn't cover.
 */
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);
}
