import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CONSENT_EVENT,
  allAccepted,
  defaultChoices,
  readConsent,
  saveConsent,
  type ConsentChoices,
} from '../../lib/consent.js';
import { CookiePreferences } from './CookiePreferences.js';
import { OPEN_COOKIE_SETTINGS_EVENT } from '../../lib/cookieSettingsBus.js';

/**
 * Cookie consent for a UK audience — the banner, plus the settings panel it opens.
 *
 * ── Two things here are deliberate and worth not "tidying up" later ───────────────────
 *
 * 1. Accept and Reject are the same size, side by side, both one click. The ICO requires
 *    that refusing be as easy as accepting; demoting "Reject" to a text link or hiding it
 *    inside the settings panel is the single most common way UK cookie banners fail.
 *
 * 2. Nothing optional runs until the visitor answers. The brief asked for consent to
 *    default to accepted — that is not lawful here (pre-ticked/default-on is not consent
 *    under PECR reg. 6 and UK GDPR Art. 4(11)), so instead "Accept all" is made the
 *    prominent single click and the answer is remembered for 12 months. The full reasoning
 *    is in lib/consent.ts.
 *
 * Dismissing the banner without answering is intentionally not offered: there is no X on
 * the banner itself, because a dismissal is ambiguous and must not be recorded as consent.
 */
export function CookieConsent() {
  // `undefined` means "not yet read" — it keeps the banner from flashing on first paint
  // for a visitor who already answered months ago.
  const [choices, setChoices] = useState<ConsentChoices | null | undefined>(undefined);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    setChoices(readConsent()?.choices ?? null);
  }, []);

  // Keep in step if consent changes elsewhere — including another tab, since clearing or
  // re-deciding there should not leave this tab acting on a stale answer.
  useEffect(() => {
    const sync = () => setChoices(readConsent()?.choices ?? null);
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    const open = () => setShowPanel(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
  }, []);

  const decide = useCallback((next: ConsentChoices) => {
    saveConsent(next);
    setChoices(next);
    setShowPanel(false);
  }, []);

  if (choices === undefined) return null;

  const needsBanner = choices === null;

  return (
    <>
      {needsBanner && !showPanel && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-desc"
          className="fixed inset-x-0 bottom-0 z-[90] border-t border-border bg-canvas shadow-[0_-8px_30px_rgba(0,36,132,0.10)]"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:gap-8">
            <div className="min-w-0 flex-1">
              <h2 id="cookie-banner-title" className="font-display text-base font-bold text-navy">
                Cookies on this site
              </h2>
              <p id="cookie-banner-desc" className="mt-1.5 text-sm leading-relaxed text-slate">
                We use essential cookies to make this site work. We'd also like to use analytics to
                understand which pages and services people use, so we can improve them — but only if
                you agree. Analytics stay off unless you turn them on, and refusing changes nothing
                about how the site works for you. Read our{' '}
                <Link to="/legal/cookies" className="font-medium text-accent-blue hover:underline">
                  Cookie Policy
                </Link>
                .
              </p>
            </div>

            {/* Accept and Reject are matched in size and weight on purpose — see the note
                at the top of this file on why refusing must be as easy as accepting. */}
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => decide(allAccepted())}
                  className="min-h-[44px] rounded-lg bg-accent-blue px-6 text-sm font-semibold text-white transition-colors hover:bg-navy"
                >
                  Accept all
                </button>
                <button
                  type="button"
                  onClick={() => decide(defaultChoices())}
                  className="min-h-[44px] rounded-lg border border-navy bg-white px-6 text-sm font-semibold text-navy transition-colors hover:bg-canvas-tint"
                >
                  Reject all
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowPanel(true)}
                className="min-h-[44px] px-2 text-sm font-semibold text-accent-blue underline-offset-4 hover:underline"
              >
                Manage cookies
              </button>
            </div>
          </div>
        </div>
      )}

      {showPanel && (
        <CookiePreferences
          initial={choices ?? defaultChoices()}
          onSave={decide}
          onClose={() => setShowPanel(false)}
        />
      )}
    </>
  );
}
