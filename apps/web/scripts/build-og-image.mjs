#!/usr/bin/env node
/**
 * Regenerates public/og-image.png — the 1200x630 card shown when a link to this site is
 * shared (WhatsApp, X, Facebook, iMessage, Slack, LinkedIn) or displayed by Google.
 *
 * Why a script rather than a hand-exported image: the previous og-image.png was set in a
 * generic system sans-serif and carried no logo at all — just the words "ATLAS SOUTH" typed
 * out. The brand mark and wordmark already exist as vectors in public/brand/, so composing
 * the card from those sources means the shared card always matches the real logo, and
 * re-running this after a brand tweak takes one command instead of a manual re-export.
 *
 * How it rasterizes: no image-processing package is installed in this environment (see the
 * same note in build-favicon-ico.mjs) and none is needed — the favicons were already
 * rasterized from these same SVGs using Chrome's own renderer. This automates exactly that:
 * it writes a temporary HTML file that lays the card out, then drives an installed
 * Chrome/Edge in headless mode to screenshot it at exactly 1200x630.
 *
 *   node scripts/build-og-image.mjs
 *
 * The brand lettering comes from wordmark-light.svg rather than live web-font text, so the
 * output does not depend on Google Fonts being reachable at build time and the letterforms
 * are guaranteed to be the real wordmark. Only the tagline uses a font, with a system-sans
 * fallback that degrades acceptably.
 *
 * This is NOT wired into `npm run build`. The card changes only when the brand or the
 * tagline changes, and a build step that shells out to a browser would be a fragile thing to
 * put in CI. Run it by hand and commit the resulting PNG.
 */
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const BRAND_DIR = path.join(PUBLIC_DIR, 'brand');
const OUT = path.join(PUBLIC_DIR, 'og-image.png');

const WIDTH = 1200;
const HEIGHT = 630;

// Brand palette — docs/build/01-BRAND-SYSTEM.md. Navy is the card ground; accent-blue is
// the only other colour, used as a thin rule so the card reads as brand rather than as a
// plain blue rectangle.
const NAVY = '#002484';
const ACCENT = '#0062D6';

const BROWSERS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

function findBrowser() {
  const found = BROWSERS.find((b) => existsSync(b));
  if (!found) {
    console.error(
      'build-og-image: no Chrome or Edge found. Install one, or add its path to BROWSERS in this script.'
    );
    process.exit(1);
  }
  return found;
}

/** Inline an SVG file as a data URI so the headless render needs no file:// sub-requests. */
function svgDataUri(file) {
  const svg = readFileSync(path.join(BRAND_DIR, file), 'utf8');
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

const symbol = svgDataUri('symbol-light.svg');
const wordmark = svgDataUri('wordmark-light.svg');

const TAGLINE = 'Facilities management across London & the South East';

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @page { margin: 0; }
  html, body { margin: 0; padding: 0; background: ${NAVY}; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    display: flex; flex-direction: column; justify-content: center;
    box-sizing: border-box; padding: 0 92px;
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    overflow: hidden;
  }
  /* Thin accent rule down the left edge — the one non-navy element, so the card is
     recognisably branded even as a small thumbnail. */
  .edge { position: fixed; left: 0; top: 0; bottom: 0; width: 14px; background: ${ACCENT}; }
  .lockup { display: flex; align-items: center; gap: 34px; }
  .symbol { height: 132px; width: auto; display: block; }
  .wordmark { height: 62px; width: auto; display: block; }
  .rule { width: 190px; height: 3px; background: ${ACCENT}; margin: 40px 0 34px; border-radius: 2px; }
  .tagline { color: #fff; font-size: 37px; line-height: 1.28; font-weight: 600; letter-spacing: -0.01em; max-width: 900px; }
  .domain { position: fixed; left: 92px; bottom: 54px; color: rgba(255,255,255,.62);
            font-size: 25px; letter-spacing: .085em; text-transform: uppercase; font-weight: 600; }
</style></head>
<body>
  <div class="edge"></div>
  <div class="lockup">
    <img class="symbol" src="${symbol}" alt="">
    <img class="wordmark" src="${wordmark}" alt="">
  </div>
  <div class="rule"></div>
  <div class="tagline">${TAGLINE}</div>
  <div class="domain">atlassouthes.com</div>
</body></html>`;

const tmp = mkdtempSync(path.join(tmpdir(), 'og-'));
const htmlPath = path.join(tmp, 'card.html');
writeFileSync(htmlPath, html, 'utf8');

const browser = findBrowser();
try {
  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--default-background-color=00000000',
      `--screenshot=${OUT}`,
      `--window-size=${WIDTH},${HEIGHT}`,
      `file://${htmlPath.replace(/\\/g, '/')}`,
    ],
    { stdio: 'pipe' }
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

if (!existsSync(OUT)) {
  console.error('build-og-image: the browser exited without writing', OUT);
  process.exit(1);
}
const { size } = await import('node:fs').then((fs) => fs.statSync(OUT));
console.log(`build-og-image: wrote ${path.relative(process.cwd(), OUT)} (${WIDTH}x${HEIGHT}, ${Math.round(size / 1024)} KB)`);
