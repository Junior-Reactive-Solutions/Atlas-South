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

const BRAND = {
  navy: '#002484',
  navyDeep: '#0A2472',
  accentBlue: '#0062D6', // the only blue verified AA-accessible for text — see tailwind.config.js
  ink: '#0B1220',
  slate: '#47547A',
  canvasTint: '#F5F8FD',
  border: '#DCE3F0',
};

/** Hosted at the production web origin — email clients can't resolve a relative path. */
const LOGO_URL = 'https://atlassouthes.com/atlas-south-logo.jpg';
const SITE_URL = 'https://atlassouthes.com';

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

function escapeHtml(text: string): string {
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
 */
function lightEditorial(data: ReplyEmailData): string {
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
          <p style="margin:0 0 20px;font-size:16px;color:${BRAND.ink};">Hi ${escapeHtml(data.recipientFirstName)},</p>
          <div style="font-size:15px;line-height:1.6;color:${BRAND.ink};">${messageToHtml(data.message)}</div>
          <p style="margin:24px 0 0;font-size:15px;color:${BRAND.ink};">
            Best,<br /><strong>The Atlas South Team</strong>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px 32px;">
          <a href="${SITE_URL}/company/contact" style="color:${BRAND.accentBlue};text-decoration:underline;font-weight:bold;font-size:14px;">Get in touch →</a>
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
