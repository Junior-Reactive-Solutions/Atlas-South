import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function SecurityServices() {
  const { data, isLoading } = useContentPage<ServiceContent>('security');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceDetailPage id="security" path="/soft-services/security" {...data} />;
}
