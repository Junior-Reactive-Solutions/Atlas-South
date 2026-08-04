import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function FireSafety() {
  const { data, isLoading } = useContentPage<ServiceContent>('fire-safety');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceDetailPage id="fire-safety" path="/hard-services/fire-safety" {...data} />;
}
