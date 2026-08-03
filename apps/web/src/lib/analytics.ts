/**
 * Simple analytics tracking for page views and user interactions.
 * Data is stored in the database per docs/build/08-ADMIN-PANEL-SPEC.md §4
 */

import { nanoid } from 'nanoid';

// Generate a session ID (persists for the page session)
const SESSION_ID = nanoid();

// Track a page view
export async function trackPageView(path: string, referrer?: string) {
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

// Helper to track form submissions
export function trackFormSubmit(formName: string) {
  trackEvent('form_submit', formName);
}

// Helper to track form starts
export function trackFormStart(formName: string) {
  trackEvent('form_start', formName);
}
