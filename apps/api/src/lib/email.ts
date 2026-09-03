import { COMPANY, SITE_ORIGIN } from '@atlas-south/shared';
import { env } from './env.js';
import { logSystemEvent } from './systemLog.js';
import {
  renderReplyEmail,
  renderConfirmationEmail,
  renderInternalNotificationEmail,
  escapeHtml,
  type ReplyEmailTheme,
} from './emailThemes.js';

/**
 * Email service — sends over Mailgun's HTTPS API rather than SMTP.
 *
 * WHY NOT SMTP (changed 2026-09-03, superseding the 2026-09-02 SMTP-only design — see git
 * history on this file): Render's free web services block ALL outbound traffic to SMTP
 * ports (25/465/587), full stop
 * (https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports).
 * That made the previous design — sending via the domain's own mail server, chosen
 * specifically to satisfy SPF `-all`/DMARC `p=reject` without any DNS changes — genuinely
 * undeliverable from this host: every send failed with a connection timeout regardless of
 * SMTP_HOST/PORT/TLS config, because the platform itself refused the outbound socket
 * before a byte could be sent. Confirmed by testing raw TCP connectivity to the mail
 * server from outside Render (succeeded) versus from the deployed service (timed out).
 *
 * Mailgun's API is a plain HTTPS POST, which Render does not block — the same reason the
 * rest of this app's outbound calls (Neon, the frontend itself) work fine.
 *
 * WHY THIS DOESN'T WEAKEN SPF/DMARC: Mailgun sends via a dedicated subdomain
 * (MAILGUN_DOMAIN, e.g. `mg.atlassouthes.com`) with its own SPF/DKIM records — entirely
 * separate from the apex domain's existing mail server records (A/MX/DKIM/DMARC), which
 * are untouched. The visible From address can still be `noreply@atlassouthes.com` (the
 * business domain) even though Mailgun's DKIM signature is for `mg.atlassouthes.com`:
 * DMARC's default relaxed alignment accepts a DKIM domain that shares the From address's
 * organizational domain, which a subdomain does.
 *
 * Every send is best-effort: a mail failure must never break the request that triggered it
 * (an enquiry is already saved by then). Failures are recorded to the operations log so
 * they are visible in the admin panel rather than lost to stdout.
 */

const MAILGUN_CONFIGURED = Boolean(env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN);

