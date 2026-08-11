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

interface ColumnProps {
  title: string;
  items: (NavItem | { id: string; label: string; path: string; onClick?: () => void })[];
}

/** Desktop column / mobile accordion — docs/build/04-FOOTER-SPEC.md §5. */
function FooterColumn({ title, items }: ColumnProps) {
  const [expanded, setExpanded] = useState(false);

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
        {items.map((item) => (
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
    <footer aria-label="Site footer" className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Trust bar — docs/build/04-FOOTER-SPEC.md §3 */}
        <div className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-white/10 pb-8 text-sm text-white/80">
          <div className="flex items-center gap-2 font-display text-lg uppercase text-white">
            <img src="/atlas-south-logo.jpg" alt="" aria-hidden="true" className="h-8 w-auto" />
            {COMPANY.name}
          </div>
          <a href={`tel:${COMPANY.phone.tel}`} className="flex items-center gap-2 hover:text-accent-blue">
            <Icon name="phone" size={16} />
            {COMPANY.phone.display}
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

        {/* Bottom bar — docs/build/04-FOOTER-SPEC.md §4 */}
        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <div className="flex gap-4">
            {LEGAL_PAGES.map((p) => (
              <Link key={p.id} to={p.path} className="hover:text-accent-blue">
                {p.label}
              </Link>
            ))}
          </div>
          <p>
            Site by{' '}
            <a
              href="https://jrcom.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-blue"
            >
              Junior Reactive Solutions
            </a>
          </p>
        </div>
      </div>

      {/* Organization schema — docs/build/04-FOOTER-SPEC.md §6. sameAs stays empty
          until real social profile URLs are confirmed (docs/build/13-COMPANY-FACTS-VERIFIED.md). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: COMPANY.name,
            url: `https://www.${COMPANY.domain}`,
            telephone: COMPANY.phone.tel,
            email: COMPANY.email,
            address: {
              '@type': 'PostalAddress',
              streetAddress: `${COMPANY.address.line1}, ${COMPANY.address.line2}`,
              addressLocality: COMPANY.address.city,
              postalCode: COMPANY.address.postalCode,
              addressCountry: COMPANY.address.country,
            },
            sameAs: COMPANY.socialProfiles,
          }),
        }}
      />
    </footer>
  );
}
