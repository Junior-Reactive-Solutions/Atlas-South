/**
 * Cookie-consent state: what the visitor agreed to, and whether a given category may run.
 *
 * ── The default is REFUSED, and that is a legal requirement, not a preference ──────────
 *
 * The brief for this work asked that the system "default[ly] accept all cookies". That is
 * not implementable lawfully for a UK audience, so it is deliberately not what this does.
 * Under PECR reg. 6 and UK GDPR Art. 4(11), consent must be a positive, affirmative action:
 * pre-ticked boxes and default-on states do not constitute consent. The CJEU settled the
 * point in Planet49 (C-673/17), and the ICO's cookie guidance says so in terms — it also
 * requires that refusing be as easy as accepting, which is why the banner gives Accept and
 * Reject equal weight rather than burying Reject behind a settings screen.
 *
 * Defaulting to accepted would defeat the stated reason for building this at all. What IS
 * permitted, and what this implements, is making "Accept all" a single prominent click, and
 * remembering the answer for 12 months so nobody is nagged on every page.
 *
 * Until a choice is recorded, `hasConsent` returns false for every optional category, so
 * nothing non-essential runs for a first-time visitor who has not yet answered.
 */
import { CONSENT_VERSION, COOKIE_CATEGORIES, type ConsentCategory } from './cookieRegistry.js';

const STORAGE_KEY = 'atlas_south_cookie_consent';

/** 12 months, matching what the Cookie Policy tells visitors. */
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

/** Fired on the window whenever consent changes, so listeners can react without polling. */
export const CONSENT_EVENT = 'atlas-south:consent-changed';

export type ConsentChoices = Record<ConsentCategory, boolean>;

export interface ConsentRecord {
  version: number;
  /** ISO timestamp — part of being able to evidence when consent was given. */
  decidedAt: string;
  choices: ConsentChoices;
  /**
   * Random reference for this decision, sent with the server-side audit record so the
   * operator can evidence consent to the ICO (UK GDPR Art. 7(1) puts that burden on them,
   * and a choice held only here can be cleared by the visitor at any time).
   *
   * It identifies the decision, not the person: it is generated when the banner is answered
   * and transmitted only at that moment — never on page views — so it cannot be used to
   * follow anyone around the site. Optional so a record written before this existed still
   * reads back as valid rather than forcing everyone to re-consent.
   */
  consentId?: string;
}

/** Everything optional refused. The starting point before any choice is made. */
export function defaultChoices(): ConsentChoices {
  return COOKIE_CATEGORIES.reduce((acc, c) => {
    acc[c.id] = c.required;
    return acc;
  }, {} as ConsentChoices);
}

/** Everything on — only ever reached by the visitor actively choosing "Accept all". */
export function allAccepted(): ConsentChoices {
  return COOKIE_CATEGORIES.reduce((acc, c) => {
    acc[c.id] = true;
    return acc;
  }, {} as ConsentChoices);
}

/**
 * Reads the stored record, or null when there is none, it is unreadable, it predates the
 * current CONSENT_VERSION, or it has aged out. Every one of those cases means "ask again"
 * rather than "assume yes".
 *
 * Storage access is wrapped because it throws outright in some privacy modes — and a
 * visitor whose browser blocks storage must still get a working site, just one that
 * re-asks each visit.
 */
export function readConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (parsed.version !== CONSENT_VERSION) return null;
    if (!parsed.decidedAt) return null;
    // Must be a real object, not merely truthy. A tampered record holding a string here
    // would otherwise spread into the defaults harmlessly (so analytics still stayed off)
    // but count as "decided" — leaving the visitor never re-asked on the strength of a
    // record that isn't a valid answer. Treat anything malformed as no answer at all.
    if (typeof parsed.choices !== 'object' || parsed.choices === null || Array.isArray(parsed.choices)) {
      return null;
    }

    const age = Date.now() - new Date(parsed.decidedAt).getTime();
    if (!Number.isFinite(age) || age > MAX_AGE_MS) return null;

    // Merge over the defaults so a category added since this record was written is treated
    // as un-consented rather than reading back as `undefined` and being coerced to truthy
    // somewhere downstream.
    return {
      version: CONSENT_VERSION,
      decidedAt: parsed.decidedAt,
      choices: { ...defaultChoices(), ...parsed.choices },
    };
  } catch {
    return null;
  }
}

/** True only when the visitor has actively answered. Drives whether the banner shows. */
export function hasDecided(): boolean {
  return readConsent() !== null;
}

/**
 * Whether a category may run right now. Required categories are always allowed; everything
 * else needs an explicit recorded yes.
 */
export function hasConsent(category: ConsentCategory): boolean {
  const def = COOKIE_CATEGORIES.find((c) => c.id === category);
  if (def?.required) return true;
  return readConsent()?.choices[category] === true;
}

/**
 * A random, opaque reference for one decision. crypto.randomUUID where available, with a
 * Math.random fallback for older browsers — this is a correlation key for an audit row, not
 * a security token, so it does not need to be unguessable.
 */
function newConsentId(): string {
  try {
    return crypto.randomUUID().replace(/-/g, '');
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }
}

/** Persists a decision and notifies listeners. */
export function saveConsent(choices: ConsentChoices): void {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    // A fresh id per decision, so changing your mind is a new audit row rather than an
    // overwrite — the history of what was chosen and when is the point of the log.
    consentId: newConsentId(),
    // Built from the defaults outward: required categories come out true no matter what a
    // caller passed, and only the optional answers are taken from the caller. A bug in the
    // UI therefore cannot record essential storage as refused, nor an unknown category as
    // accepted.
    choices: { ...defaultChoices(), ...optionalAnswersFrom(choices) },
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked. The choice still applies for this page session via the event below;
    // the visitor will simply be asked again next visit.
  }

  // Notify listeners BEFORE the network call, so the banner closes and the analytics gate
  // flips immediately. The audit write is bookkeeping for the operator; the visitor should
  // never wait on it, and it must not be able to fail their choice.
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: record }));

  recordConsentServerSide(record);
}

/**
 * Sends the decision to the audit trail. Fire-and-forget, and deliberately silent on
 * failure: what actually runs is governed by the record above, on this device, so a failed
 * audit write must never surface to the visitor or block anything.
 *
 * Sent for refusals as well as grants — "declined analytics on this date under version N"
 * is exactly the record that demonstrates a refusal was honoured.
 */
function recordConsentServerSide(record: ConsentRecord): void {
  try {
    void fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consentId: record.consentId,
        version: record.version,
        choices: record.choices,
        decidedAt: record.decidedAt,
      }),
      // The decision often coincides with the visitor navigating away from the page they
      // answered on; keepalive lets the request outlive the unload.
      keepalive: true,
    }).catch(() => {
      /* offline, blocked, or API down — see the note above on why this is silent */
    });
  } catch {
    /* fetch itself unavailable */
  }
}

/** Keeps the caller's answers for optional categories only, coerced to real booleans. */
function optionalAnswersFrom(choices: ConsentChoices): Partial<ConsentChoices> {
  const out: Partial<ConsentChoices> = {};
  for (const c of COOKIE_CATEGORIES) {
    if (!c.required) out[c.id] = choices[c.id] === true;
  }
  return out;
}

/**
 * Clears the stored decision so the banner reappears — used by the "Cookie settings" link
 * in the footer only as a fallback; the normal path reopens the preferences panel with the
 * current choices intact.
 */
export function clearConsent(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear if storage is blocked */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}
