import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function AviationServices() {
  const { data, isLoading } = useContentPage<ServiceContent>('aviation');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceDetailPage id="aviation" path="/soft-services/aviation" {...data} />;
}
