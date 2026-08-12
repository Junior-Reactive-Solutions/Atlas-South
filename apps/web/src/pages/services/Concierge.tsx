import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { NotFound } from '../NotFound';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function Concierge() {
  const { data, isLoading, error } = useContentPage<ServiceContent>('concierge');
  if (isLoading) return <PageLoadingFallback />;
  // A hidden or unpublished page 404s from the content API; render NotFound rather than
  // spinning forever on a request that will never succeed.
  if (error || !data) return <NotFound />;
  return <ServiceDetailPage id="concierge" path="/soft-services/concierge" {...data} />;
}
