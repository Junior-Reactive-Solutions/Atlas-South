import { IndustryDetailPage } from '../../components/industries/IndustryDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { NotFound } from '../NotFound';
import { useContentPage } from '../../hooks/useContentPage';
import type { IndustryContent } from '../../types/content';

// New this round — content sourced from the client's "Atlas South-Parking-Lot-Management.pdf"
// (2026-08-20 WhatsApp content drop). No previous route existed for this slug.
export function ParkingLotManagement() {
  const { data, isLoading, error } = useContentPage<IndustryContent>('parking-lot-management');
  if (isLoading) return <PageLoadingFallback />;
  // A hidden or unpublished page 404s from the content API; render NotFound rather than
  // spinning forever on a request that will never succeed.
  if (error || !data) return <NotFound />;
  return <IndustryDetailPage id="parking-lot-management" path="/industries/parking-lot-management" {...data} />;
}
