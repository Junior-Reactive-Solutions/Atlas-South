import { IndustryDetailPage } from '../../components/industries/IndustryDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { IndustryContent } from '../../types/content';

export function Retail() {
  const { data, isLoading } = useContentPage<IndustryContent>('retail');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <IndustryDetailPage id="retail" path="/industries/retail" {...data} />;
}
