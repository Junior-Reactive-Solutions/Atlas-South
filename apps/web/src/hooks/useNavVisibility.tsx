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
 * Until the visibility fetch settles this returns the list unchanged, so navigation
 * renders immediately rather than popping in. The window is a few hundred milliseconds
 * and the worst case is a link that 404s.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useVisibleNavItems<T extends NavItem>(items: T[]): T[] {
  const { hidden, isLoaded } = useNavVisibility();

  return useMemo(() => {
    if (!isLoaded || hidden.size === 0) return items;
    return items.filter((item) => !hidden.has(item.id));
  }, [items, hidden, isLoaded]);
}

/** True when this specific nav id has been hidden by an admin. */
// eslint-disable-next-line react-refresh/only-export-components
export function useIsNavItemHidden(navId: string): boolean {
  const { hidden } = useNavVisibility();
  return hidden.has(navId);
}
