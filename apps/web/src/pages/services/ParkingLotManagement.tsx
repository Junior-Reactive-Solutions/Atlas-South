import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { NotFound } from '../NotFound';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

// Moved here from pages/industries/ 2026-08-20 at the client's request — the content
// (sweeping, pressure washing, line marking, equipment maintenance) is a service offering
// like the rest of Soft Services, not a client vertical like Healthcare or Oil & Gas.
// Content sourced from the client's "Atlas South-Parking-Lot-Management.pdf"
// (2026-08-20 WhatsApp content drop).
export function ParkingLotManagement() {
  const { data, isLoading, error } = useContentPage<ServiceContent>('parking-lot-management');
  if (isLoading) return <PageLoadingFallback />;
  // A hidden or unpublished page 404s from the content API; render NotFound rather than
  // spinning forever on a request that will never succeed.
  if (error || !data) return <NotFound />;
  return <ServiceDetailPage id="parking-lot-management" path="/soft-services/parking-lot-management" {...data} />;
}
