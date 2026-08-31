import { Resend } from 'resend';
import { COMPANY, SITE_ORIGIN } from '@atlas-south/shared';
import { renderReplyEmail, renderConfirmationEmail, escapeHtml, type ReplyEmailTheme } from './emailThemes.js';

/**
 * Email service — docs/build/12-HOSTING-DEPLOYMENT.md §6.
 * Sends transactional emails via Resend (enquiry confirmations, admin notifications).
 * Requires RESEND_API_KEY environment variable.
 */

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const SENDER_EMAIL = 'noreply@atlassouthes.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'enquiries@atlassouthes.com';

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
  if (!resend) {
    console.warn('Resend not configured — skipping confirmation email');
    return;
  }

  const firstName = data.fullName.trim().split(/\s+/)[0] || data.fullName;

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
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
  } catch (err) {
    console.error('Failed to send enquiry confirmation email:', err);
    // Don't throw — enquiry is already created. This is a nice-to-have notification.
  }
}

/**
 * Send an admin notification email about a new enquiry.
 * Alerts the team to follow up with the lead.
 */
export async function sendEnquiryAdminNotification(data: EnquiryEmailData & { enquiryId: string }) {
  if (!resend) {
    console.warn('Resend not configured — skipping admin notification email');
    return;
  }

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New enquiry: ${data.fullName} — ${data.serviceId}`,
      html: `
        <h2>New Enquiry Received</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px; font-weight: bold; width: 150px;">Name:</td>
            <td style="padding: 8px;">${data.fullName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px; font-weight: bold;">Email:</td>
            <td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px; font-weight: bold;">Phone:</td>
            <td style="padding: 8px;"><a href="tel:${data.phone}">${data.phone}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px; font-weight: bold;">Service:</td>
            <td style="padding: 8px;">${data.serviceId}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; vertical-align: top;">Message:</td>
            <td style="padding: 8px;">${data.message.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
        <hr />
        <p style="font-size: 12px; color: #666;">
          Enquiry ID: ${data.enquiryId}
        </p>
      `,
    });
  } catch (err) {
    console.error('Failed to send admin notification email:', err);
    // Don't throw — enquiry is already created. This is a nice-to-have notification.
  }
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
  if (!resend) {
    console.warn('Resend not configured — skipping application confirmation email');
    return;
  }

  const firstName = data.fullName.trim().split(/\s+/)[0] || data.fullName;

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
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
  } catch (err) {
    console.error('Failed to send job application confirmation email:', err);
    // Don't throw — application is already created. This is a nice-to-have notification.
  }
}

/**
 * Send an admin notification email about a new job application.
 * Alerts the team to follow up with the candidate.
 */
export async function sendJobApplicationAdminNotification(
  data: JobApplicationEmailData & {
    applicationId: string;
    phone: string;
    coverLetter?: string;
    cvFileName?: string;
    coverLetterFileName?: string;
  }
) {
  if (!resend) {
    console.warn('Resend not configured — skipping application admin notification email');
    return;
  }

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New application: ${data.fullName} — ${data.roleTitle}`,
      html: `
        <h2>New Job Application Received</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px; font-weight: bold; width: 150px;">Name:</td>
            <td style="padding: 8px;">${data.fullName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px; font-weight: bold;">Email:</td>
            <td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px; font-weight: bold;">Phone:</td>
            <td style="padding: 8px;"><a href="tel:${data.phone}">${data.phone}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px; font-weight: bold;">Position:</td>
            <td style="padding: 8px;">${data.roleTitle}</td>
          </tr>
          ${data.cvFileName ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">CV:</td><td style="padding: 8px;">${data.cvFileName}</td></tr>` : ''}
          ${data.coverLetterFileName ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px; font-weight: bold;">Cover Letter file:</td><td style="padding: 8px;">${data.coverLetterFileName}</td></tr>` : ''}
          ${data.coverLetter ? `<tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Note:</td><td style="padding: 8px;">${data.coverLetter.replace(/\n/g, '<br>')}</td></tr>` : ''}
        </table>
        <hr />
        <p style="font-size: 12px; color: #666;">
          Application ID: ${data.applicationId}
        </p>
      `,
    });
  } catch (err) {
    console.error('Failed to send application admin notification email:', err);
    // Don't throw — application is already created. This is a nice-to-have notification.
  }
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
 * so a failure here is surfaced to the caller (returns false) rather than swallowed: the
 * admin needs to know the reply didn't actually go out, not just see a green success toast.
 */
export async function sendAdminReply(data: AdminReplyData): Promise<boolean> {
  if (!resend) {
    console.warn('Resend not configured — cannot send admin reply');
    return false;
  }

  await resend.emails.send({
    from: SENDER_EMAIL,
    to: data.to,
    subject: data.subject,
    html: renderReplyEmail(ADMIN_REPLY_THEME, {
      recipientFirstName: data.recipientFirstName,
      message: data.message,
      subject: data.subject,
    }),
  });
  return true;
}
