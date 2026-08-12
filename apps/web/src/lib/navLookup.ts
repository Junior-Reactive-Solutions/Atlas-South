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
const PATH_TO_NAV_ID: ReadonlyMap<string, string> = new Map(
  [...HARD_SERVICES, ...SOFT_SERVICES, ...INDUSTRIES, ...SERVICE_AREAS, PACKAGES_PAGE].map(
    (item) => [item.path, item.id],
  ),
);

/** Nav id for a public path, or undefined for paths that aren't nav destinations. */
export function navIdForPath(path: string): string | undefined {
  return PATH_TO_NAV_ID.get(path);
}
