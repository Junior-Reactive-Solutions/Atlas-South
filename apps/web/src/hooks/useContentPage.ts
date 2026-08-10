import { useEffect, useState } from 'react';

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

/** Fetches a page's live (published) content from the Content Management API by slug. */
export function useContentPage<T>(slug: string): UseContentPageResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(false);

    fetch(`/api/content/${slug}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch content for "${slug}"`);
        return response.json() as Promise<ContentPageResponse<T>>;
      })
      .then((json) => {
        if (!cancelled) setData(json.publishedData);
      })
      .catch(() => {
        if (!cancelled) setError(true);
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
