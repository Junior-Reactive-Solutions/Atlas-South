import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceAreaContent } from '../../types/content';

export function WestLondon() {
  const { data, isLoading } = useContentPage<ServiceAreaContent>('west-london');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceAreaDetailPage id="west-london" path="/areas/west-london" {...data} />;
}
