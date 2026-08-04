import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function Plumbing() {
  const { data, isLoading } = useContentPage<ServiceContent>('plumbing');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceDetailPage id="plumbing" path="/hard-services/plumbing" {...data} />;
}
