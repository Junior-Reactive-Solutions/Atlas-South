import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function Concierge() {
  const { data, isLoading } = useContentPage<ServiceContent>('concierge');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceDetailPage id="concierge" path="/soft-services/concierge" {...data} />;
}
