import { IndustryDetailPage } from '../../components/industries/IndustryDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { useContentPage } from '../../hooks/useContentPage';
import type { IndustryContent } from '../../types/content';

export function Education() {
  const { data, isLoading } = useContentPage<IndustryContent>('education');
  if (isLoading || !data) return <PageLoadingFallback />;
  return <IndustryDetailPage id="education" path="/industries/education" {...data} />;
}
