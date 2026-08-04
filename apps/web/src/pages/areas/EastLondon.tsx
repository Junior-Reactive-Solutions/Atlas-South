import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceAreaContent } from '../../types/content';

export function EastLondon() {
  const { data, isLoading } = useContentPage<ServiceAreaContent>('east-london');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceAreaDetailPage id="east-london" path="/areas/east-london" {...data} />;
}
