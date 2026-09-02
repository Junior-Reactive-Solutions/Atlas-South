# Domain Cutover Runbook — atlassouthes.com

Moving the live site from the legacy Apache host to the Vercel/Render rebuild, without
interrupting email.

**Written 2026-09-02.** Supersedes the DNS steps in README.md, which are summarised here in
execution order.

---

## 0. The one fact that makes this safe

**Email is hosted on the same server as the old website, but on different DNS records.**

| Record | Points at | Used for |
|---|---|---|
| `A` @ → `165.140.156.35` | old host | **the website** |
| `A` mail → `165.140.156.35` | old host | **the mail server** |
| `MX` @ → `mail.atlassouthes.com.` | via the `mail` A record | **mail routing** |

Because `MX` resolves through the separate `mail` A record, changing the apex `A` moves web
traffic only. Mail continues routing to the same server, unaffected.

**Do not touch:** `MX`, `A mail`, `TXT default._domainkey` (DKIM), `TXT _dmarc`, `NS`.

**Rollback** is therefore a single edit: set `A @` back to `165.140.156.35`. The old site's
files are never deleted — it stays intact on the server throughout, just no longer addressed
by the domain.

---

## 1. Findings that must be fixed as part of this (not optional)

### 1.1 The site publishes an email address that does not exist

Only two mailboxes exist on the server: `fm@atlassouthes.com` and `a.rehan@atlassouthes.com`.
There are **no forwarders**, and the catch-all is set to *"Reject messages sent to
non-existent email boxes"*.

The website publishes **start@atlassouthes.com** in the footer, About, Contact, Home, Cookie
Policy and Privacy Policy. The API sends admin notifications to `enquiries@atlassouthes.com`.
**Neither exists**, so both bounce. This is live today, independent of the cutover.

Resolution: create `start@atlassouthes.com` as a real mailbox (section 3).

### 1.2 Third-party sending would have been rejected outright

SPF is `v=spf1 +a +mx +ip4:165.140.156.35 -all` — a hard fail — and DMARC is `p=reject`, the
strictest policy. Any mail sent from the domain by a service that isn't this server fails
SPF, has no aligned DKIM, and is then **rejected** by the recipient, not spam-foldered.

Resolution: send transactional mail **through this server's own SMTP** (client's decision,
2026-09-02). SPF, DKIM and DMARC then all pass with **zero DNS changes** — the existing
records already authorise it. This also removes the Resend sandbox restriction that was
blocking all outbound mail.

### 1.3 SPF must drop `+a` at cutover

`+a` authorises whatever the apex A record points at to send mail as this domain. Once the
apex points at Vercel, `+a` would authorise Vercel's shared infrastructure to send as
`@atlassouthes.com`. Vercel sends no mail, so the term is pure downside.

Sending from the server stays authorised by `+mx` and `+ip4:165.140.156.35`, both unchanged.
Edit at cutover to:

    v=spf1 +mx +ip4:165.140.156.35 -all

---

## 2. Order of operations

Email work first, DNS last. The DNS flip is the visible, public step — everything else is
verified before it happens.

1. Back up (3.0)
2. Create mailboxes (3)
3. Add SMTP credentials to Render (4)
4. Ship the code changes (5) — deployed while still on the Vercel URL
5. Verify email end to end (6) — **before** any DNS change
6. Add the domain in Vercel (7)
7. Flip DNS (8)
8. Flip `SITE_ORIGIN` and redeploy (9)
9. Post-cutover verification (10)

---

## 3. Mailboxes (hosting panel → Email Accounts)

### 3.0 Take a manual backup first

Panel → **Backups → New Manual Backup**, full account. Daily cloud backups already run, but
take a dated one immediately before starting so there is a known-good restore point tied to
this change.

### 3.1 Create three mailboxes

| Mailbox | Purpose |
|---|---|
| `careers@atlassouthes.com` | Receives job applications **with CV/cover letter attached** |
| `start@atlassouthes.com` | The public contact address (fixes 1.1) + enquiry notifications |
| `noreply@atlassouthes.com` | SMTP sender for all outbound transactional mail |

A role address for careers rather than a personal one: applications outlive whoever handles
them today, and CVs are candidate personal data that shouldn't sit in an individual's
mailbox by default.

Set a strong password on `noreply@` and keep it — it goes into Render in section 4 and is
never committed to the repo.

---

## 4. Render environment variables

Dashboard → `atlas-south-api` service → **Environment**:

