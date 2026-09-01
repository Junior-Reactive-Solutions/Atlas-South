/**
 * A one-line event bus for "open the cookie settings panel".
 *
 * Split out of CookieConsent.tsx so that file exports only its component — mixing a
 * component and plain helpers in one module breaks React Fast Refresh (and trips the
 * react-refresh/only-export-components lint rule).
 *
 * An event rather than context or prop drilling: the two callers (the footer, on every
 * page, and a link inside the Cookie Policy) sit in completely different parts of the tree
 * from the panel itself, which lives in Layout. There is no shared state to hold — just a
 * "please open" nudge — so a context provider would be more machinery than the job needs.
 */
export const OPEN_COOKIE_SETTINGS_EVENT = 'atlas-south:open-cookie-settings';

/** Opens the cookie preferences panel, pre-filled with the visitor's current choices. */
export function openCookieSettings(): void {
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
}
