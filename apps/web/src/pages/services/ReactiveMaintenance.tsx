import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { NotFound } from '../NotFound';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function ReactiveMaintenance() {
  const { data, isLoading, error } = useContentPage<ServiceContent>('reactive-maintenance');
  if (isLoading) return <PageLoadingFallback />;
  // A hidden or unpublished page 404s from the content API; render NotFound rather than
  // spinning forever on a request that will never succeed.
  if (error || !data) return <NotFound />;
  return <ServiceDetailPage id="reactive-maintenance" path="/hard-services/reactive-maintenance" {...data} />;
}
