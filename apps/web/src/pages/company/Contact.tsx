import { QuoteForm } from '../../components/home/QuoteForm';
import { CoverageMap } from '../../components/home/CoverageMap';
import { SectionHeading } from '../../components/sections';
import { Seo } from '../../components/seo/Seo.js';
import { Icon } from '@atlas-south/design-system';
import { COMPANY } from '@atlas-south/shared';
import { trackPhoneClick, trackWhatsAppClick } from '../../lib/analytics.js';

export function Contact() {
  return (
    <>
      <Seo
        title="Contact Us — Get a Free Quote"
        description="Ready to discuss your project? Contact Atlas South today. 24/7 emergency line: 07778 858278"
        path="/company/contact"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: COMPANY.name,
          telephone: COMPANY.phone.tel,
          email: COMPANY.email,
          url: `https://${COMPANY.domain}`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: `${COMPANY.address.line1}, ${COMPANY.address.line2}`,
            addressLocality: COMPANY.address.city,
            postalCode: COMPANY.address.postalCode,
            addressCountry: COMPANY.address.country,
          },
        }}
      />

      {/* Hero section */}
      <section className="border-b border-border bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="font-display text-4xl font-bold text-navy sm:text-5xl">Get in Touch</h1>
          <p className="mt-4 text-lg text-slate">
            Ready to discuss your project? We're here to help. Reach out by phone, email, or fill out the form below.
          </p>
        </div>
      </section>

      {/* Contact info section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="font-semibold text-navy">Phone</h3>
              <a
                href={`tel:${COMPANY.phone.tel}`}
                onClick={() => trackPhoneClick('contact-page')}
                className="mt-2 text-accent-blue hover:underline"
              >
                {COMPANY.phone.display}
              </a>
              <p className="mt-1 text-xs text-slate">24/7 Emergency Line</p>
            </div>

            {/* WhatsApp alongside phone — the direct-response pairing the pre-rebuild
                site's audit credited as a real strength; see Header.tsx for the fuller
                note on why this was missing and where COMPANY.whatsapp.url came from. */}
            <div>
              <h3 className="font-semibold text-navy">WhatsApp</h3>
              <a
                href={COMPANY.whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('contact-page')}
                className="mt-2 inline-flex items-center gap-1.5 text-accent-blue hover:underline"
              >
                <Icon name="message-circle" size={16} />
                Message us
              </a>
              {/* No response-time claim here — "usually replies within X" isn't a
                  verified fact (see docs/build/13-COMPANY-FACTS-VERIFIED.md), unlike the
                  phone tile's "24/7 Emergency Line", which is COMPANY.stats.coverage. */}
            </div>

            <div>
              <h3 className="font-semibold text-navy">Email</h3>
              <a href={`mailto:${COMPANY.email}`} className="mt-2 text-accent-blue hover:underline">
                {COMPANY.email}
              </a>
            </div>

            <div>
              <h3 className="font-semibold text-navy">Address</h3>
              <p className="mt-2 text-sm text-slate">
                {COMPANY.address.line1}
                <br />
                {COMPANY.address.line2}
                <br />
                {COMPANY.address.city}, {COMPANY.address.postalCode}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage map — the same component the homepage uses, placed here because "do you
          actually cover my area?" is the question most likely to stop someone mid-enquiry,
          and this is the page where they're about to enquire. Each node links straight to
          that area's page. */}
      <section aria-label="Areas we cover" className="bg-canvas-tint py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            eyebrow="Where we work"
            title="Check we cover your site"
            subcopy="Hover an area to see its coverage, or open that area's page for response times and local detail."
            align="center"
          />
          <div className="mt-12">
            <CoverageMap />
          </div>
        </div>
      </section>

      {/* Quote form section */}
      <QuoteForm />
    </>
  );
}
