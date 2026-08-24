import {
  HARD_SERVICES,
  SOFT_SERVICES,
  INDUSTRIES,
  SERVICE_AREAS,
} from '@atlas-south/shared';

/**
 * Every nav item id whose public visibility may be toggled from the admin panel.
 *
 * This is an allowlist, and it is a security control rather than a convenience: the
 * visibility PATCH endpoint writes a row keyed by whatever id it is given, so without
 * this check an authenticated caller could create unbounded arbitrary rows in
 * PageVisibility (a slow storage-exhaustion vector) or hide things by guessing ids that
 * were never meant to be toggleable. Validating against the shared navigation constants
 * means the set of togglable pages is derived from the site's own IA and cannot drift.
 *
 * Company and legal pages are deliberately excluded — Contact, Privacy Policy, Terms and
 * Cookie Policy must not be hideable. Removing a privacy policy or terms page from a
 * live commercial site is a compliance problem (UK GDPR Art. 13 transparency, PECR
 * cookie consent), so the safest design is for the admin UI to have no such switch at
 * all rather than to rely on an operator not pressing it.
 */
export const TOGGLEABLE_NAV_IDS: ReadonlySet<string> = new Set(
  [...HARD_SERVICES, ...SOFT_SERVICES, ...INDUSTRIES, ...SERVICE_AREAS].map(
    (item) => item.id,
  ),
);

/** True when `navId` is a page whose visibility an admin is permitted to change. */
export function isToggleableNavId(navId: string): boolean {
  return TOGGLEABLE_NAV_IDS.has(navId);
}

/**
 * Nav item id → public path, used to map a hidden id back to the route that must 404.
 * Built from the same constants so it cannot fall out of sync with the router.
 */
export const NAV_ID_TO_PATH: ReadonlyMap<string, string> = new Map(
  [...HARD_SERVICES, ...SOFT_SERVICES, ...INDUSTRIES, ...SERVICE_AREAS].map(
    (item) => [item.id, item.path],
  ),
);
