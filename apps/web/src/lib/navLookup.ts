import {
  HARD_SERVICES,
  SOFT_SERVICES,
  INDUSTRIES,
  SERVICE_AREAS,
  PACKAGES_PAGE,
} from '@atlas-south/shared';

/**
 * Public path → nav item id.
 *
 * Related-service links stored in page content carry only a label and a path, but
 * visibility is keyed by nav id. This resolves one to the other so a hidden page also
 * disappears from every "related services" grid, not just from the header and footer.
 *
 * Built from the shared navigation constants, so it cannot drift from the real IA.
 */
const ALL_NAV_ITEMS = [...HARD_SERVICES, ...SOFT_SERVICES, ...INDUSTRIES, ...SERVICE_AREAS, PACKAGES_PAGE];

const PATH_TO_NAV_ID: ReadonlyMap<string, string> = new Map(ALL_NAV_ITEMS.map((item) => [item.path, item.id]));

/** Nav id for a public path, or undefined for paths that aren't nav destinations. */
export function navIdForPath(path: string): string | undefined {
  return PATH_TO_NAV_ID.get(path);
}

/**
 * Paths currently flagged `placeholder: true` ("Coming Soon" — real content isn't written
 * yet). Page content's `relatedServices` entries carry only a label and a path (not the
 * full NavItem, so no `.placeholder` field to check directly) — this is what lets
 * ServiceDetailPage/IndustryDetailPage cross-reference a related-service link back against
 * the real nav data and exclude it the same way useVisibleNavItems does for lists built
 * directly from HARD_SERVICES/SOFT_SERVICES/INDUSTRIES.
 */
const PLACEHOLDER_PATHS: ReadonlySet<string> = new Set(
  ALL_NAV_ITEMS.filter((item) => item.placeholder).map((item) => item.path),
);

/** True if this path is a "Coming Soon" placeholder page. */
export function isPlaceholderPath(path: string): boolean {
  return PLACEHOLDER_PATHS.has(path);
}
