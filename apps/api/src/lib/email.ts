import nodemailer, { type Transporter } from 'nodemailer';
import { COMPANY, SITE_ORIGIN } from '@atlas-south/shared';
import { env } from './env.js';
import { logSystemEvent } from './systemLog.js';
import { renderReplyEmail, renderConfirmationEmail, escapeHtml, type ReplyEmailTheme } from './emailThemes.js';

/**
 * Email service — sends over SMTP through the domain's own mail server.
 *
 * WHY SMTP AND NOT A THIRD-PARTY API (changed 2026-09-02, client decision):
 * atlassouthes.com publishes SPF ending in `-all` (hard fail) authorising only the mail
 * server's own IP, and DMARC `p=reject`. Mail sent from anywhere else — Resend included —
 * fails SPF, has no aligned DKIM, and is REJECTED by the recipient rather than
 * spam-foldered. Sending from the server the domain already authorises means SPF, DKIM and
 * DMARC all pass with no DNS changes at all. See docs/build/17-DOMAIN-CUTOVER-RUNBOOK.md.
 *
 * Every send is best-effort: a mail failure must never break the request that triggered it
 * (an enquiry is already saved by then). Failures are recorded to the operations log so
 * they are visible in the admin panel rather than lost to stdout.
 */

/**
 * Built once and reused — nodemailer pools connections, and rebuilding per send would
 * re-handshake TLS every time. Null when SMTP isn't configured, so a dev environment or a
 * half-provisioned deploy degrades to a logged warning instead of throwing on boot.
 */
const transporter: Transporter | null =
  env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        // 465 is implicit TLS; 587 upgrades via STARTTLS. Derived from the port rather
        // than configured separately, because getting the two out of step is the single
        // most common way an SMTP setup fails with an opaque handshake error.
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      })
    : null;

/** The From header. Falls back to the SMTP user, which is always a real mailbox. */
const SENDER_EMAIL = env.MAIL_FROM || env.SMTP_USER || `noreply@${COMPANY.domain}`;

/** Where enquiry notifications go. */
const ADMIN_EMAIL = env.ADMIN_EMAIL || `start@${COMPANY.domain}`;

/**
 * Where job applications go, with the CV and cover letter attached. Deliberately separate
 * from ADMIN_EMAIL: applications carry candidate personal data and belong in a role
 * mailbox that outlives whoever handles them today, not mixed into general enquiries.
 */
const CAREERS_EMAIL = env.CAREERS_EMAIL || `careers@${COMPANY.domain}`;

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

/**
 * One place every send goes through, so the 'never throw, always log' contract is
 * guaranteed rather than repeated at each call site. Returns whether the message was
 * accepted, for the one caller (admin replies) that needs to surface failure to a human.
 */