/** The From header. Falls back to noreply@ the business domain — always a plausible sender even unconfigured. */
const SENDER_EMAIL = env.MAIL_FROM || `noreply@${COMPANY.domain}`;

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
  if (!MAILGUN_CONFIGURED) {
    console.warn(`Mailgun not configured — skipping email to ${opts.to}`);
    return false;
  }

  // multipart/form-data, not JSON — Mailgun's send endpoint takes form fields and only
  // accepts attachment bytes as file parts, which JSON can't carry. `attachment` (singular
  // field name) is intentional and required for multiple files: Mailgun expects repeated
  // `attachment` parts, not an array-style `attachments[]` name.
  const form = new FormData();
  form.set('from', SENDER_EMAIL);
  form.set('to', opts.to);
  form.set('subject', opts.subject);
  form.set('html', opts.html);
  for (const attachment of opts.attachments ?? []) {
    // `new Uint8Array(buffer)` rather than passing the Buffer directly: Buffer's
    // TypeScript type allows a SharedArrayBuffer-backed instance, which isn't assignable
    // to BlobPart — wrapping it copies into a plain ArrayBuffer-backed view that is.
    form.append(
      'attachment',
      new Blob([new Uint8Array(attachment.content)], { type: attachment.contentType }),
      attachment.filename,
    );
  }

  try {
    // Basic auth with the literal username 'api' — not a placeholder, this is Mailgun's
    // actual documented convention; the real secret is the password half (MAILGUN_API_KEY).
    const auth = Buffer.from(`api:${env.MAILGUN_API_KEY}`).toString('base64');
    const res = await fetch(`${env.MAILGUN_BASE_URL}/v3/${env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}` },
      body: form,
    });

    if (!res.ok) {
      // Mailgun's error body is small JSON ({"message": "..."}) — safe to inline in the
      // log, unlike a raw SMTP exception's stack trace.
      const body = await res.text().catch(() => '');
      throw new Error(`Mailgun ${res.status}: ${body.slice(0, 300)}`);
    }

    return true;
  } catch (err) {
    logSystemEvent({
      level: 'error',
      source: 'api',
      event: 'email_send_failed',
      message: err instanceof Error ? err.message : 'Unknown Mailgun error',
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

/**
 * Value builders for the internal-notification rows. Each returns HTML, so each is
 * responsible for escaping whatever it interpolates — every one of these carries a value
 * typed by a member of the public into a form.
 *
 * `encodeURI` guards the href (where the risk is a crafted scheme or a broken URL) and
 * `escapeHtml` guards the visible text (where the risk is markup injection); they are not
 * interchangeable, which is why both appear on the same line.
 */
function mailtoLink(email: string): string {
  return `<a href="mailto:${encodeURI(email)}" style="color:#0062D6;">${escapeHtml(email)}</a>`;
}

function telLink(phone: string): string {
  return `<a href="tel:${encodeURI(phone)}" style="color:#0062D6;">${escapeHtml(phone)}</a>`;
}

/** Escapes first, THEN converts newlines — doing it the other way round would let a
 * submitted `<br>` survive escaping and inject markup. */
function multilineHtml(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br />');
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
    html: renderInternalNotificationEmail({
      title: 'New enquiry received',
      intro: 'A new enquiry has come in through the website. Details below.',
      rows: [
        { label: 'Name', valueHtml: escapeHtml(data.fullName) },
        { label: 'Email', valueHtml: mailtoLink(data.email) },
        { label: 'Phone', valueHtml: telLink(data.phone) },
        { label: 'Service', valueHtml: escapeHtml(data.serviceId) },
        { label: 'Message', valueHtml: multilineHtml(data.message) },
      ],
      reference: `Enquiry ID: ${data.enquiryId}`,
    }),
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
    html: renderInternalNotificationEmail({
      title: 'New job application received',
      intro: 'A candidate has applied through the careers pages. Details below.',
      rows: [
        { label: 'Name', valueHtml: escapeHtml(data.fullName) },
        { label: 'Email', valueHtml: mailtoLink(data.email) },
        { label: 'Phone', valueHtml: telLink(data.phone) },
        { label: 'Position', valueHtml: escapeHtml(data.roleTitle) },
        ...(data.cvFileName
          ? [{ label: 'CV', valueHtml: `${escapeHtml(data.cvFileName)} — attached` }]
          : []),
        ...(data.coverLetterFileName
          ? [{ label: 'Cover letter', valueHtml: `${escapeHtml(data.coverLetterFileName)} — attached` }]
          : []),
        ...(data.coverLetter ? [{ label: 'Note', valueHtml: multilineHtml(data.coverLetter) }] : []),
      ],
      footnote: hasFiles
        ? 'The documents are attached to this email. They are not stored on the server, so keep this message — it is the only copy.'
        : 'No documents were attached to this application.',
      reference: `Application ID: ${data.applicationId}`,
    }),
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

export interface ChatLeadEmailData {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  preferredContact: 'email' | 'phone';
  email?: string;
  services: string;
  message?: string;
  /** The conversation as it actually happened, oldest first. Optional — an older client
   * build, or a lead captured some other way, simply won't send one. */
  transcript?: Array<{ from: 'bot' | 'user'; text: string }>;
  leadId: string;
}

/** Renders the chat transcript as a readable exchange. Returns '' when there isn't one,
 * so callers can drop the whole section rather than print an empty heading. */
function transcriptHtml(transcript?: ChatLeadEmailData['transcript']): string {
  if (!transcript || transcript.length === 0) return '';
  return transcript
    .map((line) => {
      const who = line.from === 'user' ? 'You' : 'Atlas South';
      const colour = line.from === 'user' ? BRAND_INK : BRAND_SLATE;
      const weight = line.from === 'user' ? '600' : '400';
      return `<p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:${colour};font-weight:${weight};">
        <span style="display:block;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#8A93AD;margin-bottom:2px;">${who}</span>
        ${multilineHtml(line.text)}
      </p>`;
    })
    .join('');
}

// Kept local rather than imported: emailThemes.ts owns BRAND but doesn't export it, and
// widening that export just for two colours here would make the theme's palette part of
// this module's public surface.
const BRAND_INK = '#0B1220';
const BRAND_SLATE = '#47547A';

/**
 * Confirmation to a visitor who gave their details through the website chatbot, including
 * a copy of the conversation.
 *
 * Added 2026-09-03 at the client's request ("all forms must auto-respond", "chatbot should
 * send a summary of the chat"). Before this, the chatbot was the ONE route into the
 * business that sent nothing at all — no confirmation to the visitor and no notification
 * to the team. A lead landed silently in the admin panel and waited to be noticed.
 *
 * ONLY sent when the visitor actually supplied an email. The chatbot asks for one only
 * when they choose email as their preferred contact method, so a phone-preference lead has
 * no address to send to — the caller checks before calling this.
 */
export async function sendChatLeadConfirmation(data: ChatLeadEmailData) {
  if (!data.email) return;

  const conversation = transcriptHtml(data.transcript);

  await sendMail({
    to: data.email,
    subject: "Your enquiry — Atlas South Technical Services",
    html: renderConfirmationEmail({
      recipientFirstName: data.firstName,
      bodyHtml: `
        <p style="margin:0 0 16px;">Thanks for chatting with us. We've passed your details to the team and someone will be in touch shortly.</p>
        <p style="margin:0 0 16px;"><strong>What you told us you're interested in:</strong><br />${escapeHtml(data.services)}</p>
        ${data.message ? `<p style="margin:0 0 16px;"><strong>Your note:</strong><br />${multilineHtml(data.message)}</p>` : ''}
        ${
          conversation
            ? `<p style="margin:24px 0 8px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.06em;color:${BRAND_SLATE};">A copy of our conversation</p>
               <div style="border-left:3px solid #0062D6;padding-left:14px;">${conversation}</div>`
            : ''
        }
        <p style="margin:20px 0 0;">Need us sooner? Call <strong>${escapeHtml(COMPANY.phone.display)}</strong> — we're available 24/7.</p>
      `,
      cta: { label: 'Visit our site', href: SITE_URL },
    }),
  });
}

/**
 * Internal notification for a new chatbot lead, so one doesn't sit unseen in the admin
 * panel. Goes to ADMIN_EMAIL alongside the enquiry notifications, since a chat lead is the
 * same kind of thing commercially — a prospect asking to be contacted.
 */
export async function sendChatLeadAdminNotification(data: ChatLeadEmailData) {
  await sendMail({
    to: ADMIN_EMAIL,
    subject: `New chat lead: ${data.firstName} ${data.lastName} — ${data.company}`,
    html: renderInternalNotificationEmail({
      title: 'New chat lead',
      intro: 'Someone gave their details through the website chatbot. Details below.',
      rows: [
        { label: 'Name', valueHtml: escapeHtml(`${data.firstName} ${data.lastName}`) },
        { label: 'Company', valueHtml: escapeHtml(data.company) },
        { label: 'Phone', valueHtml: telLink(data.phone) },
        ...(data.email ? [{ label: 'Email', valueHtml: mailtoLink(data.email) }] : []),
        // Surfaced as its own row because it decides how to follow up — ringing someone who
        // asked to be emailed is the fastest way to start badly.
        { label: 'Prefers', valueHtml: data.preferredContact === 'phone' ? 'Phone call' : 'Email' },
        { label: 'Interested in', valueHtml: escapeHtml(data.services) },
        ...(data.message ? [{ label: 'Note', valueHtml: multilineHtml(data.message) }] : []),
      ],
      footnote: data.transcript && data.transcript.length > 0
        ? 'The visitor was sent a copy of the conversation with this enquiry.'
        : undefined,
      reference: `Lead ID: ${data.leadId}`,
    }),
  });
}
