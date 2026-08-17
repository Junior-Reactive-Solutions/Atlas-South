import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { NavItem } from '@atlas-south/shared';

interface NavVisibilityValue {
  /** Nav item ids the admin has hidden from the public site. */
  hidden: ReadonlySet<string>;
  /** False until the first fetch settles — used to avoid a flash of hidden links. */
  isLoaded: boolean;
}

const NavVisibilityContext = createContext<NavVisibilityValue>({
  hidden: new Set(),
  isLoaded: false,
});

/**
 * Fetches hidden nav ids once per page load and shares them across the whole tree.
 *
 * A context rather than a hook-per-component on purpose: the header, footer, homepage
 * grids and every detail page's related-services grid all need the same answer, and
 * without sharing they would each issue their own request on every navigation.
 *
 * This is a *rendering* concern only. The API refuses to serve a hidden page's content
 * regardless of what this returns, so a stale or failed fetch here can leave a dead link
 * but cannot expose hidden content.
 */
export function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/nav/visibility')
      .then((response) => {
        if (!response.ok) throw new Error('visibility fetch failed');
        return response.json() as Promise<{ hidden: string[] }>;
      })
      .then((json) => {
        if (!cancelled) setHidden(new Set(json.hidden ?? []));
      })
      .catch(() => {
        // Fail open: show the full navigation. Blanking the nav because one request
        // failed would be a worse outcome than briefly linking a hidden page, and the
        // page itself still 404s.
        if (!cancelled) setHidden(new Set());
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ hidden, isLoaded }), [hidden, isLoaded]);

  return <NavVisibilityContext.Provider value={value}>{children}</NavVisibilityContext.Provider>;
}

// Provider and hooks live together here, matching the pattern in contexts/AuthContext.tsx.
// eslint-disable-next-line react-refresh/only-export-components
export function useNavVisibility(): NavVisibilityValue {
  return useContext(NavVisibilityContext);
}

/**
 * Filters a nav list down to what the public should currently see.
 *
 * Two independent filters, applied together:
 * 1. `placeholder` items ("Coming Soon" — real content isn't written yet) are always
 *    excluded. Unlike the admin-hidden filter below, this doesn't wait on `isLoaded` or
 *    depend on the visibility API responding at all — it's a static property of the nav
 *    data itself, not something an admin toggles. That matters concretely: on a
 *    frontend-only deployment with no backend reachable yet, the admin-hidden fetch fails
 *    and fails open (see NavVisibilityProvider), but placeholder pages still correctly
 *    disappear regardless, because this check never depended on that fetch succeeding.
 * 2. Admin-hidden items (via the visibility API) are excluded once that fetch settles;
 *    until then the list renders without this second filter applied, so navigation
 *    doesn't pop in — the window is a few hundred milliseconds and the worst case is a
 *    link to an admin-hidden (not placeholder) page that briefly 404s.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useVisibleNavItems<T extends NavItem>(items: T[]): T[] {
  const { hidden, isLoaded } = useNavVisibility();

  return useMemo(() => {
    const withoutPlaceholders = items.filter((item) => !item.placeholder);
    if (!isLoaded || hidden.size === 0) return withoutPlaceholders;
    return withoutPlaceholders.filter((item) => !hidden.has(item.id));
  }, [items, hidden, isLoaded]);
}

/** True when this specific nav id has been hidden by an admin. */
// eslint-disable-next-line react-refresh/only-export-components
export function useIsNavItemHidden(navId: string): boolean {
  const { hidden } = useNavVisibility();
  return hidden.has(navId);
}
