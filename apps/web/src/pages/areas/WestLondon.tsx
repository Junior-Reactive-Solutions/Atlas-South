import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { NotFound } from '../NotFound';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceAreaContent } from '../../types/content';

export function WestLondon() {
  const { data, isLoading, error } = useContentPage<ServiceAreaContent>('west-london');
  if (isLoading) return <PageLoadingFallback />;
  // A hidden or unpublished page 404s from the content API; render NotFound rather than
  // spinning forever on a request that will never succeed.
  if (error || !data) return <NotFound />;
  return <ServiceAreaDetailPage id="west-london" path="/areas/west-london" {...data} />;
}
