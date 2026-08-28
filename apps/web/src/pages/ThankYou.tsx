import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { COMPANY } from '@atlas-south/shared';
import { trackEvent } from '../lib/analytics.js';

/**
 * Conversion confirmation page — docs/build/06-PAGE-SPECIFICATIONS.md §3 "Thank You".
 * - Dedicated URL so GA4/custom analytics can fire a clean conversion event.
 * - noindex (transactional page — we never want it ranking or showing in search).
 * - Sets a response-time expectation; offers the phone/WhatsApp fast-track for urgent jobs.
 */
export function ThankYou() {
  // noindex — this page must never appear in search results.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    // Fire conversion event to the custom analytics pipeline.
    trackEvent('enquiry_submitted', '/thank-you');

    return () => meta.remove();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-20">
      <div className="w-full max-w-lg text-center">
        {/* Confirmation icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" aria-hidden="true" />
        </div>

        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
          Enquiry received — thank you!
        </h1>

        <p className="mt-4 text-lg text-slate">
          We've got your message and will be in touch within{' '}
          <strong className="text-navy">2 business hours</strong>. For urgent jobs, reach us
          directly right now:
        </p>

        {/* Fast-track CTAs */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href={`tel:${COMPANY.phone.tel}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 font-semibold text-white transition-colors hover:bg-navy/90"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            Call {COMPANY.phone.display}
          </a>
          <a
            href={COMPANY.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            WhatsApp us
          </a>
        </div>

        {/* Navigation back */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-slate">Not in a rush? Explore what we do while you wait.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to="/"
              className="flex items-center gap-1 text-accent-blue hover:underline"
            >
              Home <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              to="/packages"
              className="flex items-center gap-1 text-accent-blue hover:underline"
            >
              Packages <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              to="/company/contact"
              className="flex items-center gap-1 text-accent-blue hover:underline"
            >
              Contact <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
