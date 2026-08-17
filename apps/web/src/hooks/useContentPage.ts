import { useEffect, useState } from 'react';
import { STATIC_PAGE_CONTENT } from '@atlas-south/shared';

interface ContentPageResponse<T> {
  slug: string;
  type: 'service' | 'industry' | 'area' | 'home';
  path: string;
  publishedData: T;
  publishedAt: string;
}

interface UseContentPageResult<T> {
  data: T | null;
  isLoading: boolean;
  error: boolean;
}

/**
 * A page's content: the bundled copy immediately, replaced by the Content API's version
 * once that resolves.
 *
 * The bundled copy (STATIC_PAGE_CONTENT in @atlas-south/shared) is the same record the
 * seed script writes to the database, so the two cannot disagree at rest. It exists here
 * because this hook previously returned `data: null, isLoading: true` until the fetch
 * settled, and every consumer renders `<PageLoadingFallback />` in that state — meaning
 * all 21 service/industry/area pages plus About, Careers and Packages rendered nothing but
 * a spinner whenever `/api/content/<slug>` was slow, and rendered a spinner *forever* when
 * it failed. That is the exact state of the current Vercel deployment, which has no backend
 * behind it yet: the content was in the repo the whole time and the pages still looked empty.
 *
 * The API remains authoritative whenever it answers, so an admin's edit still wins — this
 * only changes what a visitor sees while the request is in flight or failing. `isLoading`
 * is therefore false from the first render for any known slug: there is genuinely nothing
 * to wait for. It stays true only for a slug with no bundled fallback, where a spinner is
 * still the honest answer.
 */
export function useContentPage<T>(slug: string): UseContentPageResult<T> {
  const fallback = (STATIC_PAGE_CONTENT[slug] as T | undefined) ?? null;

  const [data, setData] = useState<T | null>(fallback);
  const [isLoading, setIsLoading] = useState(fallback === null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const nextFallback = (STATIC_PAGE_CONTENT[slug] as T | undefined) ?? null;

    // Re-seed from the fallback on a slug change so a previous page's content can never be
    // shown under a new page's route while its request is in flight.
    setData(nextFallback);
    setIsLoading(nextFallback === null);
    setError(false);

    fetch(`/api/content/${slug}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch content for "${slug}"`);
        return response.json() as Promise<ContentPageResponse<T>>;
      })
      .then((json) => {
        if (!cancelled && json.publishedData) setData(json.publishedData);
      })
      .catch(() => {
        // Only surface an error when there's no bundled content to fall back on. With a
        // fallback present the page is fully rendered and a visitor has nothing to act on,
        // so reporting an error would only produce a needless error state.
        if (!cancelled && nextFallback === null) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, isLoading, error };
}
