/**
 * Themed HTML wrapper for admin-composed reply emails — docs/build/08-ADMIN-PANEL-SPEC.md
 * "Reply from admin" flow. Three options exist (see ADMIN_REPLY_THEME below) so the client
 * can pick one; every option uses the same verified brand tokens (apps/web/tailwind.config.js)
 * and the same hosted logo, just arranged differently.
 *
 * Email HTML has none of the CSS the rest of the app relies on — no Tailwind, no external
 * stylesheet, no flexbox/grid support in the clients that matter (Outlook desktop renders
 * with Word's engine). Every rule here is inline, layout is table-based, and colour comes
 * from the same hex values apps/web/tailwind.config.js defines, copied by value since an
 * email can't import that file.
 */
import { SITE_ORIGIN } from '@atlas-south/shared';

const BRAND = {
  navy: '#002484',
  navyDeep: '#0A2472',
  accentBlue: '#0062D6', // the only blue verified AA-accessible for text — see tailwind.config.js
  ink: '#0B1220',
  slate: '#47547A',
  canvasTint: '#F5F8FD',
  border: '#DCE3F0',
};

/**
 * Hosted at the production web origin — email clients can't resolve a relative path, and
 * unlike a browser they never retry, so the URL must resolve on the FIRST request.
 *
 * Built from SITE_ORIGIN, not COMPANY.domain: this was `https://atlassouthes.com/...`
 * until 2026-08-31, which meant the logo silently failed to load in every email this
 * system has ever sent — atlassouthes.com still serves the client's OLD site until the
 * DNS cutover, and that site has no /atlas-south-logo.jpg. Every admin reply and every
 * automated confirmation sent so far has shown a broken image where the logo should be.
 * Flip this back to `https://${COMPANY.domain}` as part of the DNS cutover checklist in
 * README.md, alongside SITE_ORIGIN itself.
 */
const LOGO_URL = `${SITE_ORIGIN}/atlas-south-logo.jpg`;
const SITE_URL = SITE_ORIGIN;

/**
 * The only logo file the site has is the full-colour wordmark on a white background
 * (public/atlas-south-logo.jpg) — there's no rasterised light/white variant for placing
 * directly on a navy background the way the site's own header/footer do with an SVG
 * (public/brand/wordmark-light.svg). An SVG isn't usable here: Outlook desktop (still the
 * dominant business email client) doesn't render inline or hosted SVG at all. A CSS
 * `filter` to fake a light version isn't usable either — filter support in email clients
 * is inconsistent to nonexistent. So on the two themes with a navy band, the real logo
 * sits inside a small white rounded card instead — a standard, broadly-supported
 * table-based pattern for showing a colour logo on a coloured background in email. */
function logoOnNavy(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#FFFFFF;border-radius:8px;padding:10px 16px;"><img src="${LOGO_URL}" alt="Atlas South" width="150" style="display:block;height:auto;" /></td></tr></table>`;
}

export type ReplyEmailTheme = 'navy-header' | 'light-editorial' | 'brand-sandwich';

