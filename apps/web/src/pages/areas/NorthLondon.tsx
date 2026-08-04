import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceAreaContent } from '../../types/content';

export function NorthLondon() {
  const { data, isLoading } = useContentPage<ServiceAreaContent>('north-london');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceAreaDetailPage id="north-london" path="/areas/north-london" {...data} />;
}
