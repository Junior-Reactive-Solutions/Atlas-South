# Legal Content Plan — Terms of Use, Privacy Policy, Cookie Policy

Client requirement: airtight T&Cs and user agreement, clear on all use of client/user
data and for how long, rights reserved to the service provider, informed by industry
standard and the ABM inspiration site. UK jurisdiction (business is London-based), so
this plan is built on **UK GDPR + Data Protection Act 2018**, not US-style terms.

**Standing note, stated once here rather than caveated on every page of legal copy:**
this plan is a complete, professional-grade drafting framework, and the actual clauses
drafted from it will be thorough and specific — but a live site handling client PII and
payment-adjacent data (the Packages subscriptions) should have the final legal text
reviewed by a solicitor before launch, the same way the audit recommended a real
Companies House number before publishing one. That review is a client decision/cost, not
a build-blocker for drafting — treat the drafted text as launch-ready pending that
sign-off, not as a placeholder.

## 1. What must be named explicitly (this is the "airtight" part)

Every data processor this system actually uses must be named in the Privacy Policy —
vague "third-party services" language is exactly what makes a privacy policy weak. Per
the confirmed stack in `05-ARCHITECTURE-AND-STACK.md`:

| Processor | What it processes | Why it's disclosed |
|---|---|---|
| **Neon** (database host) | All enquiry, analytics, and admin data at rest | Primary data processor |
| **Render** (backend host) | All data in transit through the API | Processor |
| **Vercel** (frontend host) | Static assets, no PII processed directly | Processor (hosting only) |
| **Cloudinary** | Uploaded imagery — no PII expected, but disclosed since it's a third party in the pipeline | Processor |
| **Resend** | Enquiry/contact email addresses, for sending confirmation and admin-notification emails | Processor — this is the one most likely to actually touch a visitor's personal data directly |
| **Sentry** | Error reports, which may incidentally include request metadata | Processor — configured to scrub PII from error payloads where possible |
| **Google (GA4)** | Anonymised/pseudonymised analytics data | Processor, third-country transfer disclosure required (Google's standard contractual clauses) |
| **Stripe/PayPal** (Packages checkout — existing, per the original audit) | Payment card data, handled entirely on their hosted flow | Processor — confirm current provider(s) with client if not already Stripe/PayPal exactly |

## 2. Data retention — stated in months/years, not "as long as necessary"

Directly mirrors the table already committed to in `08-ADMIN-PANEL-SPEC.md` §4 — **these
two documents must never disagree**, since the admin panel is the system actually
enforcing these numbers:

| Data | Retention | Basis |
|---|---|---|
| Page-view / interaction analytics | 14 months | Matches GA4's own default retention window, stated as a deliberate choice rather than an accident |
| Enquiry/contact records | Duration of any resulting business relationship, plus 6 years after its conclusion | UK standard commercial recordkeeping period (aligns with Limitation Act 1980 contract claim periods) |
| Enquiries with no resulting engagement | 24 months from submission, then deleted | Reasonable window to resume a stalled conversation without indefinite retention |
| Admin login/audit logs | 12 months rolling | Security visibility window, per `07-SECURITY.md` |
| Subscription/payment records (Packages) | 6 years | UK tax/accounting recordkeeping requirement (HMRC) |

## 3. Rights-reserved / IP language (client's explicit ask)

The Terms of Use must state plainly, not implicitly:
- All site content, branding, logo, photography selections/treatments, and site design
  are the property of Atlas South Technical Services (or its licensors, e.g. licensed
  stock photography per `03-HERO-SECTION-SPEC.md`'s Unsplash sourcing, which itself
  carries no attribution requirement under the Unsplash License but the *site's own
  arrangement/selection of it* is still the company's work product).
- No reproduction, scraping, or commercial reuse of site content without written
  permission.
- Quotes/pricing shown are indicative and not a binding contract until confirmed in
  writing — standard protective language for a services business, matching how the
  existing Packages pricing is presented.
- A clear limitation-of-liability clause consistent with the £5m public liability
  insurance figure already disclosed on the current site (per
  `13-COMPANY-FACTS-VERIFIED.md`) — the Terms should reference real, verified coverage,
  not invent a figure.

## 4. Data-subject rights (UK GDPR — must be stated, not assumed)

The Privacy Policy explicitly lists, in plain language: right to access, rectify, erase,
restrict processing, data portability, object to processing (incl. marketing), and
withdraw consent — plus a named contact route for exercising them
(`fm@atlassouthes.com`, per `13-COMPANY-FACTS-VERIFIED.md`) and the right to complain to
the ICO if unsatisfied.

## 5. Cookie policy & consent banner

The current site already has a granular necessary/analytics/marketing cookie banner
(audit-confirmed strength) — this is **kept and extended**, not rebuilt from scratch:
- Categories: Strictly Necessary (session, CSRF token) · Analytics (GA4, custom
  event pipeline) · Marketing (none currently used — category present but empty, ready if
  ever needed, not fabricated activity).
- Analytics cookies **only fire after consent** — this is the actual wiring requirement,
  not just a banner that displays without gating the scripts behind it (a common
  real-world compliance failure this project should not repeat).
- "Cookie Settings" reopens the banner at any time — linked from the footer per
  `04-FOOTER-SPEC.md` §2.

## 6. What we borrowed from studying the industry standard (ABM + general UK B2B/FM norms)

- ABM's own site (studied in the original comparative analysis) keeps legal pages short
  and clearly separated by document type (privacy vs. terms vs. cookie) rather than one
  giant combined document — this rebuild follows that pattern (three distinct pages/
  sections rather than one).
- UK facilities-management and trades-sector privacy policies typically name the ICO
  registration number of the data controller — **flagged as another item to get from the
  client alongside the Companies House number in `13-COMPANY-FACTS-VERIFIED.md`**, since
  a business processing enquiry/analytics data at this scale is very likely required to
  be ICO-registered, and the registration number strengthens rather than weakens an
  "airtight" policy.

## 7. Outstanding inputs needed from the client before final publish

Consolidated from `13-COMPANY-FACTS-VERIFIED.md` so this list lives in one place:
1. Companies House registration number (or confirmation the company isn't yet
   incorporated under this exact name).
2. VAT number, if registered.
3. ICO registration number (data controller registration).
4. Confirmation of the exact payment processor(s) live on the Packages checkout today.
5. Sign-off that the drafted clauses accurately reflect actual business practice (e.g.
   the exact retention periods above are this project's professional recommendation, not
   a fact already confirmed by the client — they need an explicit yes).

Until items 1–3 are supplied, the published pages use the same convention as
`04-FOOTER-SPEC.md` §4: the field is simply omitted from the public-facing page rather
than shipped as a visible "TBC," while the internal doc here keeps tracking it as open.