export interface ReplyEmailData {
  /** First name only — "Hi James," not "Hi James Carter," */
  recipientFirstName: string;
  /** Plain text with \n\n paragraph breaks, as typed by the admin — never raw HTML from
   * the admin's textarea, to avoid an XSS/formatting-injection path through the reply box. */
  message: string;
  /** e.g. "Re: your enquiry" or "Re: your application — Experienced Plumber" */
  subject: string;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Converts \n\n-separated plain text into <p> tags, preserving single \n as <br>. */
function messageToHtml(message: string): string {
  return message
    .split(/\n{2,}/)
    .map((para) => `<p style="margin:0 0 16px;">${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

const FOOTER_LINKS = `
  <a href="${SITE_URL}" style="color:${BRAND.accentBlue};text-decoration:none;">atlassouthes.com</a>
  &nbsp;·&nbsp;
  <a href="${SITE_URL}/legal/privacy" style="color:${BRAND.accentBlue};text-decoration:none;">Privacy Policy</a>
`;

/**
 * Option A — "Navy Header": a solid navy band carries the logo (light wordmark on navy),
 * white body below, one accent-blue CTA. The most conventional transactional-email
 * layout — closest to what the confirmation emails already look like, just themed.
 */
function navyHeader(data: ReplyEmailData): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.canvasTint};padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:${BRAND.navy};padding:20px 32px;">
          ${logoOnNavy()}
        </td>
      </tr>
      <tr>
        <td style="padding:36px 32px 8px;">
          <p style="margin:0 0 20px;font-size:16px;color:${BRAND.ink};">Hi ${escapeHtml(data.recipientFirstName)},</p>
          <div style="font-size:15px;line-height:1.6;color:${BRAND.ink};">${messageToHtml(data.message)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 32px 32px;">
          <a href="${SITE_URL}/company/contact" style="display:inline-block;background:${BRAND.accentBlue};color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:6px;">Get in touch</a>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px;border-top:1px solid ${BRAND.border};font-size:12px;color:${BRAND.slate};">
          Atlas South Technical Services Ltd &nbsp;·&nbsp; London &amp; South East<br />
          ${FOOTER_LINKS}
        </td>
      </tr>
    </table>
  </td></tr>
</table>`;
}

/**
 * Option B — "Light Editorial": white/tint throughout, no navy block at all — the logo
 * sits directly on white, a slim accent-blue rule marks the sign-off. Quieter and more
 * like a personal note from the team than a marketing template; the brand shows up as an
 * accent rather than a background colour.
 *
 * `lightEditorialShell` is the table structure factored out of this option specifically
 * (not the other two) — it's the shell used by the automated confirmation emails below,
 * per the client's request that those "be of the theme we had set up earlier": rather than
 * introduce a fourth, separate template, confirmations reuse the exact theme already
 * reviewed and chosen for admin replies (2026-08-26), so every automated and manual
 * correspondence from the site shares one visual identity.
 */
function lightEditorialShell(bodyHtml: string, ctaHtml: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.canvasTint};padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid ${BRAND.border};">
      <tr>
        <td style="padding:32px 32px 0;">
          <img src="${LOGO_URL}" alt="Atlas South" width="170" style="display:block;height:auto;" />
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px 4px;">
          <div style="width:48px;height:3px;background:${BRAND.accentBlue};margin-bottom:24px;"></div>
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px 32px;">
          ${ctaHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px;border-top:1px solid ${BRAND.border};font-size:12px;color:${BRAND.slate};">
          Atlas South Technical Services Ltd &nbsp;·&nbsp; London &amp; South East<br />
          ${FOOTER_LINKS}
        </td>
      </tr>
    </table>
  </td></tr>
</table>`;
}

function lightEditorial(data: ReplyEmailData): string {
  const body = `
    <p style="margin:0 0 20px;font-size:16px;color:${BRAND.ink};">Hi ${escapeHtml(data.recipientFirstName)},</p>
    <div style="font-size:15px;line-height:1.6;color:${BRAND.ink};">${messageToHtml(data.message)}</div>
    <p style="margin:24px 0 0;font-size:15px;color:${BRAND.ink};">
      Best,<br /><strong>The Atlas South Team</strong>
    </p>`;
  const cta = `<a href="${SITE_URL}/company/contact" style="color:${BRAND.accentBlue};text-decoration:underline;font-weight:bold;font-size:14px;">Get in touch →</a>`;
  return lightEditorialShell(body, cta);
}

/**
 * Option C — "Brand Sandwich": navy header AND a navy footer band, white body between —
 * the boldest of the three, reads most like a branded marketing send rather than a
 * one-to-one reply. The CTA sits inside the footer band itself (white-on-navy) rather than
 * as a separate button in the body.
 */
function brandSandwich(data: ReplyEmailData): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.canvasTint};padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:${BRAND.navy};padding:18px 32px;border-top:4px solid ${BRAND.accentBlue};">
          ${logoOnNavy()}
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 20px;font-size:16px;color:${BRAND.ink};">Hi ${escapeHtml(data.recipientFirstName)},</p>
          <div style="font-size:15px;line-height:1.6;color:${BRAND.ink};">${messageToHtml(data.message)}</div>
        </td>
      </tr>
      <tr>
        <td style="background:${BRAND.navyDeep};padding:24px 32px;text-align:center;">
          <a href="${SITE_URL}/company/contact" style="display:inline-block;background:${BRAND.accentBlue};color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:6px;margin-bottom:14px;">Get in touch</a>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.65);">
            Atlas South Technical Services Ltd &nbsp;·&nbsp; London &amp; South East<br />
            <a href="${SITE_URL}" style="color:rgba(255,255,255,0.85);text-decoration:none;">atlassouthes.com</a>
            &nbsp;·&nbsp;
            <a href="${SITE_URL}/legal/privacy" style="color:rgba(255,255,255,0.85);text-decoration:none;">Privacy Policy</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`;
}

const RENDERERS: Record<ReplyEmailTheme, (data: ReplyEmailData) => string> = {
  'navy-header': navyHeader,
  'light-editorial': lightEditorial,
  'brand-sandwich': brandSandwich,
};

/** Renders a full HTML email body for an admin reply, in the chosen theme. */
export function renderReplyEmail(theme: ReplyEmailTheme, data: ReplyEmailData): string {
  return RENDERERS[theme](data);
}

export interface ConfirmationEmailData {
  /** First name only — "Thank you, James!" not "Thank you, James Carter!" */
  recipientFirstName: string;
  /**
   * Body paragraphs as HTML — built by the caller (lib/email.ts) so each confirmation type
   * (enquiry vs. job application) controls its own wording, but always through `escapeHtml`
   * (exported above) for any value that came from the submission itself — a name or role
   * title shouldn't be able to break the surrounding markup.
   */
  bodyHtml: string;
  /** Optional — omit for a confirmation with no natural next action (e.g. a job
   * application, where the CTA would be "call us", which contradicts "apply through the
   * form, not the phone" already established for the careers funnel). */
  cta?: { label: string; href: string };
}

/**
 * Automated confirmation emails (enquiry received, application received) — the client
 * asked these be sent for every form that collects an email address, and be "of the theme
 * we had set up earlier". Built on the same `lightEditorialShell` as the admin-reply
 * theme rather than a new one-off template, so an automated confirmation and a manual
 * admin reply look like they came from the same place.
 */
export function renderConfirmationEmail(data: ConfirmationEmailData): string {
  const body = `
    <p style="margin:0 0 20px;font-size:20px;font-weight:bold;color:${BRAND.ink};">Thank you, ${escapeHtml(data.recipientFirstName)}!</p>
    <div style="font-size:15px;line-height:1.6;color:${BRAND.ink};">${data.bodyHtml}</div>`;
  const cta = data.cta
    ? `<a href="${data.cta.href}" style="color:${BRAND.accentBlue};text-decoration:underline;font-weight:bold;font-size:14px;">${escapeHtml(data.cta.label)} →</a>`
    : `<p style="margin:0;font-size:12px;color:${BRAND.slate};">This is an automated confirmation — no reply needed.</p>`;
  return lightEditorialShell(body, cta);
}

/** One label/value row in an internal notification. `valueHtml` is inserted as-is, so the
 * caller must pass either a literal from its own source or something already escaped. */
export interface NotificationRow {
  label: string;
  valueHtml: string;
}

export interface InternalNotificationData {
  /** e.g. "New enquiry received" — the headline at the top of the message. */
  title: string;
  /** One line under the title saying what this is and what to do with it. */
  intro: string;
  rows: NotificationRow[];
  /** Optional closing note — e.g. the warning that attachments are the only copy. */
  footnote?: string;
  /** Small monospace-ish reference line at the bottom, e.g. "Enquiry ID: abc123". */
  reference?: string;
}

/**
 * The internal notification emails — a new enquiry landing in the team inbox, a new job
 * application landing in the careers inbox.
 *
 * Added 2026-09-03: these two were the last unthemed messages the system sent. Every
 * other email (admin replies, both automated confirmations) had been moved onto the
 * client's chosen 'light-editorial' theme, but the internal ones were still raw
 * `<h2>` + bare `<table>` markup with no logo, no brand colour and no footer — so the
 * team's own inbox was the one place Atlas South mail didn't look like Atlas South.
 *
 * Deliberately the same `lightEditorialShell` as everything else rather than a separate
 * "internal" style: the client's instruction was that every email carry the theme, and a
 * second template would be one more thing to keep in sync the next time the brand moves.
 * The content differs (a scannable label/value table rather than prose), the shell does not.
 */
export function renderInternalNotificationEmail(data: InternalNotificationData): string {
  const rows = data.rows
    .map(
      (row) => `
      <tr>
        <td style="padding:10px 12px 10px 0;font-size:13px;font-weight:bold;color:${BRAND.slate};width:150px;vertical-align:top;border-bottom:1px solid ${BRAND.border};">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;font-size:14px;color:${BRAND.ink};border-bottom:1px solid ${BRAND.border};">${row.valueHtml}</td>
      </tr>`,
    )
    .join('');

  const body = `
    <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:${BRAND.ink};">${escapeHtml(data.title)}</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${BRAND.slate};">${escapeHtml(data.intro)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>
    ${
      data.footnote
        ? `<p style="margin:20px 0 0;padding:12px 14px;background:${BRAND.canvasTint};border-left:3px solid ${BRAND.accentBlue};font-size:13px;line-height:1.6;color:${BRAND.ink};">${escapeHtml(data.footnote)}</p>`
        : ''
    }`;

  const cta = data.reference
    ? `<p style="margin:0;font-size:12px;color:${BRAND.slate};">${escapeHtml(data.reference)}</p>`
    : '';

  return lightEditorialShell(body, cta);
}
