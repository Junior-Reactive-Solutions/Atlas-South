import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function WasteRecycling() {
  const { data, isLoading } = useContentPage<ServiceContent>('waste-recycling');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceDetailPage id="waste-recycling" path="/soft-services/waste-recycling" {...data} />;
}
