import { Link } from 'react-router-dom';
import { Seo } from '../../components/seo/Seo.js';
import { PAGE_SEO, COMPANY } from '@atlas-south/shared';
import { COOKIE_CATEGORIES } from '../../lib/cookieRegistry.js';
import { openCookieSettings } from '../../lib/cookieSettingsBus.js';

/**
 * Public Cookie Policy.
 *
 * The "what we store" section is rendered from COOKIE_CATEGORIES — the same array the
 * consent gate enforces — rather than being written out as prose. That is the whole point
 * of this rewrite (2026-08-31): the previous version was hand-maintained and had drifted
 * into describing a site that doesn't exist. It told visitors we set Google Analytics
 * cookies (`_ga`, `_gid`, `_gat`) when Google Analytics has never been used here, named
 * `_session` and `csrf_token` when the only cookie is `refreshToken`, and claimed a consent
 * banner existed and gated analytics — when there was no banner and analytics ran for
 * everyone on every page load.
 *
 * Under UK GDPR Art. 13 and the ICO's cookie guidance this page has to describe what
 * actually happens. Deriving it from the enforcement data is what keeps that true: a
 * tracker added without a registry entry also gets no consent gate, which fails loudly
 * rather than quietly leaving this page stale.
 */
export function CookiePolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Seo {...PAGE_SEO['/legal/cookies']} />

      <h1 className="mb-2 text-4xl font-black text-navy">Cookie Policy</h1>
      <p className="mb-8 text-slate-600">Last updated: 31 August 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-slate-700">
        <section>
          <h2 className="text-xl font-bold text-navy">1. The short version</h2>
          <p>
            We use a small amount of storage to make this site work, and — only if you agree — a
            simple analytics count so we can see which pages and services people actually use.
          </p>
          <p>
            <strong>We do not use Google Analytics, advertising cookies, social media trackers, or
            any third-party tracking of any kind.</strong> Nothing on this site shares your browsing
            with another company. The analytics, if you allow them, go to our own servers and nowhere
            else.
          </p>
          <p>
            Analytics are <strong>off until you turn them on</strong>. If you refuse, nothing about
            the site changes for you, and we do not count you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">2. What are cookies?</h2>
          <p>
            "Cookies" is the common name for small pieces of data a site stores on your device.
            People generally use the word to cover related technologies too — such as local storage —
            so this policy uses it broadly and tells you exactly which mechanism each item uses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">3. Exactly what we store</h2>
          <p>This is the complete list. There is nothing on this site that is not named here.</p>

          <div className="mt-4 space-y-5 not-prose">
            {COOKIE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`rounded-lg border-l-4 p-4 ${
                  cat.required ? 'border-navy bg-slate-50' : 'border-accent-blue bg-blue-50'
                }`}
              >
                <h3 className="font-bold text-navy">{cat.label}</h3>
                <p className="mt-2 text-sm text-slate-700">{cat.description}</p>

                <div className="mt-4 space-y-4">
                  {cat.entries.map((entry) => (
                    <div key={entry.name} className="border-t border-slate-200 pt-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs text-navy">
                          {entry.name}
                        </code>
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                          {entry.storage}
                        </span>
                        {entry.adminOnly && (
                          <span className="rounded bg-white px-1.5 py-0.5 text-xs text-slate-600">
                            Staff sign-in only
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 leading-relaxed text-slate-700">{entry.purpose}</p>
                      <p className="mt-1 text-xs text-slate-500">Kept: {entry.retention}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-xs italic text-slate-600">
                  {cat.required
                    ? '✓ Always active — exempt from consent under UK regulations'
                    : '✓ Off unless you choose to allow it'}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">4. Your choice, and changing it</h2>
          <p>
            The first time you visit, a banner asks what you're happy with. You can accept everything,
            refuse everything optional, or open the settings panel and choose per category. Refusing
            is a single click, exactly like accepting.
          </p>
          <p>
            You can change your mind whenever you like — use{' '}
            <button
              type="button"
              onClick={openCookieSettings}
              className="font-medium text-accent-blue underline hover:no-underline"
            >
              Cookie settings
            </button>{' '}
            here or the same link in the footer of every page.
          </p>
          <p>
            We remember your answer for <strong>12 months</strong>, then ask again. We'll also ask
            again sooner if we ever change what we collect.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">5. If you refuse analytics</h2>
          <p>
            Then we do not record your visit. There is no fallback, no delayed collection, and no
            separate mechanism that counts you anyway.
          </p>
          <p>Two things do still happen, and you should know about both:</p>
          <ul className="ml-6 space-y-2">
            <li>
              • <strong>We keep a record of the choice itself.</strong> Which categories you allowed
              or refused, and when. We keep it so that if we are ever asked to show we respected your
              decision, we can. It contains no address, no device details and nothing about which
              pages you looked at — it is a record of the answer, not of you.
            </li>
            <li>
              • <strong>If something breaks, we log the fault.</strong> When a page fails to load or
              the site throws an error, we record what went wrong and which page it happened on, so
              we can fix it. No identifier of any kind is attached, and these records are never
              joined up into a picture of one person's visit.
            </li>
          </ul>
          <p className="mt-4">
            Beyond that, the only thing that continues is the ordinary server record every website
            keeps in order to serve a page at all — the sort of log that tells us how much traffic the
            site handled. It involves no cookies and nothing that identifies you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">6. Third parties</h2>
          <p>
            <strong>None.</strong> We do not use Google Analytics, advertising networks, social media
            pixels, or embedded third-party trackers. No analytics data about you leaves our own
            systems.
          </p>
          <p>
            The site does load fonts from Google Fonts to render text, which means your browser
            contacts Google's servers for the font files themselves. That is a request for a font, not
            tracking, and it does not set cookies on this site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">7. Controlling cookies in your browser</h2>
          <p>You can also manage storage directly in your browser:</p>
          <ul className="ml-6 space-y-1">
            <li>• <strong>Chrome:</strong> Settings → Privacy and security → Third-party cookies</li>
            <li>• <strong>Firefox:</strong> Settings → Privacy &amp; Security → Cookies and Site Data</li>
            <li>• <strong>Safari:</strong> Settings → Privacy → Manage Website Data</li>
            <li>• <strong>Edge:</strong> Settings → Cookies and site permissions</li>
          </ul>
          <p className="mt-3">
            If you block all storage, the site still works — but we won't be able to remember your
            cookie choice, so the banner will appear on each visit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">8. Your rights</h2>
          <p>
            Where the limited analytics data we hold counts as personal data, UK GDPR gives you rights
            over it — including access, correction, erasure, and objection. Our{' '}
            <Link to="/legal/privacy" className="text-accent-blue hover:underline">
              Privacy Policy
            </Link>{' '}
            explains those and how to exercise them. You also have the right to complain to the
            Information Commissioner's Office (ICO) at{' '}
            <a
              href="https://ico.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-blue hover:underline"
            >
              ico.org.uk
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">9. Changes to this policy</h2>
          <p>
            If we change what we collect, we'll update this page and ask for your consent again rather
            than relying on an answer you gave about something different.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">10. Contact</h2>
          <p>Questions about any of this:</p>
          <div className="mt-4 rounded bg-slate-50 p-4 not-prose">
            <p className="font-semibold text-navy">{COMPANY.name}</p>
            <p className="text-sm text-slate-700">
              Email:{' '}
              <a href={`mailto:${COMPANY.email}`} className="text-accent-blue hover:underline">
                {COMPANY.email}
              </a>
            </p>
            <p className="text-sm text-slate-700">
              Phone:{' '}
              <a href={`tel:${COMPANY.phone.tel}`} className="text-accent-blue hover:underline">
                {COMPANY.phone.display}
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
