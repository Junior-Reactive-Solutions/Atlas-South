import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function FacilitiesManagement() {
  const { data, isLoading } = useContentPage<ServiceContent>('facilities-management');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceDetailPage id="facilities-management" path="/soft-services/facilities-management" {...data} />;
}
