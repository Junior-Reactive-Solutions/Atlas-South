/**
 * The single source of truth for what this site stores on a visitor's device, and what it
 * tracks. The consent banner, the preferences panel and the public Cookie Policy page all
 * render from this one array.
 *
 * WHY IT'S CENTRALISED: before this existed, the Cookie Policy page was hand-written prose
 * that had drifted completely away from the code. As of 2026-08-31 it told visitors we set
 * Google Analytics cookies (`_ga`, `_gid`, `_gat` — we have never used Google Analytics),
 * named two cookies that don't exist (`_session`, `csrf_token` — the real one is
 * `refreshToken`), and stated that "a cookie banner appears at the bottom of the page" and
 * that analytics only run "after you've given consent" — when no banner existed and
 * analytics fired on every page load regardless.
 *
 * Under UK GDPR Art. 13 and the ICO's cookie guidance, a cookie policy has to accurately
 * describe what actually happens. A policy naming trackers you don't run is not a harmless
 * over-disclosure — it's a misstatement to the visitor and to the regulator. Rendering the
 * page from the same data the enforcement code uses is what stops that recurring: adding a
 * tracker without listing it here means it also doesn't get a consent gate, which is a much
 * louder failure than a stale paragraph.
 *
 * ADDING A NEW TRACKER OR COOKIE: add it here first, in the right category. If it isn't
 * `strictly-necessary`, gate the code that sets it behind `hasConsent(category)` from
 * ./consent.ts.
 */

/**
 * Categories are deliberately limited to what this site genuinely does.
 *
 * There is no `marketing` category, even though the previous policy reserved one "for
 * future use". Listing a category we don't use invites a visitor to refuse something that
 * was never happening, and pads the banner with a choice that carries no meaning. Add one
 * if and when a real marketing tracker ships.
 */
export type ConsentCategory = 'strictly-necessary' | 'analytics';

export interface CookieEntry {
  /** The literal key as stored, e.g. the cookie name or localStorage key. */
  name: string;
  /** Where it lives — visitors reasonably read "cookie" broadly, so be specific. */
  storage: 'Cookie' | 'Local storage' | 'In memory only';
  purpose: string;
  /** Human-readable retention, e.g. "12 months", "Until you close the tab". */
  retention: string;
  /** Present only for the admin panel, so most visitors never receive it at all. */
  adminOnly?: boolean;
}

export interface CookieCategoryDef {
  id: ConsentCategory;
  label: string;
  /** Shown in the preferences panel and on the policy page. */
  description: string;
  /**
   * Strictly-necessary is exempt from the PECR reg. 6(4) consent requirement, so its
   * toggle is locked on. Everything else must be off until the visitor opts in.
   */
  required: boolean;
  entries: CookieEntry[];
}

export const COOKIE_CATEGORIES: CookieCategoryDef[] = [
  {
    id: 'strictly-necessary',
    label: 'Strictly necessary',
    description:
      'Needed for the site to work and to remember the choice you make here. These are exempt from consent under UK regulations, so they cannot be switched off.',
    required: true,
    entries: [
      {
        name: 'atlas_south_cookie_consent',
        storage: 'Local storage',
        purpose:
          'Records which categories you agreed to, and when, so we do not ask again on every page. Without it we would have to show this banner every single visit. We also keep our own copy of the choice itself — what was chosen and when — so we can show we honoured it. That copy holds no address, device or browsing information and is never used to recognise you.',
        retention: '12 months, then we ask again',
      },
      {
        name: 'refreshToken',
        storage: 'Cookie',
        purpose:
          'Keeps a signed-in administrator logged in. Set only when someone signs into the admin panel — it is never issued to ordinary visitors.',
        retention: 'Until sign-out or expiry',
        adminOnly: true,
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description:
      'Helps us see which pages and services people actually use, so we can improve the site. Off unless you turn it on. Refusing changes nothing about how the site works for you.',
    required: false,
    entries: [
      {
        name: 'Session reference',
        storage: 'In memory only',
        purpose:
          'A random reference generated fresh each time you open the site, used to group your page views into one visit so a single person browsing five pages is not counted as five people. It is not stored on your device, is not a cookie, is discarded when you close the tab, and is not linked to your name, email or IP address.',
        retention: 'Until you close the tab',
      },
      {
        name: 'Page views and interactions',
        storage: 'In memory only',
        purpose:
          'Which pages were viewed, where you arrived from, and which buttons were used (for example tapping the phone number). Sent to our own servers — not to Google Analytics or any third-party advertising network.',
        retention: 'Held on our servers; not stored on your device',
      },
    ],
  },
];

/** Convenience: the categories a visitor can actually choose to refuse. */
export const OPTIONAL_CATEGORIES = COOKIE_CATEGORIES.filter((c) => !c.required);

/**
 * Bumped when the categories or their purposes materially change. A stored consent record
 * with an older version is treated as absent, so visitors are re-asked rather than being
 * held to a choice they made about a different set of trackers.
 */
export const CONSENT_VERSION = 1;
