import { useEffect } from 'react';
import { COMPANY } from '@atlas-south/shared';

/**
 * Per-page SEO metadata — docs/build/09-SEO-PERFORMANCE-CHECKLIST.md §2 and
 * docs/build/06-PAGE-SPECIFICATIONS.md's mandatory <head> checklist. Every content page
 * renders one of these with its own title/description/JSON-LD; this is the single place
 * that turns "unique title, unique description, canonical, OG, Twitter Card, JSON-LD" from
 * a per-page manual checklist into a shared, structurally-enforced component instead.
 *
 * No react-helmet dependency — plain DOM tag management via useEffect, matching the
 * lightweight approach already used by useNoIndex. Tags are created on mount and removed
 * on unmount/re-render so navigating between pages never leaves a stale previous page's
 * tags behind.
 */

const SITE_NAME = COMPANY.name;
const SITE_URL = `https://${COMPANY.domain}`;

export interface SeoProps {
  /** ≤60 characters, primary keyword near the front — checklist §2. Site name is appended automatically. */
  title: string;
  /**
   * Set when `title` already leads with the company name, so it's used verbatim instead of
   * having " | Atlas South Technical Services" appended to it a second time.
   *
   * The homepage is the only page that does this — it uses the brand-first title format the
   * client's previous site established (see HOME_SEO in packages/shared), while every
   * interior page keeps the keyword-first/brand-last order.
   */
  titleIncludesSiteName?: boolean;
  /** 140–160 characters — checklist §2. */
  description: string;
  /** Path only, e.g. "/hard-services/electricals" — the canonical/OG URL is built from this + the site origin. */
  path: string;
  /** Absolute image URL for og:image/twitter:image. Falls back to the site's default share image. */
  image?: string;
  /** One or more JSON-LD objects to embed as <script type="application/ld+json"> blocks. */
  jsonLd?: object | object[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): HTMLMetaElement {
  const el = document.createElement('meta');
  el.setAttribute(attr, key);
  el.setAttribute('content', content);
  document.head.appendChild(el);
  return el;
}

export function Seo({ title, titleIncludesSiteName, description, path, image, jsonLd }: SeoProps) {
  useEffect(() => {
    const fullTitle = titleIncludesSiteName ? title : `${title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${path}`;
    const shareImage = image ?? `${SITE_URL}/og-image.png`;

    const previousTitle = document.title;
    document.title = fullTitle;

    const createdElements: HTMLElement[] = [];

    // Canonical
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = url;
    document.head.appendChild(canonical);
    createdElements.push(canonical);

    // Standard + Open Graph + Twitter meta
    createdElements.push(
      upsertMeta('name', 'description', description),
      upsertMeta('property', 'og:title', fullTitle),
      upsertMeta('property', 'og:description', description),
      upsertMeta('property', 'og:image', shareImage),
      upsertMeta('property', 'og:image:width', '1200'),
      upsertMeta('property', 'og:image:height', '630'),
      upsertMeta('property', 'og:url', url),
      upsertMeta('property', 'og:type', 'website'),
      upsertMeta('property', 'og:site_name', SITE_NAME),
      upsertMeta('name', 'twitter:card', 'summary_large_image'),
      upsertMeta('name', 'twitter:title', fullTitle),
      upsertMeta('name', 'twitter:description', description),
      upsertMeta('name', 'twitter:image', shareImage),
    );

    // JSON-LD
    const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
    for (const schema of schemas) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      createdElements.push(script);
    }

    return () => {
      document.title = previousTitle;
      createdElements.forEach((el) => el.remove());
    };
  }, [title, titleIncludesSiteName, description, path, image, jsonLd]);

  return null;
}
