/**
 * Simple analytics tracking for page views and user interactions.
 * Data is stored in the database per docs/build/08-ADMIN-PANEL-SPEC.md §4
 *
 * CONSENT-GATED (2026-08-31). Every send below goes through `analyticsAllowed()` and is
 * dropped unless the visitor has actively opted in. Before this, tracking fired on every
 * page load for everyone — while the published Cookie Policy simultaneously told visitors
 * that analytics only ran "after you've given consent". The policy was describing a gate
 * that did not exist; this is that gate.
 *
 * The refusal is real, not cosmetic: nothing is queued, buffered or back-filled when
 * someone declines, and there is no parallel un-gated path that keeps counting them
 * anyway. Aggregate traffic volume is still visible from the hosting platform's own
 * request logs, which involve no device storage and no identifier — that is the legitimate
 * way to know how busy the site is without overriding a visitor's answer.
 */

import { nanoid } from 'nanoid';
import { hasConsent } from './consent.js';

/**
 * Grouping reference for one visit. Generated in memory, never written to a cookie or to
 * localStorage, and gone when the tab closes — see the note in cookieRegistry.ts. It
 * exists so five page views by one person are not counted as five people.
 */
const SESSION_ID = nanoid();

/** Single gate for every send in this module. */
function analyticsAllowed(): boolean {
  return hasConsent('analytics');
}

// Track a page view
export async function trackPageView(path: string, referrer?: string) {
  if (!analyticsAllowed()) return;
  try {
    await fetch('/api/events/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        referrer: referrer || document.referrer || null,
        sessionId: SESSION_ID,
      }),
    });
  } catch (error) {
    // Fail silently — analytics should never break the app
    console.debug('Analytics error:', error);
  }
}

// Track user interactions (CTA clicks, form submissions, etc.)
export async function trackEvent(
  type: string,
  label: string,
  path?: string,
) {
  if (!analyticsAllowed()) return;
  try {
    await fetch('/api/events/interaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        label,
        path: path || window.location.pathname,
        sessionId: SESSION_ID,
      }),
    });
  } catch (error) {
    // Fail silently
    console.debug('Analytics error:', error);
  }
}

// Helper to track CTA clicks
export function trackCTAClick(label: string) {
  trackEvent('cta_click', label);
}

// Helper to track phone-number taps/clicks — `type` in EventType (@atlas-south/shared)
// already reserves 'phone_click' and 'whatsapp_click' for exactly this; these two calls
// are what actually fire them; without a caller, the schema declared the event but
// nothing ever sent it.
export function trackPhoneClick(label: string) {
  trackEvent('phone_click', label);
}

// Helper to track WhatsApp link clicks
export function trackWhatsAppClick(label: string) {
  trackEvent('whatsapp_click', label);
}

// Helper to track form submissions
export function trackFormSubmit(formName: string) {
  trackEvent('form_submit', formName);
}

// Helper to track form starts
export function trackFormStart(formName: string) {
  trackEvent('form_start', formName);
}
