import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function ReactiveMaintenance() {
  const { data, isLoading } = useContentPage<ServiceContent>('reactive-maintenance');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceDetailPage id="reactive-maintenance" path="/hard-services/reactive-maintenance" {...data} />;
}
