import { Link } from 'react-router-dom';
import { COMPANY } from '@atlas-south/shared';
import { Icon, useMagneticHover } from '@atlas-south/design-system';
import { trackPhoneClick, trackWhatsAppClick } from '../../lib/analytics.js';

interface CtaBandProps {
  heading: string;
  description?: string;
  ctaLabel?: string;
  ctaPath?: string;
  /** Tinted sits on canvas-tint; navy is the full-bleed dark treatment. */
  tone?: 'tint' | 'navy';
}

/**
 * "Let's get in touch" band — the inspiration site places one of these mid-page and again
 * at the foot of every detail page, so a visitor is never more than a screen away from a
 * conversion point.
 *
 * Keeps the phone number alongside the primary CTA because instant phone/WhatsApp contact
 * is one of the few things the audit found Atlas South already beats ABM on — mirroring
 * ABM's structure shouldn't quietly discard our own advantage.
 */
export function CtaBand({
  heading,
  description,
  ctaLabel = 'Get a Free Quote',
  ctaPath = '/company/contact',
  tone = 'tint',
}: CtaBandProps) {
  const isNavy = tone === 'navy';
  // Same shared hook as Hero.tsx's primary CTA and Packages.tsx's Subscribe buttons —
  // one implementation, so the pull feels identical on every page this band appears on.
  const magneticCta = useMagneticHover<HTMLAnchorElement>();

  return (
    <section
      className={`py-16 sm:py-20 ${isNavy ? 'bg-navy text-white' : 'bg-canvas-tint'}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2
            className={`font-display text-3xl font-bold sm:text-4xl ${
              isNavy ? 'text-white' : 'text-navy'
            }`}
          >
            {heading}
          </h2>
          {description && (
            <p className={`mt-4 ${isNavy ? 'text-white/80' : 'text-slate'}`}>{description}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-shrink-0">
          <Link
            ref={magneticCta}
            to={ctaPath}
            className="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-accent-blue px-6 py-3 font-semibold text-white transition-all hover:bg-brand-blue"
          >
            {ctaLabel}
            <Icon
              name="arrow-right"
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <a
            href={`tel:${COMPANY.phone.tel}`}
            onClick={() => trackPhoneClick('cta-band')}
            className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border px-6 py-3 font-semibold transition-colors ${
              isNavy
                ? 'border-white/30 text-white hover:bg-white/10'
                : 'border-border text-navy hover:border-accent-blue hover:text-accent-blue'
            }`}
          >
            <Icon name="phone" size={18} />
            {COMPANY.phone.display}
          </a>
          {/* Third instant-contact option, matching the "WhatsApp + phone CTAs repeated
              throughout" pattern the pre-rebuild site's audit flagged as a genuine
              strength — see the fuller note beside the header's WhatsApp link. */}
          <a
            href={COMPANY.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('cta-band')}
            className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border px-6 py-3 font-semibold transition-colors ${
              isNavy
                ? 'border-white/30 text-white hover:bg-white/10'
                : 'border-border text-navy hover:border-accent-blue hover:text-accent-blue'
            }`}
          >
            <Icon name="message-circle" size={18} />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
