import { Seo } from '../../components/seo/Seo.js';

export function CookiePolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Seo
        title="Cookie Policy"
        description="Which cookies Atlas South Technical Services uses, what they're for, and how to manage your cookie preferences."
        path="/legal/cookies"
      />
      <h1 className="mb-2 text-4xl font-black text-navy">Cookie Policy</h1>
      <p className="mb-8 text-slate-600">Last updated: August 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-slate-700">
        <section>
          <h2 className="text-xl font-bold text-navy">1. What Are Cookies?</h2>
          <p>
            Cookies are small pieces of data stored on your device (computer, tablet, or phone) when you visit a website. They allow
            websites to remember information about your visit and personalize your experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">2. Cookies We Use</h2>
          <p>We use cookies in the following categories:</p>

          <div className="mt-4 space-y-4">
            <div className="rounded border-l-4 border-navy bg-slate-50 p-4">
              <h3 className="font-bold text-navy">Strictly Necessary</h3>
              <p className="mt-2 text-sm">
                These cookies are essential for the website to function. They help with security and user session management.
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <strong>_session:</strong> Maintains your login session when you access the admin panel
                </p>
                <p>
                  <strong>csrf_token:</strong> Protects against cross-site request forgery attacks
                </p>
              </div>
              <p className="mt-2 text-xs italic text-slate-600">
                ✓ Always active — no consent required
              </p>
            </div>

            <div className="rounded border-l-4 border-accent-blue bg-blue-50 p-4">
              <h3 className="font-bold text-navy">Analytics</h3>
              <p className="mt-2 text-sm">
                These cookies help us understand how visitors use our website so we can improve it. They track page visits and user
                interactions.
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <strong>_ga:</strong> Google Analytics — tracks unique visitors across sessions
                </p>
                <p>
                  <strong>_gid:</strong> Google Analytics — identifies unique users within a session
                </p>
                <p>
                  <strong>_gat:</strong> Google Analytics — throttles request rate
                </p>
                <p>
                  <strong>sessionId:</strong> Our custom analytics — anonymised session tracking
                </p>
              </div>
              <p className="mt-2 text-xs italic text-slate-600">
                ✓ Requires consent via cookie banner
              </p>
            </div>

            <div className="rounded border-l-4 border-slate-400 bg-slate-50 p-4">
              <h3 className="font-bold text-navy">Marketing</h3>
              <p className="mt-2 text-sm">
                We currently do not use marketing cookies. This category is reserved for future use if we run targeted campaigns.
              </p>
              <p className="mt-2 text-xs italic text-slate-600">
                ✓ Requires consent via cookie banner
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">3. How We Use Cookie Data</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-slate-900">Analytics Cookies</h3>
              <p>
                We use analytics cookies to understand which pages are most popular, where users come from, and how they interact with
                the site. This helps us:
              </p>
              <ul className="ml-6 space-y-1">
                <li>• Improve website design and functionality</li>
                <li>• Identify popular services and content</li>
                <li>• Measure conversion rates (enquiries to quotes)</li>
                <li>• Track the effectiveness of marketing efforts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Session Cookies</h3>
              <p>
                We use session cookies to keep you logged in when you access the admin panel and to protect against security threats
                (CSRF tokens).
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">4. Cookie Consent & Management</h2>
          <p>
            When you first visit our website, a cookie banner appears at the bottom of the page. You can:
          </p>
          <ul className="ml-6 space-y-2">
            <li>• <strong>Accept All:</strong> Allow both strictly necessary and analytics cookies</li>
            <li>• <strong>Reject Analytics:</strong> Only allow strictly necessary cookies (no tracking)</li>
            <li>• <strong>Cookie Settings:</strong> Customize which categories of cookies you want</li>
          </ul>
          <p className="mt-4">
            You can change your cookie preferences at any time by clicking "Cookie Settings" in the footer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">5. Third-Party Cookies</h2>
          <p>
            Google Analytics places analytics cookies on your device to help us track website usage. Google's cookies are governed by
            Google's privacy policy. You can opt out of Google Analytics tracking by installing the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" className="text-accent-blue hover:underline">
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">6. How to Control Cookies in Your Browser</h2>
          <p>Most browsers allow you to control cookies through their settings:</p>
          <ul className="ml-6 space-y-2">
            <li>• <strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
            <li>• <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
            <li>• <strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
            <li>• <strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and other site data</li>
          </ul>
          <p className="mt-4">
            You can also enable "Do Not Track" (DNT) in your browser settings, though most websites don't respond to DNT signals yet.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">7. Disabling Cookies</h2>
          <p>
            If you disable all cookies, some features of our website may not work properly. For example, you won't be able to log into
            the admin panel, and analytics features may not function.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">8. Cookie Retention</h2>
          <div className="space-y-2 rounded bg-blue-50 p-4">
            <p>
              <strong>Session cookies:</strong> Deleted when you close your browser
            </p>
            <p>
              <strong>Analytics cookies:</strong> Typically retained for 14 months per Google Analytics standards
            </p>
            <p>
              <strong>Consent preference cookie:</strong> Retained for 12 months so we remember your cookie preferences
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">9. Privacy & GDPR Compliance</h2>
          <p>
            Analytics cookies are only set <strong>after you've given consent</strong> via the cookie banner. We do not track you with
            Google Analytics until you explicitly accept analytics cookies.
          </p>
          <p>
            For more information about how we handle your data generally, see our <a href="/legal/privacy" className="text-accent-blue hover:underline">Privacy Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">10. Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy as our cookie practices change. We'll notify you of significant changes by updating the
            "Last updated" date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">11. Contact Us</h2>
          <p>If you have questions about our cookie practices:</p>
          <div className="mt-4 rounded bg-slate-50 p-4">
            <p className="font-semibold text-navy">Atlas South Technical Services</p>
            <p>Email: fm@atlassouthes.com</p>
            <p>Phone: 07778 858278</p>
          </div>
        </section>
      </div>
    </div>
  );
}
