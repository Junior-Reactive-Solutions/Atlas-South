import { IndustryDetailPage } from '../../components/industries/IndustryDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { IndustryContent } from '../../types/content';

export function Corporate() {
  const { data, isLoading } = useContentPage<IndustryContent>('corporate');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <IndustryDetailPage id="corporate" path="/industries/corporate" {...data} />;
}
