import { IndustryDetailPage } from '../../components/industries/IndustryDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { NotFound } from '../NotFound';
import { useContentPage } from '../../hooks/useContentPage';
import type { IndustryContent } from '../../types/content';

export function Education() {
  const { data, isLoading, error } = useContentPage<IndustryContent>('education');
  if (isLoading) return <PageLoadingFallback />;
  // A hidden or unpublished page 404s from the content API; render NotFound rather than
  // spinning forever on a request that will never succeed.
  if (error || !data) return <NotFound />;
  return <IndustryDetailPage id="education" path="/industries/education" {...data} />;
}
