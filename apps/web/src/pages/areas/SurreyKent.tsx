import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceAreaContent } from '../../types/content';

export function SurreyKent() {
  const { data, isLoading } = useContentPage<ServiceAreaContent>('surrey-kent');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <ServiceAreaDetailPage id="surrey-kent" path="/areas/surrey-kent" {...data} />;
}
