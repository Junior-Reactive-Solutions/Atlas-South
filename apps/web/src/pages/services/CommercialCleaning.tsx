import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function CommercialCleaning() {
  const { data, isLoading } = useContentPage<ServiceContent>('commercial-cleaning');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceDetailPage id="commercial-cleaning" path="/soft-services/commercial-cleaning" {...data} />;
}
