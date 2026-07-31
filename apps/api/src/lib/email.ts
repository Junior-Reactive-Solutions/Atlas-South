import { Resend } from 'resend';

/**
 * Email service — docs/build/12-HOSTING-DEPLOYMENT.md §6.
 * Sends transactional emails via Resend (enquiry confirmations, admin notifications).
 * Requires RESEND_API_KEY environment variable.
 */

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const SENDER_EMAIL = 'noreply@atlassouth.co.uk';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'enquiries@atlassouth.co.uk';

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
 */
export async function sendEnquiryConfirmation(data: EnquiryEmailData) {
  if (!resend) {
    console.warn('Resend not configured — skipping confirmation email');
    return;
  }

  try {
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: data.email,
      subject: "We've received your enquiry — Atlas South",
      html: `
        <h1>Thank you, ${data.fullName}!</h1>
        <p>We've received your enquiry and will respond within 24 hours.</p>
        <p><strong>Phone:</strong> 020 XXXX XXXX (24/7)</p>
        <p>
          In the meantime, feel free to reach out if you have any urgent questions.
        </p>
        <hr />
        <p style="font-size: 12px; color: #666;">
          This is an automated confirmation. Do not reply to this email.
        </p>
      `,
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
