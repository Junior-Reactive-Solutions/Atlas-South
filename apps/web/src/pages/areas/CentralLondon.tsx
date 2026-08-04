import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceAreaContent } from '../../types/content';

export function CentralLondon() {
  const { data, isLoading } = useContentPage<ServiceAreaContent>('central-london');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceAreaDetailPage id="central-london" path="/areas/central-london" {...data} />;
}
