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
import { EXTRACTED_PAGES, CAREERS_CONTENT, COMPANY } from '@atlas-south/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const SITE_NAME = COMPANY.name;
const SITE_URL = `https://${COMPANY.domain}`;

/**
 * Static pages — title/description here must match what each page's own <Seo
 * title=... description=.../> renders (apps/web/src/pages/**), so the prerendered card
 * and the post-hydration client tags never disagree.
 */
const STATIC_ROUTES = [
  {
    path: '/',
    title: 'Trades & Facilities Services in London & the South East',
    description:
      'Atlas South delivers electrical, plumbing, fire safety and full facilities management for commercial buildings across London and the South East. 24/7 emergency cover.',
  },
  {
    path: '/company',
    title: 'About Us — Trusted London Facilities Partner',
    description:
      "Founded in 2018, Atlas South has grown into London's full-service facilities company. Meet our team, learn our story.",
  },
  {
    path: '/company/vision-mission',
    title: 'Our Vision & Mission — Trusted Facilities Partner',
    description:
      'Our vision is to be the most trusted facilities partner for organisations where standards and compliance are always on the line. Our mission drives every job we deliver.',
  },
  {
    path: '/company/contact',
    title: 'Contact Us — Get a Free Quote',
    description: 'Get in touch with Atlas South for a free quote. 24/7 emergency line, or fill out our contact form and we\'ll respond within 24 hours.',
  },
  {
    path: '/company/join-us',
    title: 'Careers — Facilities & Trades Jobs in London',
    description: "Grow with Atlas South. We're hiring talented professionals to join our London-based team.",
  },
  {
    path: '/legal/privacy',
    title: 'Privacy Policy',
    description: 'How Atlas South Technical Services collects, uses and protects your personal data.',
  },
  {
    path: '/legal/terms',
    title: 'Terms of Use',
    description: 'The terms and conditions governing use of the Atlas South Technical Services website and services.',
  },
  {
    path: '/legal/cookies',
    title: 'Cookie Policy',
    description: 'How Atlas South Technical Services uses cookies on this website.',
  },
];

function contentRoutes() {
  return EXTRACTED_PAGES.map((page) => {
    const data = page.data;
    return {
      path: page.path,
      title: data.seoTitle || data.title,
      description: data.heroDescription,
    };
  });
}

function careerRoutes() {
  return CAREERS_CONTENT.openRoles
    .filter((role) => role.slug)
    .map((role) => ({
      path: `/company/join-us/${role.slug}`,
      title: role.title,
      description: role.summary || role.roleOverview || `${role.title} — join the Atlas South team in London.`,
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
  const fullTitle = `${route.title} | ${SITE_NAME}`;
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