| Variable | Value |
|---|---|
| `SMTP_HOST` | `mail.atlassouthes.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `noreply@atlassouthes.com` |
| `SMTP_PASS` | *(the mailbox password from 3.1)* |
| `MAIL_FROM` | `Atlas South Technical Services <noreply@atlassouthes.com>` |
| `ADMIN_EMAIL` | `start@atlassouthes.com` |
| `CAREERS_EMAIL` | `careers@atlassouthes.com` |
| `CORS_ALLOWED_ORIGIN` | `https://atlassouthes.com` — **only at step 8, not before** |

`RESEND_API_KEY` can be removed once section 6 passes.

> **Risk to check in section 6:** some hosts require port `465` (implicit TLS) rather than
> `587` (STARTTLS), and shared hosting commonly rate-limits outbound mail per hour. Both
> surface immediately in the section 6 test.

---

## 5. Code changes

### 5.1 Resend → SMTP

`apps/api/src/lib/email.ts` moves to nodemailer. The themed templates
(`lib/emailThemes.ts`) are unchanged — only the transport changes.

### 5.2 CVs are emailed, never stored

Client instruction, 2026-09-02. This also fixes an existing bug: uploads were written to
Render's local disk, which is **wiped on every deploy**, so CVs were already being lost.

- `multer.memoryStorage()` replaces `diskStorage` — nothing is written to disk at all
- The PDF magic-number check now runs against the in-memory buffer
- Both files are attached to the notification email to `CAREERS_EMAIL`
- `cvFilePath` / `coverLetterFilePath` are no longer populated
- The admin download endpoints and their buttons are retired — the files live in the careers
  mailbox now, which becomes the single source of truth

### 5.3 Domain flip

`SITE_ORIGIN` in `packages/shared/src/constants/seo.ts` → `https://atlassouthes.com`.
Canonical URLs, `og:image` and the email logo all derive from it. **Do this at step 9, not
before** — until DNS resolves, that origin 404s.

---

## 6. Verify email BEFORE touching DNS

With the code deployed and still on the Vercel URL:

1. Submit the quote form → confirmation arrives at the submitter, notification at `start@`
2. Submit a job application with two PDFs → notification arrives at `careers@` **with both
   files attached and openable**
3. Check headers on a received message: `spf=pass`, `dkim=pass`, `dmarc=pass`
4. Check `/admin/system-logs` for send failures

If mail fails here, **stop**. Nothing about DNS will fix it, and proceeding would take the
site live with silently broken email.

---

## 7. Add the domain in Vercel

Vercel → project `atlas-south-web` → **Settings → Domains** → add `atlassouthes.com` and
`www.atlassouthes.com`. Vercel displays the exact records for step 8 — use its values if they
differ from the defaults below.

---

## 8. DNS flip (hosting panel → DNS Editor)

Optionally lower the TTL on the two records to `300` a few hours beforehand so the change
propagates fast and rollback is quick.

**Change:**

| Type | Name | New value |
|---|---|---|
| `A` | `atlassouthes.com.` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |
| `TXT` | `atlassouthes.com.` | `v=spf1 +mx +ip4:165.140.156.35 -all` |

**Leave untouched:** `A mail`, `MX`, `NS`, `TXT _dmarc`, `TXT default._domainkey`.

Then set `CORS_ALLOWED_ORIGIN` on Render to `https://atlassouthes.com`.

---

## 9. Flip SITE_ORIGIN and redeploy

Once `atlassouthes.com` serves the new site and Vercel reports the domain valid with SSL
issued, change `SITE_ORIGIN` (5.3) and merge. Vercel redeploys automatically.

---

## 10. Post-cutover verification

- [ ] `https://atlassouthes.com` serves the new site; `www` redirects to it
- [ ] SSL valid, no mixed-content warnings
- [ ] Deep link works: `https://atlassouthes.com/hard-services/electricals`
- [ ] `curl -sI https://atlassouthes.com/` returns `X-Frame-Options: DENY` — proves
      `apps/web/vercel.json` is being read (see README)
- [ ] Quote form submits (201) and both emails arrive
- [ ] Job application submits and the CV arrives at `careers@` as an attachment
- [ ] **Email still works both ways** — send to and from `fm@` and `a.rehan@`
- [ ] `og:image` resolves at the new origin; link preview shows the logo
- [ ] Admin panel login works
- [ ] Submit the sitemap to Google Search Console

---

## 11. Rollback

Set `A @` back to `165.140.156.35` and revert `CORS_ALLOWED_ORIGIN`. The old site is
untouched on disk throughout and returns as soon as DNS propagates. Nothing in this
procedure deletes it.
