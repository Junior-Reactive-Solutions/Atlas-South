import { Seo } from '../../components/seo/Seo.js';
import { PAGE_SEO } from '@atlas-south/shared';

export function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Seo
        {...PAGE_SEO['/legal/privacy']}
      />
      <h1 className="mb-2 text-4xl font-black text-navy">Privacy Policy</h1>
      <p className="mb-8 text-slate-600">Last updated: August 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-slate-700">
        <section>
          <h2 className="text-xl font-bold text-navy">1. Introduction</h2>
          <p>
            Atlas South Technical Services ("we", "us", "our") operates the atlassouthes.com website (the "Service"). This page informs
            you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices
            you have associated with that data.
          </p>
          <p>
            We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you visit our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">2. Data We Collect</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">Contact Information</h3>
              <p>
                When you submit an enquiry or contact form, we collect your name, email address, phone number, and message content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Analytics Data</h3>
              <p>
                <strong>Only if you allow analytics cookies.</strong> If you refuse, none of this is
                collected. What we record is:
              </p>
              <ul className="ml-6 space-y-1">
                <li>• Which pages were viewed</li>
                <li>• Where you arrived from</li>
                <li>• Which buttons were used — for example tapping the phone number</li>
                <li>
                  • A reference that groups one visit together, so five pages read by one person
                  aren't counted as five people. It is created fresh each time you open the site and
                  is gone when you close the tab.
                </li>
              </ul>
              <p className="mt-2">
                We do <strong>not</strong> collect your name, email, IP address, device or browser
                details as part of this, and we do not measure how long you spend on a page.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Your Cookie Choice</h3>
              <p>
                We keep a record of which cookie categories you allowed or refused, and when, so we
                can show your decision was respected if we're ever asked. It holds no address, device
                or browsing information, and is never used to recognise you.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Fault Reports</h3>
              <p>
                When something on the site breaks, we record what went wrong and which page it
                happened on, so we can fix it. This happens whatever your cookie choice, because it's
                how we know our own software is faulty. No identifier is attached, and these records
                are never joined up into a picture of one person's visit.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Payment Information</h3>
              <p>
                <strong>None.</strong> This website does not take payments and has no checkout, so no
                card or billing details are ever collected or passed to a payment processor.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">3. Legal Basis for Processing</h2>
          <p>We process your personal data on the following legal bases under UK GDPR:</p>
          <ul className="ml-6 space-y-2">
            <li>• <strong>Contract:</strong> To provide the services you've requested (e.g., processing an enquiry)</li>
            <li>
              • <strong>Consent:</strong> For website analytics. These run only if you turn them on,
              and you can withdraw that at any time from the Cookie settings link in the footer.
            </li>
            <li>
              • <strong>Legitimate Interests:</strong> To keep the site working and secure — recording
              faults so we can fix them, and keeping a security log of administrator activity.
            </li>
            <li>
              • <strong>Legal Obligation:</strong> To comply with accounting and tax requirements, and
              to keep a record of your cookie choice so we can demonstrate it was respected.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">4. Data Retention</h2>
          <div className="space-y-3 rounded bg-blue-50 p-4">
            <div>
              <p className="font-semibold text-navy">Website Analytics (Page Views & Events)</p>
              <p className="text-sm">Retained for 14 months, then deleted automatically</p>
            </div>
            <div>
              <p className="font-semibold text-navy">Enquiries & Contact Records</p>
              <p className="text-sm">
                Retained for the duration of any resulting business relationship plus 6 years after conclusion (UK commercial recordkeeping
                standard)
              </p>
            </div>
            <div>
              <p className="font-semibold text-navy">Enquiries Without Engagement</p>
              <p className="text-sm">Deleted after 24 months if no business relationship develops</p>
            </div>
            <div>
              <p className="font-semibold text-navy">Admin Login Logs</p>
              <p className="text-sm">Retained for 12 months for security purposes</p>
            </div>
            <div>
              <p className="font-semibold text-navy">Payment Records</p>
              <p className="text-sm">Retained for 6 years (HMRC tax recordkeeping requirement)</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">5. Data Processors</h2>
          <p>
            We use the following third-party services to process your data. All processors have agreed to handle data in accordance with
            UK GDPR:
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">Neon (Database Host)</p>
              <p className="text-sm text-slate-600">Stores enquiry records, analytics data, and admin logs at rest</p>
            </div>
            <div className="rounded border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">Render (Backend Host)</p>
              <p className="text-sm text-slate-600">Processes data in transit through the API</p>
            </div>
            <div className="rounded border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">Vercel (Frontend Host)</p>
              <p className="text-sm text-slate-600">Serves static website content</p>
            </div>
            <div className="rounded border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">Resend (Email Service)</p>
              <p className="text-sm text-slate-600">Sends enquiry confirmation and admin notification emails</p>
            </div>
            <div className="rounded border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">Unsplash (Photography)</p>
              <p className="text-sm text-slate-600">
                Delivers some of the photographs on this site. Your browser fetches the image files
                from them; no information about you is sent.
              </p>
            </div>
            <div className="rounded border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">Google Fonts (Typefaces)</p>
              <p className="text-sm text-slate-600">
                Delivers the fonts the site is set in. Your browser requests the font files from
                Google; this sets no cookies on this site.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4">
            <p className="font-semibold text-navy">Who we do not share data with</p>
            <p className="mt-1 text-sm text-slate-700">
              We use <strong>no advertising networks, no social media trackers, and no third-party
              analytics</strong> — including Google Analytics. The analytics described above go to our
              own systems and nowhere else. We take no card payments through this website, so no
              payment processor receives anything.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">6. Your Rights Under UK GDPR</h2>
          <p>You have the right to:</p>
          <ul className="ml-6 space-y-2">
            <li>• <strong>Access:</strong> Request a copy of the personal data we hold about you</li>
            <li>• <strong>Rectify:</strong> Ask us to correct inaccurate or incomplete data</li>
            <li>• <strong>Erase:</strong> Request deletion of your data ("right to be forgotten")</li>
            <li>• <strong>Restrict:</strong> Ask us to limit how we process your data</li>
            <li>• <strong>Portability:</strong> Receive your data in a portable format</li>
            <li>• <strong>Object:</strong> Oppose processing of your data (including for marketing)</li>
            <li>• <strong>Withdraw Consent:</strong> Withdraw any consent you've given</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, contact us at <strong>start@atlassouthes.com</strong>. We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">7. Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access,
            alteration, disclosure, or destruction. These include encryption in transit (TLS/HTTPS), secure storage, and access controls.
          </p>
          <p>
            However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot
            guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">8. Marketing Communications</h2>
          <p>
            We do not send marketing emails without your consent. If you provide an email in an enquiry form, we will send transactional
            emails only (e.g., confirming receipt of your enquiry). If you wish to receive promotional content, you may opt in via
            email.
          </p>
          <p>All marketing emails include an unsubscribe link so you can opt out at any time.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">9. Cookies</h2>
          <p>
            We use cookies to improve your experience. See our <a href="/legal/cookies" className="text-accent-blue hover:underline">Cookie Policy</a> for
            full details on what cookies we use, how they're used, and how to manage your cookie preferences.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">10. Children's Privacy</h2>
          <p>
            Our website is not directed to children under 13. We do not knowingly collect personal data from children under 13. If we
            become aware that we've collected data from a child under 13, we will take steps to delete it immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">11. International Data Transfers</h2>
          <p>
            Some of our processors are located outside the UK/EU (e.g., Google, Stripe in the US). We ensure appropriate safeguards are
            in place, including EU-US Data Privacy Framework agreements and Standard Contractual Clauses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy
            here with a new "Last updated" date. Continued use of the website constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">13. Data Protection Officer & Complaints</h2>
          <p>
            If you have concerns about how we handle your data, please contact us at <strong>start@atlassouthes.com</strong>. You also have
            the right to lodge a complaint with the Information Commissioner's Office (ICO):
          </p>
          <div className="mt-4 rounded bg-slate-50 p-4">
            <p className="font-semibold text-navy">Information Commissioner's Office (ICO)</p>
            <p className="text-sm">Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF</p>
            <p className="text-sm">Website: www.ico.org.uk</p>
            <p className="text-sm">Phone: 0303 123 1113</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy">14. Contact Us</h2>
          <p>For any questions about this Privacy Policy or our data practices:</p>
          <div className="mt-4 rounded bg-slate-50 p-4">
            <p className="font-semibold text-navy">Atlas South Technical Services</p>
            <p>Email: start@atlassouthes.com</p>
            <p>Phone: 07778 858278</p>
            <p>Address: 4th Floor, Silverstream House, 45 Fitzroy Street, Fitzrovia, London W1T 6EB</p>
          </div>
        </section>
      </div>
    </div>
  );
}
