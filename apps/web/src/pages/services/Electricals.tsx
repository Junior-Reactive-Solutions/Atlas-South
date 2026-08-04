import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function Electricals() {
  const { data, isLoading } = useContentPage<ServiceContent>('electricals');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceDetailPage id="electricals" path="/hard-services/electricals" {...data} />;
}
