import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

export function Catering() {
  const { data, isLoading } = useContentPage<ServiceContent>('catering');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceDetailPage id="catering" path="/soft-services/catering" {...data} />;
}
