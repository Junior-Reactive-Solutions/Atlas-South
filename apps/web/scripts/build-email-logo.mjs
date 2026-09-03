/**
 * Generates public/email-logo.png — the logo used in every email the site sends.
 *
 * WHY THIS EXISTS: the emails were showing `public/atlas-south-logo.jpg`, a raster of the
 * OLD logo dating from before the current brand was applied. The live site uses
 * `public/brand/symbol.svg` + `public/brand/wordmark.svg`, so every enquiry confirmation,
 * application confirmation and admin reply went out carrying a logo the website itself no
 * longer uses.
 *
 * WHY A PNG AND NOT THE SVG: Outlook desktop renders email HTML with Word's engine, which
 * does not support SVG at all — the image simply fails to appear. Email needs a raster, so
 * the brand SVGs are rasterised here rather than referenced directly.
 *
 * WHY 2x: email clients and modern displays render at higher pixel density, and the theme
 * sizes this image down to ~170px wide in the message. Generating it at double that keeps
 * it sharp instead of soft on a retina screen.
 *
 * Rasterised with headless Chrome, the same approach (and browser discovery) as
 * build-og-image.mjs — no image library dependency to install or keep current.
 *
 * Run: npm run build:email-logo --workspace=apps/web
 */
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');
const OUT = path.join(PUBLIC, 'email-logo.png');

// Rendered size in the email is ~170px wide; 2x for display density.
const WIDTH = 680;
const HEIGHT = 150;

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
      'build-email-logo: no Chrome or Edge found. Install one, or add its path to BROWSERS in this script.',
    );
    process.exit(1);
  }
  return found;
}

const symbol = readFileSync(path.join(PUBLIC, 'brand', 'symbol.svg'), 'utf8');
const wordmark = readFileSync(path.join(PUBLIC, 'brand', 'wordmark.svg'), 'utf8');

// Inlined as data URIs rather than <img src="brand/symbol.svg">, so the render doesn't
// depend on relative path resolution inside the temp directory.
const asDataUri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;

// White ground, not transparent: the email theme places this logo on a white card, and a
// transparent PNG would render with a black halo in the handful of older clients that
// don't composite alpha correctly.
const html = `<!doctype html>
<html><head><meta charset="utf-8" /><style>
  html, body { margin: 0; padding: 0; background: #FFFFFF; }
  .row { display: flex; align-items: center; gap: 28px; height: ${HEIGHT}px; padding: 0 8px; }
  .symbol { height: 104px; width: auto; display: block; }
  .wordmark { height: 46px; width: auto; display: block; }
</style></head>
<body>
  <div class="row">
    <img class="symbol" src="${asDataUri(symbol)}" alt="" />
    <img class="wordmark" src="${asDataUri(wordmark)}" alt="" />
  </div>
</body></html>`;

const tmp = mkdtempSync(path.join(tmpdir(), 'email-logo-'));
const htmlPath = path.join(tmp, 'logo.html');
writeFileSync(htmlPath, html, 'utf8');

const browser = findBrowser();
try {
  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      `--screenshot=${OUT}`,
      `--window-size=${WIDTH},${HEIGHT}`,
      `file://${htmlPath.replace(/\\/g, '/')}`,
    ],
    { stdio: 'pipe' },
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

if (!existsSync(OUT)) {
  console.error('build-email-logo: the browser exited without writing', OUT);
  process.exit(1);
}

console.log(`build-email-logo: wrote ${path.relative(process.cwd(), OUT)} (${statSync(OUT).size} bytes)`);
