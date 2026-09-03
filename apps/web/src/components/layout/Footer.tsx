import { useState } from 'react';
import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import {
  COMPANY,
  COMPANY_PAGES,
  HARD_SERVICES,
  SOFT_SERVICES,
  INDUSTRIES,
  SERVICE_AREAS,
  LEGAL_PAGES,
  type NavItem,
} from '@atlas-south/shared';
import { Icon, useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';
import { useNavVisibility } from '../../hooks/useNavVisibility.js';
import { openCookieSettings } from '../../lib/cookieSettingsBus.js';
import { trackPhoneClick, trackWhatsAppClick } from '../../lib/analytics.js';

interface ColumnProps {
  title: string;
  items: (NavItem | { id: string; label: string; path: string; onClick?: () => void })[];
}

/** Desktop column / mobile accordion — docs/build/04-FOOTER-SPEC.md §5. */
function FooterColumn({ title, items }: ColumnProps) {
  const [expanded, setExpanded] = useState(false);
  const { hidden } = useNavVisibility();

  // Same filtering as the header, applied here so a hidden page can't still be reached
  // from the footer — the audit's dead-link finding was largely a header/footer drift
  // problem, and this keeps the two in step by construction. Placeholder ("Coming Soon")
  // items are excluded too — the client doesn't want them visible at all, and this column
  // previously only filtered admin-hidden items, not placeholders, so every unbuilt
  // service/industry was still linked from here regardless of that setting.
  const visibleItems = items.filter((item) => !hidden.has(item.id) && !('placeholder' in item && item.placeholder));

  return (
    <nav aria-label={`Footer — ${title}`} className="border-b border-white/10 py-4 lg:border-0 lg:py-0">
      <h3 className="lg:mb-3">
        <button
          type="button"
          className="flex w-full min-h-[44px] items-center justify-between text-left text-sm font-semibold uppercase tracking-wide text-white lg:pointer-events-none lg:min-h-0"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {title}
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} className="lg:hidden" />
        </button>
      </h3>
      <ul className={`${expanded ? 'block' : 'hidden'} lg:block`}>
        {visibleItems.map((item) => (
          <li key={item.id}>
            <Link
              to={item.path}
              className="flex min-h-[44px] items-center text-sm text-white/70 hover:text-accent-blue lg:min-h-0 lg:py-1"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Brand SVG paths — lucide-react carries no brand icons, so we inline them directly. */
const SOCIAL_ICONS: Record<
  string,
  { label: string; path: string | string[]; viewBox?: string; color: string; fillIcon?: boolean }
> = {
  'https://www.tiktok.com/@atlassouthes': {
    label: 'TikTok',
    color: '#010101',
    path: 'M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5',
    viewBox: '0 0 24 24',
  },
  // The old outline (two crossing diagonal strokes) read as a "close/exit" glyph rather
  // than the X brand mark — a plain X-shape drawn with stroke lines is visually
  // indistinguishable from a dismiss/cancel icon. This is the actual X logo (solid glyph,
  // not an outline), so it needs `fillIcon: true` to render filled instead of stroked —
  // see the fillIcon branch in SocialBar below.
  'https://x.com/SouthAtlas': {
    label: 'X (Twitter)',
    color: '#000000',
    fillIcon: true,
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z',
    viewBox: '0 0 24 24',
  },
  'https://www.instagram.com/atlassouthes/': {
    label: 'Instagram',
    color: '#E1306C',
    // rect + circle + dot
    path: [
      'M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z',
      'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
      'M17.5 6.5a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1z',
    ],
    viewBox: '0 0 24 24',
  },
  'https://www.facebook.com/atlassouthes24/': {
    label: 'Facebook',
    color: '#1877F2',
    path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
    viewBox: '0 0 24 24',
  },
  'https://www.linkedin.com/company/108248390/': {
    label: 'LinkedIn',
    color: '#0A66C2',
    path: [
      'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z',
      'M2 9h4v12H2z',
      'M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    ],
    viewBox: '0 0 24 24',
  },
};

function SocialBar() {
  return (
    <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
      <span className="mr-2 text-xs font-semibold uppercase tracking-widest text-white/40">Follow us</span>
      {COMPANY.socialProfiles.map((url) => {
        const meta = SOCIAL_ICONS[url];
        if (!meta) return null;
        const paths = Array.isArray(meta.path) ? meta.path : [meta.path];
        return (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={meta.label}
            className="social-icon group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/5 transition-all duration-300 hover:border-transparent hover:shadow-lg"
            style={
              {
                '--brand': meta.color,
              } as React.CSSProperties
            }
          >
            {/* Brand colour fill that sweeps up on hover — Option B theming */}
            <span
              aria-hidden="true"
              className="absolute inset-0 translate-y-full rounded-full transition-transform duration-300 ease-out group-hover:translate-y-0"
              style={{ backgroundColor: meta.color }}
            />
            <svg
              viewBox={meta.viewBox ?? '0 0 24 24'}
              width={18}
              height={18}
              fill={meta.fillIcon ? 'currentColor' : 'none'}
              stroke={meta.fillIcon ? 'none' : 'currentColor'}
              strokeWidth={meta.fillIcon ? undefined : 1.8}
              strokeLinecap={meta.fillIcon ? undefined : 'round'}
              strokeLinejoin={meta.fillIcon ? undefined : 'round'}
              className="relative z-10 text-white/70 transition-colors duration-150 group-hover:text-white"
              aria-hidden="true"
            >
              {paths.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </svg>
          </a>
        );
      })}
    </div>
  );
}

export function Footer() {
  const root = useAnimationScope((self) => {
    self?.add('reveal', () => {
      animate('.footer-nav-col', {
        opacity: [0, 1],
        translateY: [24, 0],
        delay: stagger(STAGGER_GAP),
        duration: DURATION.slow,
        ease: EASE.standard,
      });
    });
  }, []);

  const companyColumnItems = [...COMPANY_PAGES];

  const legalConnectItems = [
    ...LEGAL_PAGES,
    { id: 'phone', label: `Call ${COMPANY.phone.display}`, path: '/company/contact' },
    { id: 'email', label: COMPANY.email, path: '/company/contact' },
  ];

  return (
    <footer aria-label="Site footer" className="bg-navy text-white" data-widget-theme="dark">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Trust bar — docs/build/04-FOOTER-SPEC.md §3 */}
        <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-white/10 pb-8 text-sm text-white/80">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {/* Light variants, not the default symbol.svg/wordmark.svg + a CSS invert
                  filter: symbol.svg's dark path is navy (#002484) — the exact same navy
                  as this footer's own background, so on a filter-less default it simply
                  disappeared. symbol-light.svg/wordmark-light.svg are real recolored
                  files made for dark backgrounds, not a filter hack layered on top. */}
              <img src="/brand/symbol-light.svg" alt="" aria-hidden="true" className="h-8 w-auto" />
              <img src="/brand/wordmark-light.svg" alt={COMPANY.name} className="h-6 w-auto" />
            </div>
            {/* "Technical Service" slogan, from the descriptor bar in the source logo
                (public/brand/tagline.svg) — set as text here rather than the SVG so it
                inherits the footer's text color and sizing like everything around it. */}
            <p className="pl-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Technical Service
            </p>
          </div>
          <a
            href={`tel:${COMPANY.phone.tel}`}
            onClick={() => trackPhoneClick('footer')}
            className="flex items-center gap-2 hover:text-accent-blue"
          >
            <Icon name="phone" size={16} />
            {COMPANY.phone.display}
          </a>
          {/* Reinstates the "WhatsApp + phone repeated throughout" pattern the
              pre-rebuild site's own audit flagged as a genuine strength — see the longer
              note beside the header's WhatsApp link in Header.tsx. */}
          <a
            href={COMPANY.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('footer')}
            className="flex items-center gap-2 hover:text-accent-blue"
          >
            <Icon name="message-circle" size={16} />
            WhatsApp Us
          </a>
          <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-2 hover:text-accent-blue">
            <Icon name="mail" size={16} />
            {COMPANY.email}
          </a>
          <span className="flex items-center gap-2">
            <Icon name="map-pin" size={16} />
            {COMPANY.address.line1}, {COMPANY.address.line2}, {COMPANY.address.city} {COMPANY.address.postalCode}
          </span>
        </div>
        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          {COMPANY.certifications.map((cert) => (
            <span key={cert} className="flex items-center gap-2">
              <Icon name="badge-check" size={16} />
              {cert}
            </span>
          ))}
          <span className="flex items-center gap-2">
            <Icon name="shield-check" size={16} />
            {COMPANY.publicLiabilityInsurance} Public Liability Insurance
          </span>
        </div>

        {/* Column grid — docs/build/04-FOOTER-SPEC.md §2 */}
        <div ref={root} className="grid grid-cols-1 gap-6 lg:grid-cols-6 lg:gap-8">
          <div className="footer-nav-col">
            <FooterColumn title="Company" items={companyColumnItems} />
          </div>
          <div className="footer-nav-col">
            <FooterColumn title="Hard Services" items={HARD_SERVICES} />
          </div>
          <div className="footer-nav-col">
            <FooterColumn title="Soft Services" items={SOFT_SERVICES} />
          </div>
          <div className="footer-nav-col">
            <FooterColumn title="Industries" items={INDUSTRIES} />
          </div>
          <div className="footer-nav-col">
            <FooterColumn title="Areas We Cover" items={SERVICE_AREAS} />
          </div>
          <div className="footer-nav-col">
            <FooterColumn title="Legal & Connect" items={legalConnectItems} />
          </div>
        </div>

        {/* Social icon bar */}
        <SocialBar />

        {/* Bottom bar — docs/build/04-FOOTER-SPEC.md §4 */}
        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            {LEGAL_PAGES.map((p) => (
              <Link key={p.id} to={p.path} className="hover:text-accent-blue">
                {p.label}
              </Link>
            ))}
            {/* Reopens the preferences panel with the visitor's current choices. Required
                in practice, not just nice to have: consent has to be as easy to withdraw as
                it was to give, which means a permanent, findable control — not a one-time
                banner that disappears once answered. */}
            <button
              type="button"
              onClick={openCookieSettings}
              className="text-left hover:text-accent-blue"
            >
              Cookie settings
            </button>
          </div>
        </div>
      </div>

      {/* LocalBusiness schema — docs/build/04-FOOTER-SPEC.md §6.
       *
       * Upgraded from plain `Organization` to `ProfessionalService` (a LocalBusiness
       * subtype) on 2026-09-03, as the on-site half of the Google Business Profile work.
       * `Organization` is the generic company type and carries no local-search meaning;
       * `LocalBusiness` and its subtypes are what Google reads for a business that serves
       * a place, and it cross-references these fields against the Business Profile. The
       * NAP here and the NAP on the Profile must agree exactly — a mismatched phone or
       * street line is one of the most common reasons a local listing underperforms.
       *
       * Everything below is a fact the site already states elsewhere. Two fields Google
       * accepts are deliberately ABSENT rather than guessed:
       *   - `geo`: precise coordinates would have to be invented, and a wrong lat/long
       *     drops the map pin on the wrong building. Google geocodes the postal address
       *     perfectly well without it.
       *   - `priceRange`: no published pricing exists to base it on, and this site
       *     deliberately carries no pricing at all (client decision, 2026-08-24).
       *
       * sameAs stays empty until real social profile URLs are confirmed
       * (docs/build/13-COMPANY-FACTS-VERIFIED.md). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            // A stable @id lets other structured data on the site point at this same
            // entity rather than describing a second, unrelated company.
            '@id': `https://www.${COMPANY.domain}/#organization`,
            name: COMPANY.name,
            url: `https://www.${COMPANY.domain}`,
            logo: `https://www.${COMPANY.domain}/atlas-south-logo.jpg`,
            image: `https://www.${COMPANY.domain}/atlas-south-logo.jpg`,
            telephone: COMPANY.phone.tel,
            email: COMPANY.email,
            foundingDate: String(COMPANY.foundedYear),
            address: {
              '@type': 'PostalAddress',
              streetAddress: `${COMPANY.address.line1}, ${COMPANY.address.line2}`,
              addressLocality: COMPANY.address.city,
              postalCode: COMPANY.address.postalCode,
              addressCountry: COMPANY.address.country,
            },
            // The areas the site's own Service Areas section already lists.
            areaServed: SERVICE_AREAS.map((area) => ({ '@type': 'Place', name: area.label })),
            // Mirrors the "Available 24/7" claim the homepage hero has carried since
            // launch — not a new assertion, and it must stay true of the phone line.
            openingHoursSpecification: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ],
              opens: '00:00',
              closes: '23:59',
            },
            sameAs: COMPANY.socialProfiles,
          }),
        }}
      />
    </footer>
  );
}
