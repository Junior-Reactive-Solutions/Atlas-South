import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { PageLoadingFallback } from '../../components/PageLoadingFallback';
import { NotFound } from '../NotFound';
import { useContentPage } from '../../hooks/useContentPage';
import type { ServiceContent } from '../../types/content';

// New 2026-08-26, content sourced from the client's "Atlas-South-Rail-Facilities.pdf"
// sector one-pager — cleaning and facilities management for stations, platforms, depots
// and rail infrastructure, built around service timetables and engineering windows.
export function RailFacilities() {
  const { data, isLoading, error } = useContentPage<ServiceContent>('rail-facilities');
  if (isLoading) return <PageLoadingFallback />;
  // A hidden or unpublished page 404s from the content API; render NotFound rather than
  // spinning forever on a request that will never succeed.
  if (error || !data) return <NotFound />;
  return <ServiceDetailPage id="rail-facilities" path="/soft-services/rail-facilities" {...data} />;
}