async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: MailAttachment[];
  /** Set for mail a person is waiting on, so the failure reaches them not just the log. */
  rethrow?: boolean;
}): Promise<boolean> {
  if (!transporter) {
    console.warn(`SMTP not configured — skipping email to ${opts.to}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: SENDER_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments,
    });
    return true;
  } catch (err) {
    logSystemEvent({
      level: 'error',
      source: 'api',
      event: 'email_send_failed',
      message: err instanceof Error ? err.message : 'Unknown SMTP error',
      // The recipient is deliberately NOT logged: it is a customer's or candidate's email
      // address, and the operations log is not a place for personal data. The subject is
      // enough to identify which send failed.
      context: { subject: opts.subject },
    });
    if (opts.rethrow) throw err;
    return false;
  }
}

/**
 * Which of the three themed layouts (lib/emailThemes.ts) admin replies go out in. The
 * client reviewed all three and chose 'light-editorial' (2026-08-26) — the quieter
 * treatment where the logo sits on white and the brand shows up as an accent rule rather
 * than a navy background band, so a reply reads as a note from the team rather than a
 * marketing send.
 */
const ADMIN_REPLY_THEME: ReplyEmailTheme = 'light-editorial';

/** The enquiry confirmation's CTA needs an absolute link back to the site — SITE_ORIGIN,
 * not COMPANY.domain, for the same reason emailThemes.ts' own SITE_URL/LOGO_URL now use it:
 * atlassouthes.com serves the client's OLD site until the DNS cutover, so a link there
 * would 404 on a real customer today. See the note on SITE_ORIGIN in
 * packages/shared/constants/seo.ts. */
const SITE_URL = SITE_ORIGIN;

export interface EnquiryEmailData {
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  message: string;
}

/** Two-column row for the internal notification tables. Escapes the value; the label is
 * always a literal from this file. `raw` is for values already built as safe HTML. */
function row(label: string, value: string, raw = false): string {
  return `
    <tr style="border-bottom:1px solid #eee;">
      <td style="padding:8px;font-weight:bold;width:150px;vertical-align:top;">${label}</td>
      <td style="padding:8px;">${raw ? value : escapeHtml(value)}</td>
    </tr>`;
}

/**
 * Send a confirmation email to the enquiry submitter.
 * Acknowledges receipt and sets response-time expectation.
 *
 * Rewritten 2026-08-31 (client request: a themed confirmation for every form that
 * collects an email address) to fix two things the previous ad-hoc HTML had:
 *   1. It quoted a placeholder phone number, "020 XXXX XXXX", verbatim — never filled
 *      in, and not even the right area code for COMPANY.phone. Every confirmation this
 *      system has ever sent told the recipient to call a number that doesn't exist.
 *   2. It wasn't themed at all — no logo, no brand colour, plain <h1>/<p> — inconsistent
 *      with the admin-reply emails, which do carry the client's chosen theme.
 * Now built on renderConfirmationEmail (lib/emailThemes.ts), the same 'light-editorial'
 * theme chosen for replies, with the real number from COMPANY.
 */
export async function sendEnquiryConfirmation(data: EnquiryEmailData) {
  const firstName = data.fullName.trim().split(/\s+/)[0] || data.fullName;

  await sendMail({
    to: data.email,
    subject: "We've received your enquiry — Atlas South",
    html: renderConfirmationEmail({
      recipientFirstName: firstName,
      bodyHtml: `
        <p style="margin:0 0 16px;">We've received your enquiry and will respond within 24 hours.</p>
        <p style="margin:0 0 16px;">Need to reach us sooner? Call us on <strong>${escapeHtml(COMPANY.phone.display)}</strong> — we're here 24/7.</p>
      `,
      cta: { label: 'Visit our site', href: SITE_URL },
    }),
  });
}

/**
 * Send an admin notification email about a new enquiry.
 * Alerts the team to follow up with the lead.
 */
export async function sendEnquiryAdminNotification(data: EnquiryEmailData & { enquiryId: string }) {
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `New enquiry: ${data.fullName} — ${data.serviceId}`,
    html: `
      <h2>New Enquiry Received</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Name:', data.fullName)}
        ${row('Email:', `<a href="mailto:${encodeURI(data.email)}">${escapeHtml(data.email)}</a>`, true)}
        ${row('Phone:', `<a href="tel:${encodeURI(data.phone)}">${escapeHtml(data.phone)}</a>`, true)}
        ${row('Service:', data.serviceId)}
        ${row('Message:', escapeHtml(data.message).replace(/\n/g, '<br>'), true)}
      </table>
      <hr />
      <p style="font-size:12px;color:#666;">Enquiry ID: ${escapeHtml(data.enquiryId)}</p>
    `,
  });
}

export interface JobApplicationEmailData {
  fullName: string;
  email: string;
  roleTitle: string;
}

/**
 * Send a confirmation email to the job applicant.
 * Acknowledges receipt and sets response-time expectation.
 *
 * Rewritten 2026-08-31 for the same theming reason as sendEnquiryConfirmation above.
 * Deliberately carries no phone CTA — matches the decision already made for the careers
 * pages' own SEO copy (packages/shared/constants/seo.ts): a candidate should hear back
 * through the process they applied through, not be invited to ring the sales line.
 */
export async function sendJobApplicationConfirmation(data: JobApplicationEmailData) {
  const firstName = data.fullName.trim().split(/\s+/)[0] || data.fullName;

  await sendMail({
    to: data.email,
    subject: "We've received your application — Atlas South Careers",
    html: renderConfirmationEmail({
      recipientFirstName: firstName,
      bodyHtml: `
        <p style="margin:0 0 16px;">We've received your application for the <strong>${escapeHtml(data.roleTitle)}</strong> position and will review it carefully.</p>
        <p style="margin:0 0 16px;">If your background matches what we're looking for, a member of our team will be in touch within 5–7 working days.</p>
      `,
      // No cta: — see the note above on why there's deliberately no phone/contact link here.
    }),
  });
}

/**
 * Send the internal notification for a new job application — **with the CV and cover
 * letter attached**.
 *
 * The attachments are the point of this message, not a nicety (client instruction,
 * 2026-09-02): uploads are no longer written to disk anywhere, so this email is the only
 * copy of the candidate's documents. That is deliberate — the previous behaviour wrote them
 * to Render's local disk, which is wiped on every deploy, so CVs were being silently lost.
 *
 * Goes to CAREERS_EMAIL rather than ADMIN_EMAIL: a CV is candidate personal data and
 * belongs in the role mailbox for recruitment, not mixed into the general enquiry inbox.
 *
 * If this send fails the documents are gone, since nothing else retains them. sendMail
 * records the failure to the operations log (visible at /admin/system-logs) precisely so
 * that is noticed rather than silent — and the applicant still gets their confirmation, so
 * a failure here is recoverable by asking them to resend.
 */
export async function sendJobApplicationAdminNotification(
  data: JobApplicationEmailData & {
    applicationId: string;
    phone: string;
    coverLetter?: string;
    cvFileName?: string;
    coverLetterFileName?: string;
    attachments?: MailAttachment[];
  }
) {
  const hasFiles = (data.attachments?.length ?? 0) > 0;

  await sendMail({
    to: CAREERS_EMAIL,
    subject: `New application: ${data.fullName} — ${data.roleTitle}`,
    attachments: data.attachments,
    html: `
      <h2>New Job Application Received</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Name:', data.fullName)}
        ${row('Email:', `<a href="mailto:${encodeURI(data.email)}">${escapeHtml(data.email)}</a>`, true)}
        ${row('Phone:', `<a href="tel:${encodeURI(data.phone)}">${escapeHtml(data.phone)}</a>`, true)}
        ${row('Position:', data.roleTitle)}
        ${data.cvFileName ? row('CV:', `${escapeHtml(data.cvFileName)} — attached`, true) : ''}
        ${data.coverLetterFileName ? row('Cover letter:', `${escapeHtml(data.coverLetterFileName)} — attached`, true) : ''}
        ${data.coverLetter ? row('Note:', escapeHtml(data.coverLetter).replace(/\n/g, '<br>'), true) : ''}
      </table>
      <p style="font-size:13px;color:#444;margin-top:16px;">
        ${
          hasFiles
            ? 'The documents are attached to this email. They are not stored on the server, so keep this message — it is the only copy.'
            : 'No documents were attached to this application.'
        }
      </p>
      <hr />
      <p style="font-size:12px;color:#666;">Application ID: ${escapeHtml(data.applicationId)}</p>
    `,
  });
}

export interface AdminReplyData {
  to: string;
  recipientFirstName: string;
  subject: string;
  message: string;
}

/**
 * Sends a themed reply from the admin panel (Enquiries or Applications "Reply" action) —
 * unlike the automated confirmations above, this carries the admin's own written message,
 * so a failure here is surfaced to the caller rather than swallowed: the admin needs to
 * know the reply didn't actually go out, not just see a green success toast.
 */
export async function sendAdminReply(data: AdminReplyData): Promise<boolean> {
  return sendMail({
    to: data.to,
    subject: data.subject,
    html: renderReplyEmail(ADMIN_REPLY_THEME, {
      recipientFirstName: data.recipientFirstName,
      message: data.message,
      subject: data.subject,
    }),
    // A person is waiting on this one and will be told it sent — let the caller see the
    // failure instead of reporting success for a message that never left.
    rethrow: true,
  });
}
