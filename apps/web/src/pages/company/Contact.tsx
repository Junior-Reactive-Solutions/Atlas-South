import { QuoteForm } from '../../components/home/QuoteForm';
import { Seo } from '../../components/seo/Seo.js';
import { COMPANY } from '@atlas-south/shared';

export function Contact() {
  return (
    <>
      <Seo
        title="Contact Atlas South | Get a Free Quote"
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
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="font-semibold text-navy">Phone</h3>
              <a href={`tel:${COMPANY.phone.tel}`} className="mt-2 text-accent-blue hover:underline">
                {COMPANY.phone.display}
              </a>
              <p className="mt-1 text-xs text-slate">24/7 Emergency Line</p>
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

      {/* Quote form section */}
      <QuoteForm />
    </>
  );
}
