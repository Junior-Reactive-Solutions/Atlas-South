import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceAreaContent } from '../../types/content';

export function SouthEastLondon() {
  const { data, isLoading } = useContentPage<ServiceAreaContent>('south-east-london');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceAreaDetailPage id="south-east-london" path="/areas/south-east-london" {...data} />;
}
