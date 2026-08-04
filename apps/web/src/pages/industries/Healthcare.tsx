import { IndustryDetailPage } from '../../components/industries/IndustryDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { IndustryContent } from '../../types/content';

export function Healthcare() {
  const { data, isLoading } = useContentPage<IndustryContent>('healthcare');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <IndustryDetailPage id="healthcare" path="/industries/healthcare" {...data} />;
}
