# Atlas South Technical Services — Website User Manual

_Last updated: 3 September 2026_

This is a complete reference for the Atlas South Technical Services website
(`atlassouthes.com`) — every page a visitor can see, every screen in the admin panel that
runs it, how the site is hosted, and how its email works. It's written for whoever manages
the site day-to-day, not developers, though nothing here requires technical knowledge to
follow.

**How to use this document:**
- **[Public Website Pages](#public-website-pages)** — what's on the site, and which parts
  of it you can edit yourself.
- **[Admin Panel Guide](#admin-panel-guide)** — every screen behind the login, what each
  one does, and what to expect when you use it.
- **[How the Website Is Hosted](#how-the-website-is-hosted)** — the technical services
  behind the scenes, in plain terms, and their one known limitation.
- **[The Email Accounts](#the-email-accounts)** — what each mailbox is for and how
  automated site emails actually get sent.
- **[Troubleshooting & Common Mistakes](#troubleshooting--common-mistakes)** — situations
  that look broken but aren't, and how to recover from genuine mistakes.

---

## Public Website Pages

This section covers every page a visitor to the public website can reach — it does not
cover the staff-only admin panel (that's documented separately). For each page or group of
pages, you'll find: the web address (URL), what's on it, whether you can edit its wording
yourself from the admin panel, and anything unusual about how it behaves.

A general note on editing: most pages that look like a normal informational page (services,
industries, areas, homepage, About, Vision & Mission, Careers, Case Studies, Insights) pull
their wording from a database and can be edited by a staff member from **Admin → Content**,
without needing a developer. A smaller number of pages (Contact, the legal pages, the Thank
You page, the 404 page) have their text written directly into the website's code — changing
these requires a developer to edit and redeploy the site. Where a page is editable, the
content shown also has a "fallback" copy stored in the code itself, so if the database is
ever briefly unavailable, visitors still see full content instead of a blank or broken page.

### Homepage

| URL | Editable? |
|---|---|
| `/` | Editable via Content admin (Home Page) |

Contains: the hero banner (headline, subheading, and the two main call-to-action buttons),
a scrolling statistics band, the mission statement, an area-coverage map, an "Industries we
serve" grid, "Hard Services" and "Soft Services" grids, a "Why choose Atlas South" section,
a careers teaser, and the enquiry ("Get a Free Quote") form.

Notable behaviour: the services/industries grids only show items that are (a) not marked as
"coming soon" placeholders and (b) not hidden by staff in the admin panel's Visibility
settings — so a nav item can exist as a working page but still be deliberately kept off the
homepage and menus.

### Company Pages

| Page | URL | Editable? |
|---|---|---|
| About Us | `/company` | Editable via Content admin (shares the "Company" content record with Vision & Mission) |
| Vision & Mission | `/company/vision-mission` | Editable via Content admin (same "Company" content record as About Us) |
| Contact Us | `/company/contact` | Static/code-only |
| Join Us (Careers listing) | `/company/join-us` | Editable via Content admin (Careers) |
| Individual role pages | `/company/join-us/:role-name` | Editable via Content admin (roles are part of the Careers content record) |

**About Us** contains the company tagline, intro paragraph, a company history timeline, the
mission and vision statements, and company values. Because About Us and Vision & Mission
share the same underlying content record, editing one field (e.g. the mission statement) in
the admin panel updates it everywhere it appears, including on the homepage.

**Contact Us** shows phone, WhatsApp, email and address contact tiles, an area-coverage map,
and the same enquiry form used elsewhere on the site. Every phone number, email address and
postal address on this page (and site-wide) is pulled from one verified, hand-checked
source in the code, so it cannot show conflicting contact details in different places — but
it means a developer must update the code if any of those details change.

**Join Us / Careers** shows an intro paragraph, a "Why work with us" benefits grid, and a
list of currently open roles. If there are no open roles, it shows "No positions are
currently open. Please check back soon!" rather than inventing one. Each open role links to
its own full page with the full job description and an application form.

**Individual role pages** show the job description in full and a serious, full-page
application form (see "Job Application Form" below for what happens on submit).

### Hard Services

All built and live, with full page content (overview, features, process, FAQs, etc.),
editable via **Content admin → Services**.

| Service | URL |
|---|---|
| Electricals | `/hard-services/electricals` |
| Plumbing | `/hard-services/plumbing` |
| Reactive Maintenance | `/hard-services/reactive-maintenance` |

*(Note: "Fire & Safety" was removed from this section at the client's request in August
2026 and has no replacement page.)*

### Soft Services

All built and live, editable via **Content admin → Services**.

| Service | URL |
|---|---|
| Facilities Management | `/soft-services/facilities-management` |
| Security Services | `/soft-services/security` |
| Commercial Cleaning | `/soft-services/commercial-cleaning` |
| Catering | `/soft-services/catering` |
| Aviation Services | `/soft-services/aviation` |
| Concierge | `/soft-services/concierge` |
| Parking Lot Management | `/soft-services/parking-lot-management` |
| Rail Facilities | `/soft-services/rail-facilities` |
| Interior Painting | `/soft-services/interior-painting` |

One technical note worth knowing: unlike every other service/industry/area page, **Rail
Facilities** has no built-in backup copy in the website's code — its content lives only in
the database. If the database is ever unreachable, this one page (and only this one) would
show a loading/error state instead of falling back to cached text the way the others do.
Worth flagging to your developer if this page is business-critical.

*(Note: "Waste & Recycling" was removed at the client's request in August 2026; Parking Lot
Management took its place in this section.)*

### Industries

All built and live, editable via **Content admin → Industries**.

| Industry | URL |
|---|---|
| Government & Public Sector | `/industries/government-public-sector` |
| Corporate | `/industries/corporate` |
| Healthcare | `/industries/healthcare` |
| Oil & Gas | `/industries/oil-gas` |
| Retail | `/industries/retail` |
| Manufacturing | `/industries/manufacturing` |
| Education & Learning Institutions | `/industries/education` |
| Data Centres | `/industries/data-centres` |
| Venues | `/industries/venues` |

### Service Areas

All built and live, editable via **Content admin → Service Areas**.

| Area | URL |
|---|---|
| Central London | `/areas/central-london` |
| South East London | `/areas/south-east-london` |
| North London | `/areas/north-london` |
| East London | `/areas/east-london` |
| West London | `/areas/west-london` |
| Surrey & Kent | `/areas/surrey-kent` |

### Case Studies

| Page | URL | Editable? |
|---|---|---|
| Case Studies library | `/case-studies` | Editable via Content admin (Case Studies) |
| Individual case study | `/case-studies/:slug` | Editable via Content admin (Case Studies) |

**Currently empty by design, not by accident.** There are no case studies published on the
site right now. This is a deliberate decision, not an oversight: a case study names a real
client and often quotes them, so publishing an invented or unverified one would be a false
claim about a real business. The library page is fully built and handles the empty state
honestly — it shows a message that write-ups are being prepared and offers a link to
contact the team directly, rather than showing fake "coming soon" filler or invented
example content. As soon as staff publish a real, approved case study through the admin
panel, it will appear here automatically.

### Insights / Articles

| Page | URL | Editable? |
|---|---|---|
| Insights library | `/insights` | Editable via Content admin (Insights / articles) |
| Individual article | `/insights/:slug` | Editable via Content admin (Insights / articles) |

Like Case Studies, this section shipped with **no articles written into the code as backup
content** — for the same reason (an article carries the company's name and is read as its
professional position, so it isn't something to fill with invented text). Unlike the Case
Studies page, however, the Insights library fetches its list live from the site's article
system every time it loads — so any real article published through the admin panel shows up
here immediately, even without a code-level backup copy. The first article — *"How often do
commercial building compliance checks need doing?"* — is live at
`/insights/commercial-building-compliance-check-frequencies`.

### Legal Pages

| Page | URL | Editable? |
|---|---|---|
| Privacy Policy | `/legal/privacy` | Static/code-only |
| Terms of Use | `/legal/terms` | Static/code-only |
| Cookie Policy | `/legal/cookies` | Static/code-only |

These three pages have their full text written directly into the site's code rather than
pulled from the database, so changing wording on any of them needs a developer. The Cookie
Policy page also includes a button that reopens the cookie-consent preferences banner, so a
returning visitor can change their cookie choices at any time.

### Thank You Page

| URL | Editable? |
|---|---|
| `/thank-you` | Static/code-only |

Shown after someone successfully submits the enquiry ("Get a Free Quote") form. Confirms the
enquiry was received, sets an expectation of a reply within 2 business hours, and offers
phone/WhatsApp as a fast-track for urgent jobs. This page is deliberately excluded from
search engines (it's a "thank you" confirmation page, not something that should show up in
Google), and it doesn't use the normal site header/footer — it's a clean, standalone
confirmation screen.

### 404 (Page Not Found)

| URL | Editable? |
|---|---|
| Any unmatched web address | Static/code-only |

Shown when someone visits a URL that doesn't exist on the site. Offers a link back to the
Home page and to Contact Us, and is kept out of search engine results.

---

### A note on "placeholder" navigation items

The site's menu system supports flagging a section as a **placeholder**, which means: the
page and its web address genuinely work if someone types the URL directly, but the link is
deliberately hidden from the main menu and footer so visitors aren't sent to a section with
nothing behind it yet.

- **Case Studies** is currently flagged as a placeholder. It does **not** appear in the
  header menu or footer. It stays hidden until a real, approved case study is published —
  at that point, staff (or a developer) need to remove the placeholder flag so it becomes
  visible sitewide.
- **Insights** was flagged as a placeholder but has since had that flag **removed** (as of
  3 September 2026, once the first article was published), so it now appears in the header
  and footer menus.

In short: a placeholder flag controls whether something is *advertised* in the menus, not
whether the page technically exists — a determined visitor (or a search engine that
discovers the URL some other way) can still reach a placeholder page directly.

---

### Enquiry / "Get a Free Quote" Form

This form appears on the homepage, the Contact page, service pages, industry pages, area
pages, case study pages, and article pages — it's the site's main way of capturing new
business enquiries.

**On submit:**
1. The visitor's details (name, email, phone, which service they're interested in, and
   their message) are sent to the server and saved as a new enquiry.
2. If successful, the visitor is taken to the dedicated **Thank You page** (`/thank-you`),
   which also fires a "conversion" tracking event for analytics.
3. If something is missing or invalid, the relevant field is highlighted with an error
   message and nothing is submitted until it's corrected.
4. There's an invisible "honeypot" field hidden from real visitors — if it gets filled in
   (which only an automated bot would do), the submission is silently accepted on the
   surface but discarded on the server, so bots don't realise they've been blocked.

Submitted enquiries are stored and visible to staff in the admin panel (Enquiries), not just
emailed — so even if the notification email fails, the enquiry itself is never lost.

### Job Application Form

This appears on each individual open-role page (`/company/join-us/:role-name`). It asks for
name, email, phone, an optional message, and file uploads for a CV and (optionally) a
separate cover letter — both restricted to PDF files up to 5MB.

**On submit:**
1. The files and details are sent to the server as a file upload.
2. **Important: CVs and cover letters are emailed to the team, not stored on the server.**
   They are held only in memory for the moment it takes to send the notification email, then
   discarded — nothing is written to disk or kept in a database. This was a deliberate
   decision requested by the client (confirmed 2 September 2026) specifically so that
   candidate documents aren't retained in storage. One practical consequence: the
   notification email is the **only** copy of a candidate's CV — if that email were ever
   lost, there is no backup copy to fall back on.
3. On success, the visitor sees a confirmation message on the same page ("Application
   submitted successfully — we'll be in touch soon"), rather than being redirected
   elsewhere.
4. If the upload fails or a file is invalid (wrong format, too large), the visitor sees an
   inline error and can retry.

## Admin Panel Guide

The admin panel is the private control centre for the Atlas South Technical Services
website. It lives at `/admin` and is only accessible to people with a login. Everything in
this section covers what you can see and do there.

### Login (`/admin/login`)

Sign in with your email and password. If two-factor authentication (2FA) is switched on for
your account, you'll get a second screen asking for the 6-digit code from your authenticator
app before you're let in — your password alone isn't enough at that point.

**First login / forced password change.** If your account is flagged as needing a password
change (for example, you were just given a starter account with a temporary password), the
system will not let you use the rest of the admin panel until you set a new one. You'll be
redirected straight to the password change screen on Settings, and every other page and
every action will be blocked with a "password change required" message until you do this —
there's no way to skip it or come back to it later.

**Wrong password.** Entering the wrong password shows a generic "Invalid credentials"
message. For security reasons, the system deliberately doesn't tell you whether the email
or the password was wrong.

**Account lockout.** After **10 failed password attempts**, the account is locked for **1
hour**. During that time, even the correct password will be refused with an "Account is
locked. Try again later" message. The lock clears itself automatically once the hour has
passed — there's nothing to reset manually, though a failed attempt is also recorded in the
Security log (see below).

Once you're in, your session is kept alive automatically in the background (via a secure,
invisible cookie) so you generally won't be asked to log in again every time you reopen the
browser, as long as you're on the same device and haven't logged out.

### Dashboard (`/admin/dashboard`)

The landing page after login. It gives you a quick, at-a-glance summary:

- Number of enquiries received this week and this month
- Your enquiry-to-win conversion rate
- Your top-performing pages by number of views
- Quick-access shortcut tiles to jump straight to Enquiries, Job Applications, Analytics,
  Chat Leads, and Settings

Nothing here is editable — it's a read-only overview to help you start your day.

### Enquiries (`/admin/enquiries`)

This is your sales pipeline for enquiries submitted through the website's contact/quote
forms, shown as a Kanban-style board with five columns: **New → Contacted → Quoted → Won →
Lost**.

**Moving a card along the pipeline.** Each enquiry card has a "Move Forward" button that
pushes it to the next stage in order (New → Contacted → Quoted → Won). There's also a
"Lost" button on any card that isn't already Lost, letting you mark it as lost from any
stage. Once an enquiry is Won or Lost, it stays in that column — there's no button to move
it backwards, so treat those as end states. Moving a card takes effect immediately; you
don't need to save or publish anything.

**Viewing full details.** Click the eye icon or the message text on a card to open a detail
panel showing the enquirer's full name, email, phone, the service they asked about, which
page they submitted the form from, the full message, and the current status.

**Replying.** Inside that detail panel is a Reply box. Type your subject and message and
hit "Send reply" — this sends a proper branded email (using Atlas South's email template,
not a plain text email) directly from the system to the enquirer. It is not a "open your
email app" link; the message is actually sent from here, and a record of the reply is kept
in the Security log.

**Internal notes.** There's also a private Notes field in the detail panel, only visible to
admin staff (never shown to the customer), for things like "called, left voicemail" or
"wants a site visit Tuesday." Type your note and click "Save notes."

**Deleting an enquiry.** At the bottom of the detail panel is "Delete this enquiry
permanently." This is a hard, permanent delete — the enquiry (including the person's name,
email and phone) is completely removed from the database and cannot be recovered. You'll be
asked to confirm before it happens. This exists mainly to satisfy "right to be forgotten"
(GDPR) requests, so only use it when someone has actually asked to be erased, or you're
cleaning up test/spam submissions — not as a way to tidy up your pipeline, since Won/Lost
already serves that purpose.

### Applications (`/admin/applications`)

This works the same way as Enquiries, but for people who've applied for a job through the
Careers section — a simple list (not a Kanban board) sorted with the newest application
first.

Clicking an application opens a detail panel with the applicant's name, email, phone, the
role they applied for, and reply/reply-and-delete options, exactly as with Enquiries.

**Important — CVs and cover letters are never stored on the server.** When someone submits a
job application, their CV and cover letter files are sent as email attachments straight to
`careers@atlassouthes.com` at the moment they apply. The admin panel only ever stores the
applicant's contact details and the filenames of what they sent — there is no "Download CV"
button, because there is no file sitting on the server to download. If you need to open
someone's CV, you need to search the careers mailbox for their name to find the original
email.

This also matters for deletion: **deleting an application record here does not delete the
corresponding email or its attachments.** If someone asks you to erase their data
completely, deleting the row here is only half the job — you also need to find and delete
the email in the careers inbox.

### Analytics (`/admin/analytics`)

A dashboard of website traffic, viewable over the last 7, 30, or 90 days. It shows:

- Total page views and unique visitors
- "Interactions" — button clicks, form submissions and similar on-page actions
- Average time spent on the site per session
- Your top pages by views, with bounce rate for each
- A traffic trend chart over the selected period
- A breakdown of visitor devices (desktop/mobile/tablet)

This data is anonymous — it tracks pages and sessions, not identifiable people, and is
automatically kept for 14 months in line with GDPR before it ages out. There's nothing to
configure here; it's purely informational.

### Content (`/admin/content`)

This is where you edit the words and images on the public website. Pages are grouped by
type: **Home Page, Company, Careers, Packages, Services, Industries, Service Areas, Case
Studies,** and **Insights (articles)**.

Each page shows a status badge — **Live** (green) if it's published, or **Draft** (amber) if
it has unpublished changes waiting. Click any page to open its editor (see Content Edit
below).

**Creating a new article.** Most page types already exist as fixed pages on the site (you
can't add a new "Service" page from here, for instance) — the one exception is **Insights
articles**, which you create from scratch. Fill in a Title and a "Web address" (the URL
slug, e.g. `commercial-deep-cleaning-frequency`), then click "Create draft article." Two
important points:
- The web address becomes the article's **permanent URL** (`/insights/<address>`) — once
  set, it can't be changed later without breaking the link, so choose it carefully before
  publishing.
- Creating the article only produces a draft. Nothing appears on the live site until you
  open it, write the content, and click Publish.

**Deleting content.** Only **articles** can be deleted from this screen — every other page
type (Home, Company, Careers, Packages, Services, Industries, Service Areas, Case Studies)
is a permanent part of the site's structure and doesn't have a delete option, because the
site's navigation and routing expect those pages to always exist. For an article, click
"Delete article" underneath it; you'll be asked to confirm, and this cannot be undone
(including for already-published, publicly indexed articles, so use it deliberately).

### Content Edit (`/admin/content/:slug`)

This is the actual editing screen for a single page, reached by clicking any page in the
Content list.

**Draft vs. Published — the single most important thing to understand:** everything you
type and everything you rearrange here is saved as a **draft**. Clicking "Save draft"
stores your changes but does **not** change what visitors see on the live site. The live
page keeps showing the last-published version until you specifically click **Publish**.
Only Publish makes your edits go live immediately. There's a "View live page" link at the
top of the screen if you want to check what's currently public while you work.

**Discard draft changes.** If you've made edits you don't want to keep, click "Discard
draft changes" (only shown once a page has been published at least once) to throw away
everything since the last publish and revert your working copy back to what's currently
live. You'll be asked to confirm, since this can't be undone.

**Fields differ by page type.** The form adapts to what kind of page you're editing:
- **Most pages** (Services, Industries, Areas, Company, Careers, Case Studies, Articles)
  share a Title, Hero description, and an "Overview" text block that supports simple
  Markdown formatting (headings, bullet lists, bold/italic, and — as of 3 September 2026 —
  `[link text](/some-page)` style links to other pages on the site).
- **Industry pages** add Challenges, Our Approach, and a reorderable list of Service
  Highlights.
- **Area pages** add Response Time and Coverage text.
- **Service pages** add reorderable Features and FAQs lists.
- **Home page** has its own set (three headline lines, subcopy, and CTA button labels)
  instead of the common fields.
- **Company page** adds a Tagline, Mission Statement, and reorderable lists for Timeline,
  Values, Team members, and Certifications.
- **Case Study pages** ask for Client name, Location, Timeline, linked Industry, a listing
  summary, and Markdown sections for Challenge/Approach/Outcome, plus a Results list
  (label/value pairs) and a Photographs list — the labels deliberately remind you these must
  be real facts and real photos of the actual job, not stock content, since a case study
  makes claims about a named client.
- **Article pages** ask for Category, listing summary, Author name and role (leave blank
  rather than inventing a byline), publish and last-revised dates, read time, and the main
  Markdown article body.
- **Careers page** has an Intro, a reorderable Benefits list, a Right to Work note, and —
  most importantly — a reorderable **Open Roles** list. Each role has its own URL slug,
  title, department, reports-to, location, job type, start availability, a listing summary,
  role overview, responsibilities, requirements, working pattern, and "what we offer" — all
  editable here. Note there is deliberately no pay-range field; pay is agreed per candidate
  rather than published.

Reorderable lists (Features, FAQs, Team, Open Roles, etc.) let you drag rows up and down
using the handle icon, add new rows with "Add," and remove rows with the trash icon — again,
none of this affects the live site until you Publish.

### Visibility (`/admin/visibility`)

Lets you temporarily hide a page from the public site without deleting its content —
useful for services, industries, or areas you're not currently offering. Covers Hard
Services, Soft Services, Industries, and Service Areas (core pages like Home, Company,
Contact and legal pages can't be hidden here, by design).

Each row shows whether a page is **Visible** or **Hidden**, with a toggle button. Hiding a
page is enforced on the server, not just cosmetically: a hidden page disappears from the
site's navigation menus **and** returns a "page not found" if someone still has the direct
link. Nothing is deleted — switching it back to "Show" restores it exactly as it was,
instantly.

### Settings (`/admin/settings`)

Your personal account settings, split into three parts:

**Change Password.** Enter your current password plus a new one (minimum 12 characters)
twice to confirm. Once changed, any other device or browser session that was logged in will
be signed out automatically the next time it tries to do anything — this is a deliberate
security measure so a stolen password stops working the moment you change it.

**Change Login Email.** Change the email address you use to sign in. You must enter your
current password to confirm the change (since this affects who can log in), but doing so
does **not** log you out of your current session — you'll simply need to use the new
address the next time you sign in from scratch.

**Two-Factor Authentication (2FA).**
- *To enable:* click "Enable Two-Factor Authentication." You'll be shown a QR code — scan
  it with an authenticator app (Google Authenticator, Authy, 1Password, etc.), then enter
  the 6-digit code the app generates to confirm the setup actually worked. Only once you've
  entered a valid code is 2FA actually turned on. From then on, every login asks for this
  code as well as your password.
- *To disable:* click "Disable Two-Factor Authentication," then confirm with both your
  current password **and** a valid code from your authenticator app — both are required, so
  simply having lost access to your phone won't let you switch it off without also knowing
  the password.

### Leads (`/admin/leads`)

Chat Leads are a **separate list from Enquiries** — these are contacts captured
automatically by the website's chatbot widget when a visitor engages with it and shares
their details (name, company, phone/email, services they're interested in, and any
message), rather than someone filling in the main contact/quote form. They're stored and
shown completely separately from the Enquiries pipeline and don't appear on the Kanban
board.

The list shows each lead's contact info, preferred contact method (highlighted so you know
whether to call or email first), services of interest, and message. Click a row (or the eye
icon) to see full details in a side panel. The trash icon deletes a lead permanently after
a confirmation prompt — same permanent, unrecoverable delete as Enquiries.

There's also an "Export CSV" button that downloads all current leads as a spreadsheet file
to your computer, useful for importing into a CRM or for record-keeping outside the panel.

### Security (`/admin/security`)

A read-only audit trail of admin account activity — logins (successful and failed),
password changes, 2FA enabled/disabled, enquiry status changes, notes saved, and replies
sent. It exists so you can see exactly who did what and when without having to dig through
server logs.

At the top, summary counts show successful logins, failed login attempts, and account
locks. The main table lists each event with its type, which admin performed it, the IP
address it came from, and the exact time. Logs are retained for 12 months. There's a manual
refresh button, but the page also loads the latest data automatically each time you open it.
If you ever see an unexpected run of failed logins or a login from an unfamiliar time, this
is the place to check first.

### System Logs (`/admin/system-logs`)

This page covers two separate things:

**Cookie consent record.** Evidence of which cookie/tracking choices website visitors made
and when, kept to satisfy GDPR's requirement that a business be able to prove consent was
given. It deliberately does **not** identify who the visitor was — only that "a decision of
this shape was made at this time," which is enough for compliance without turning the log
itself into a privacy risk.

**Errors & system events.** A log of technical problems on the site — API errors, failed
background jobs, and so on — filterable by severity (All / Error / Warning / Info). Each
entry can be expanded for more detail (a technical message and, where available, extra
context).

**Why this matters for you day-to-day:** if a customer says "I never got a reply" or "I
filled in the form but heard nothing back," this is where to check. Every time the system
tries and fails to send an email (a reply, a notification, etc.) it logs an
`email_send_failed` event here with the reason the send failed — so instead of guessing,
you can look here to confirm whether an email delivery genuinely failed, and use the error
message to diagnose or report the problem. (For privacy reasons the failed-email log
doesn't record who the email was going to — only the subject line — so you may need to
cross-reference the time with the Enquiries or Applications list to work out which one it
was.)

## How the Website Is Hosted

The site is split across three separate services. This isn't unusual — it's the standard
way a modern website is built — but it matters when something goes wrong, because "the
website is down" can mean any one of three different things.

| Piece | Where it lives | What it does |
|---|---|---|
| **The website itself** (everything you see as a visitor) | Vercel | Serves the pages, images and the visual design |
| **The engine behind it** (forms, admin login, content) | Render | Handles form submissions, the admin panel's logic, and talks to the database |
| **The database** (all your content, enquiries, applications) | Neon (Postgres) | Stores everything — page content, submitted enquiries, job applications, admin accounts |
| **Outgoing email** | Mailgun | Sends the automated emails (enquiry notifications, confirmations, admin replies) |
| **Domain, DNS, and mailboxes** | Your hosting control panel (Stratum) | Owns `atlassouthes.com`, points it at the right places, and runs your actual email inboxes |

### Why three different providers?

Each does one job well rather than one provider doing all three adequately:

- **Vercel** is built specifically for fast, reliable delivery of the website's pages —
  when someone visits `atlassouthes.com`, Vercel is what actually hands them the page.
- **Render** runs the background program (the "API") that does the actual work: saving a
  submitted enquiry, checking an admin password, fetching page content from the database.
- **Neon** is the database itself — a separate, dedicated service for reliably storing
  data, rather than a file sitting on a server that could be lost.

Both Vercel and Render deploy automatically from the same source code (on GitHub) — when a
change is made to the code and approved, it goes live on its own within a few minutes,
without anyone needing to manually upload files.

### The free-tier limitation worth knowing about

The Render service (the "engine") is on Render's **free plan**. Two consequences:

1. **It can go to sleep.** If nobody has visited the site or submitted a form for a while,
   Render pauses the service to save resources. The *next* visitor to trigger it (loading
   a page, submitting a form) can see a delay of up to 50 seconds while it wakes back up.
   This is not a fault — it's how the free plan behaves, and only affects the very first
   request after a quiet period.
2. **It cannot send email itself.** Render's free plan blocks the traditional way of
   sending email (a protocol called SMTP) entirely, for every free account, as an
   anti-abuse measure. This is why outgoing email goes through **Mailgun** instead (see
   below) — Mailgun sends email over a method Render's free plan does allow.

If the 50-second wake-up delay becomes a real problem (e.g. a busy period), the fix is
upgrading Render to a paid plan (from around $7/month), which keeps the service always on
and also lifts the email restriction — though switching back to direct email at that point
isn't necessary, since Mailgun works regardless of plan.

### The domain

`atlassouthes.com` and `www.atlassouthes.com` both point at the live Vercel-hosted site
(visiting the plain `atlassouthes.com` automatically redirects to `www.`). This is
controlled by DNS records in the hosting control panel — specifically two records were
pointed at Vercel during the cutover, while everything related to **email stayed
completely untouched**, so switching the website over never put mail delivery at risk.

---

## The Email Accounts

Five mailboxes exist on the hosting control panel, under **Email Accounts**:

| Mailbox | Purpose |
|---|---|
| **start@atlassouthes.com** | Where every new **enquiry** (quote request) notification lands, and the address the admin panel uses as its login |
| **careers@atlassouthes.com** | Where every new **job application** lands — **including the CV and cover letter as email attachments** (see below, this is important) |
| **noreply@atlassouthes.com** | The "From" address on every automated email the site sends (enquiry confirmations, application confirmations, admin replies) — it's a real mailbox, but it exists as a sending identity, not one anyone needs to check |
| **fm@atlassouthes.com** | A general mailbox, not currently wired into any website automation |
| **a.rehan@atlassouthes.com** | A general mailbox, not currently wired into any website automation |

### How outgoing email actually works

This is worth understanding because it's slightly different from a normal mailbox:

The website's automated emails (an enquiry notification, an application notification, a
confirmation to a customer, a reply an admin sends from the panel) are **not** sent by
logging into `noreply@atlassouthes.com` and using it like a normal email client. They are
sent through **Mailgun**, a dedicated email-sending service, using a technical sub-address
(`mg.atlassouthes.com`) set up specifically for this.

Why: as explained above, the website's engine (Render, free plan) cannot send email the
traditional way at all. Mailgun sends over a different method that isn't blocked.

The email still **looks** like it came from `noreply@atlassouthes.com` — that's what
appears in the "From" field a recipient sees — because the technical sending
sub-address is configured to be allowed to send *on behalf of* the atlassouthes.com domain,
in a way mail providers (Gmail, Outlook) recognise and trust. Nothing about this weakens
security or makes the emails less legitimate; it's a standard pattern many businesses use.

### CVs and cover letters are never stored on the server

By explicit instruction, uploaded CVs and cover letters are **immediately emailed to
`careers@atlassouthes.com` as attachments and never saved anywhere else** — not on the
website's server, not in the database. The application record visible in the admin panel
(`/admin/applications`) holds the candidate's name, contact details and the role they
applied for, but **the only copy of the actual documents is that email**.

Practically, this means:
- If you delete an application record in the admin panel, the candidate's documents are
  **not** deleted — they're still in the `careers@` inbox until someone removes them there.
- If the `careers@` inbox is ever cleared without checking it first, any CV not yet
  downloaded/saved elsewhere is genuinely gone — there is no second copy.

### Checking whether email is actually working

The most reliable way to check whether the website's automated emails are being delivered
is **not** to look in `noreply@`'s inbox (it's a sending identity, not something anyone
checks) — it's:
1. **`/admin/system-logs`** in the admin panel — every failed send is logged here with a
   plain-English reason (see the Admin Panel Guide, System Logs section).
2. Checking `start@` (for enquiries) or `careers@` (for applications) directly for the
   actual notification.

## Troubleshooting & Common Mistakes

This section covers situations that look like something is broken, but are actually
expected behaviour with a simple explanation — plus the handful of mistakes that are easy
to make in the admin panel and how to recover from them.

### "I edited a page but nothing changed on the live site"

**Cause:** you saved a draft but never clicked **Publish**. This is the single most common
point of confusion in the admin panel, and it's deliberate — it means a half-finished edit
can never accidentally go live.

**Fix:** open the page in Content Edit and click **Publish**. If you want to check what's
currently live before doing that, use the "View live page" link at the top of the editor.

### "I made changes I didn't mean to make and want to undo them"

**Cause:** normal editing.

**Fix:** if you **haven't published yet**, click **Discard draft changes** — this reverts
your working copy back to whatever is currently live, undoing everything since the last
publish. If you **have already published** the unwanted change, there is no one-click undo
— you'll need to manually re-edit the fields back to what they were and publish again. Take
a screenshot or copy the text somewhere before making a large edit if you're not confident
about reverting it.

### "I created an article with the wrong web address (URL)"

**Cause:** the "Web address" field becomes the article's permanent URL the moment it's
created, and there's no rename option.

**Fix:** delete the article from `/admin/content` and create a new one with the correct
address. If the wrong-address version was already published and shared anywhere (social
media, a link in an email), that link will now 404 — there's no way to redirect it
automatically, so double-check the address before publishing anything that's already been
shared externally.

### "The homepage doesn't show a service/industry/area I know exists"

**Cause:** almost always one of two things — either it's flagged as **hidden** in
`/admin/visibility`, or (for Case Studies specifically) it's a **placeholder** section not
yet linked from the main menus (see "A note on placeholder navigation items" above).

**Fix:** check Visibility first and toggle it back to "Show" if it's hidden. If it's Case
Studies, remember that section only appears in menus once the placeholder flag is removed
by a developer, which happens once real content exists.

### "A customer says they submitted the form but I never got anything"

**Cause:** usually one of:
1. The email genuinely failed to send (check `/admin/system-logs` for an
   `email_send_failed` entry around the time they say they submitted).
2. It did send, but landed in a spam/junk folder on the receiving mailbox.
3. It succeeded but you haven't checked the right place — remember enquiries always land
   in the admin panel's **Enquiries** list regardless of whether the notification email
   itself worked, so check there directly rather than only checking your inbox.

**Fix:** check the Enquiries or Applications list first — if the submission is there, it
was received regardless of what happened to the notification email. Then check System
Logs for a delivery failure to explain why no email arrived.

### "I can't log in — 'Invalid credentials'"

**Cause:** either the email or password is wrong. The system deliberately doesn't say
which, so an attacker guessing at your account can't learn anything from the error.

**Fix:** double-check for typos, especially trailing spaces or autocomplete filling in an
old address. If you've recently changed your login email (Settings → Change Login Email),
remember to use the **new** address, not the old one.

### "I can't log in — 'Account is locked'"

**Cause:** 10 wrong password attempts in a row triggers an automatic 1-hour lock, as an
anti-guessing protection. This can happen innocently — a saved-but-outdated password in a
browser retrying automatically, for instance.

**Fix:** wait for the hour to pass; there's no manual unlock. If this happens repeatedly
without you actually mistyping the password, check `/admin/security` for the failed-login
entries — a sudden burst of failed attempts from an unfamiliar time or pattern is worth
investigating as a possible break-in attempt rather than assuming it's just a typo.

### "I lost access to my authenticator app and can't get past the 2FA prompt"

**Cause:** the phone/device with the authenticator app (Google Authenticator, Authy, etc.)
is lost, reset, or the app was uninstalled.

**Fix:** there's no self-service recovery from the login screen by design — 2FA exists
specifically so a password alone isn't enough to get in. Disabling 2FA requires the current
password **and** a valid code, so if both are lost, whoever administers the site's hosting
will need to reset the account at the database level. Prevent this by keeping a backup —
most authenticator apps support cloud backup/sync, or you can note down the setup QR/secret
somewhere secure when 2FA is first enabled.

### "The site feels slow / the first form submission of the day is really slow"

**Cause:** most likely the Render free-plan "sleep" behaviour described in the Hosting
section — the background engine pauses after a quiet period and takes up to ~50 seconds to
wake up on the next request.

**Fix:** nothing to fix — it's expected on the free plan and only affects the very first
request after a gap. If this becomes a genuine problem (e.g. during a busy launch period),
upgrading the Render plan removes it entirely.

### "A job applicant says they never heard back, or I can't find their CV"

**Cause:** remember CVs are emailed to `careers@atlassouthes.com` and never stored on the
server — there is no "download CV" button anywhere in the admin panel.

**Fix:** search the `careers@` mailbox directly for the applicant's name or the role they
applied for. If the application record still exists in `/admin/applications`, it'll confirm
exactly when they applied and under what name/email, which helps narrow the mailbox search.

### "I deleted an enquiry/application/lead by mistake"

**Cause:** the delete buttons in Enquiries, Applications, and Leads are all **permanent** —
there is no recycle bin or undo.

**Fix:** there genuinely isn't one — this is intentional, since these deletes exist mainly
to honour data-erasure requests, where "permanent" is the whole point. Always read the
confirmation prompt carefully before confirming a delete, and note that deleting an
application record never deletes the corresponding CV email in `careers@` — so a mistaken
delete there is at least partially recoverable by checking the mailbox.

### "Two people are editing the same page at once"

**Cause:** the admin panel doesn't currently show "someone else is editing this" warnings.

**Fix:** whoever clicks **Publish** last wins — their version becomes what's live, and the
other person's unpublished draft changes may be silently overwritten. If more than one
person edits content, a simple practice of agreeing who's working on what avoids this.
