import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@atlas-south/design-system';
import { COOKIE_CATEGORIES } from '../../lib/cookieRegistry.js';
import { allAccepted, defaultChoices, type ConsentChoices } from '../../lib/consent.js';

interface CookiePreferencesProps {
  /** Current choices to pre-fill the toggles with. */
  initial: ConsentChoices;
  onSave: (choices: ConsentChoices) => void;
  onClose: () => void;
}

/**
 * The "manage cookies" screen — the second surface, opened from the banner or from the
 * footer's "Cookie settings" link.
 *
 * Every category and every named item below is rendered from COOKIE_CATEGORIES rather than
 * written out here, so this panel cannot describe a different set of trackers to the one
 * the consent gate actually enforces.
 *
 * Optional toggles start from whatever `initial` says, which for a first-time visitor is
 * everything off — pre-ticking them would not be valid consent under UK rules. See the
 * note at the top of lib/consent.ts.
 */
export function CookiePreferences({ initial, onSave, onClose }: CookiePreferencesProps) {
  const [choices, setChoices] = useState<ConsentChoices>(initial);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus into the dialog on open, and restore focus to whatever opened it on close, so a
  // keyboard or screen-reader user isn't dropped back at the top of the document.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  // Escape closes without saving — the panel is a modal, and abandoning it must not be
  // read as a decision either way.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Simple focus trap: keep Tab cycling inside the dialog while it's open.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const toggle = (id: keyof ConsentChoices) =>
    setChoices((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-navy/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-prefs-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-canvas shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
          <div>
            <h2 id="cookie-prefs-title" className="font-display text-xl font-bold text-navy">
              Cookie settings
            </h2>
            <p className="mt-1 text-sm text-slate">
              Choose what you're happy for us to use. You can change this at any time.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close cookie settings"
            className="shrink-0 rounded-lg p-2 text-slate hover:bg-canvas-tint hover:text-navy"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-7">
          {COOKIE_CATEGORIES.map((cat) => {
            const on = cat.required || choices[cat.id];
            return (
              <section key={cat.id} className="rounded-xl border border-border bg-white p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-navy">{cat.label}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate">{cat.description}</p>
                  </div>

                  {cat.required ? (
                    <span className="shrink-0 rounded-full bg-canvas-tint px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate">
                      Always on
                    </span>
                  ) : (
                    /* A real checkbox rather than a styled div: it is focusable, announced
                       correctly by screen readers, and toggles with Space, all for free. */
                    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={on}
                        onChange={() => toggle(cat.id)}
                        aria-describedby={`cookie-cat-${cat.id}-desc`}
                      />
                      <span className="sr-only">{`Allow ${cat.label.toLowerCase()} cookies`}</span>
                      <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-accent-blue peer-focus-visible:ring-2 peer-focus-visible:ring-accent-blue peer-focus-visible:ring-offset-2" />
                      <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                    </label>
                  )}
                </div>

                <ul id={`cookie-cat-${cat.id}-desc`} className="mt-4 space-y-3 border-t border-border pt-4">
                  {cat.entries.map((entry) => (
                    <li key={entry.name} className="text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded bg-canvas-tint px-1.5 py-0.5 font-mono text-xs text-navy">
                          {entry.name}
                        </code>
                        <span className="text-xs uppercase tracking-wide text-slate-400">{entry.storage}</span>
                        {entry.adminOnly && (
                          <span className="rounded bg-canvas-tint px-1.5 py-0.5 text-xs text-slate">
                            Staff sign-in only
                          </span>
                        )}
                      </div>
                      <p className="mt-1 leading-relaxed text-slate">{entry.purpose}</p>
                      <p className="mt-0.5 text-xs text-slate-400">Kept: {entry.retention}</p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <p className="text-sm text-slate">
            Full detail is in our{' '}
            <Link to="/legal/cookies" className="font-medium text-accent-blue hover:underline" onClick={onClose}>
              Cookie Policy
            </Link>{' '}
            and{' '}
            <Link to="/legal/privacy" className="font-medium text-accent-blue hover:underline" onClick={onClose}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-border bg-canvas-tint px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={() => onSave(defaultChoices())}
            className="min-h-[44px] rounded-lg border border-border bg-white px-5 text-sm font-semibold text-navy hover:border-navy"
          >
            Reject optional
          </button>
          <button
            type="button"
            onClick={() => onSave(choices)}
            className="min-h-[44px] rounded-lg border border-border bg-white px-5 text-sm font-semibold text-navy hover:border-navy"
          >
            Save my choices
          </button>
          <button
            type="button"
            onClick={() => onSave(allAccepted())}
            className="min-h-[44px] rounded-lg bg-accent-blue px-5 text-sm font-semibold text-white hover:bg-navy"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
