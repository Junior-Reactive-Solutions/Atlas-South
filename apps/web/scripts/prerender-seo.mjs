#!/usr/bin/env node
/**
 * Bakes a real, per-page <title> and Open Graph/Twitter Card meta into the static build —
 * client-side link previews were never getting written into the HTML at all.
 *
 * The problem this fixes: Seo.tsx (apps/web/src/components/seo/Seo.tsx) sets
 * document.title and injects <meta> tags via a React useEffect, which only runs once
 * JavaScript executes in a real browser. Link-preview crawlers (X/Twitter, WhatsApp,
 * Facebook, iMessage, Slack, Discord) fetch the raw HTML and do NOT run React — every one
 * of them only ever saw index.html's single static <title>Atlas South Technical
 * Services</title> and zero Open Graph or Twitter Card tags, regardless of which page's
 * URL was shared. Every shared link, for every page on the site, showed the same generic
 * title card with no description or image.
 *
 * The fix is build-time prerendering, not a runtime middleware: this script runs after
 * `vite build`, reads the already-built dist/index.html (which already references the
 * correct content-hashed JS/CSS asset paths — nothing about those changes), and writes a
 * copy of it at dist/<path>/index.html for every route in SEO_ROUTES below, with that
 * route's own <title> and meta tags swapped in. Vercel's routing resolves a real static
 * file before it falls through to the SPA catch-all rewrite (`vercel.json`'s
 * `"source": "/((?!api).*)", "destination": "/index.html"` only fires when no file exists
 * at that path) — so a crawler requesting /hard-services/electricals gets a real HTML file
 * with that page's own title/description/image already in the markup, while a real
 * visitor's browser boots the exact same SPA bundle from that file and React Router takes
 * over from there, indistinguishable from the plain index.html case.
 *
 * The root path "/" is handled by editing dist/index.html itself, not a subfolder, since
 * that IS the file Vercel serves for "/".
 *
 * Source of metadata: @atlas-south/shared's EXTRACTED_PAGES (25 service/industry/area
 * pages, already carrying `seoTitle`/`heroDescription`) plus CAREERS_CONTENT.openRoles for
 * career detail pages, plus a small hand-maintained list of static pages below — matching
 * exactly the title/description each page's own <Seo> component already renders, so the
 * prerendered card and the client-side-hydrated tags never disagree.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXTRACTED_PAGES, CAREERS_CONTENT, COMPANY, PAGE_SEO, SITE_ORIGIN } from '@atlas-south/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SITE_NAME = COMPANY.name;
const SITE_URL = SITE_ORIGIN; // see the note on SITE_ORIGIN in packages/shared — atlassouthes.com still serves the old site

/**
 * Static pages — every entry comes straight from PAGE_SEO in @atlas-south/shared, which is
 * the same object each page component spreads into its own <Seo/>. That shared source is
 * what guarantees the prerendered card and the post-hydration client tags can't disagree.
 *
 * This list used to be hand-maintained here, duplicating each string from its component —
 * and it had already drifted: the three legal pages shipped one description client-side and
 * a shorter, differently-worded stub in the prerendered HTML that crawlers actually read.
 */
const STATIC_ROUTES = Object.values(PAGE_SEO);

function contentRoutes() {
  return EXTRACTED_PAGES.map((page) => {
    const data = page.data;
    return {
      path: page.path,
      title: data.seoTitle || data.title,
      // Same precedence the three detail templates apply — hero copy is on-page prose and
      // is routinely far outside the length a preview can show.
      description: data.seoDescription || data.heroDescription,
    };
  });
}

function careerRoutes() {
  return CAREERS_CONTENT.openRoles
    .filter((role) => role.slug)
    .map((role) => ({
      path: `/company/join-us/${role.slug}`,
      title: role.title,
      // Same precedence CareerDetail.tsx uses. `summary` is the listing-card teaser and
      // runs 200+ chars, so it is only the fallback.
      description:
        role.seoDescription || role.summary || role.roleOverview || `${role.title} — join the Atlas South team in London.`,
    }));
}

function upsertMetaTag(html, attr, key, content) {
  const escaped = content.replace(/"/g, '&quot;');
  const pattern = new RegExp(`<meta ${attr}="${key}"[^>]*>`, 'i');
  const tag = `<meta ${attr}="${key}" content="${escaped}" />`;
  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function renderPage(template, route) {
  const fullTitle = route.titleIncludesSiteName ? route.title : `${route.title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${route.path}`;
  const image = `${SITE_URL}/og-image.png`;

  let html = template;
  html = html.replace(/<title>.*?<\/title>/i, `<title>${fullTitle.replace(/&/g, '&amp;')}</title>`);
  html = upsertMetaTag(html, 'name', 'description', route.description);
  html = upsertMetaTag(html, 'property', 'og:title', fullTitle);
  html = upsertMetaTag(html, 'property', 'og:description', route.description);
  html = upsertMetaTag(html, 'property', 'og:image', image);
  html = upsertMetaTag(html, 'property', 'og:image:width', '1200');
  html = upsertMetaTag(html, 'property', 'og:image:height', '630');
  html = upsertMetaTag(html, 'property', 'og:url', url);
  html = upsertMetaTag(html, 'property', 'og:type', 'website');
  html = upsertMetaTag(html, 'property', 'og:site_name', SITE_NAME);
  html = upsertMetaTag(html, 'name', 'twitter:card', 'summary_large_image');
  html = upsertMetaTag(html, 'name', 'twitter:title', fullTitle);
  html = upsertMetaTag(html, 'name', 'twitter:description', route.description);
  html = upsertMetaTag(html, 'name', 'twitter:image', image);

  // Canonical link — add if absent, replace if a client build ever adds a placeholder one.
  const canonicalTag = `<link rel="canonical" href="${url}" />`;
  if (/<link rel="canonical"[^>]*>/i.test(html)) {
    html = html.replace(/<link rel="canonical"[^>]*>/i, canonicalTag);
  } else {
    html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);
  }

  return html;
}

async function main() {
  if (!existsSync(DIST_DIR)) {
    console.error(`prerender-seo: dist/ not found at ${DIST_DIR} — run vite build first.`);
    process.exit(1);
  }

  const templatePath = path.join(DIST_DIR, 'index.html');
  const template = await readFile(templatePath, 'utf8');

  const routes = [...STATIC_ROUTES.filter((r) => r.path !== '/'), ...contentRoutes(), ...careerRoutes()];

  // Root path rewrites dist/index.html itself — that IS the file Vercel serves for "/".
  const home = STATIC_ROUTES.find((r) => r.path === '/');
  await writeFile(templatePath, renderPage(template, home), 'utf8');

  let written = 0;
  for (const route of routes) {
    const outDir = path.join(DIST_DIR, route.path.replace(/^\//, ''));
    const outFile = path.join(outDir, 'index.html');
    await mkdir(outDir, { recursive: true });
    await writeFile(outFile, renderPage(template, route), 'utf8');
    written += 1;
  }

  console.log(`prerender-seo: wrote ${written + 1} pages with page-specific <title>/OG/Twitter meta.`);
}

main().catch((err) => {
  console.error('prerender-seo failed:', err);
  process.exit(1);
});
