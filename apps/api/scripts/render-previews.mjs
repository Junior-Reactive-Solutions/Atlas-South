// Dev utility: prints the raw HTML for all three admin-reply email themes
// (lib/emailThemes.ts) against one sample message — used to generate the preview shown
// to the client for picking a theme, and useful again any time the templates change and
// need a quick visual re-check without an actual send. Run with `npx tsx
// scripts/render-previews.mjs` from apps/api.
import { renderReplyEmail } from '../src/lib/emailThemes.ts';

const sample = {
  recipientFirstName: 'James',
  subject: 'Re: your enquiry with Atlas South',
  message:
    "Thanks for reaching out about facilities management for your Central London office.\n\nWe'd love to put together a proposal — could you let us know your site's approximate square footage and current cleaning schedule? Once we have that we can turn a quote around within 24 hours.\n\nLooking forward to hearing from you.",
};

for (const theme of ['navy-header', 'light-editorial', 'brand-sandwich']) {
  console.log(`===THEME:${theme}===`);
  console.log(renderReplyEmail(theme, sample));
  console.log(`===END:${theme}===`);
}
