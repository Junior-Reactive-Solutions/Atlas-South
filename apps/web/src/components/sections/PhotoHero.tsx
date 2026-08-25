import { Link } from 'react-router-dom';
import { Icon } from '@atlas-south/design-system';

interface PhotoHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  /** Full-bleed background photograph URL — see content/imagery.ts. */
  image: string;
  ctaLabel?: string;
  ctaPath?: string;
}

/**
 * Photo hero for detail pages — replaces the previous icon-in-a-tinted-box hero.
 *
 * The old treatment put a 24px outline icon on a pale strip, which is why every service
 * and industry page read as documentation rather than as a marketing page. The
 * inspiration site (abm.co.uk) opens every detail page with a full-bleed photograph and a
 * single CTA; this is that block in Atlas South's palette.
 *
 * The navy gradient over the image is what keeps text at AA contrast regardless of what
 * the photograph happens to contain — the same technique already used in HeroCarousel.
 */
export function PhotoHero({
  eyebrow,
  title,
  description,
  image,
  ctaLabel = 'Get a Free Quote',
  ctaPath = '/company/contact',
}: PhotoHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy" data-widget-theme="dark">
      {/*
        Very slow zoom (a "Ken Burns"): 1.0 → 1.08 over 20s, once, no loop.

        The point is to make the page feel alive the moment it loads without anything
        actually moving fast enough to read as animation — at this rate it's below the
        threshold of noticing, which is what separates it from the auto-playing carousels
        that make sites feel cheap. `motion-reduce:animate-none` turns it off for anyone
        who has asked for reduced motion.
      */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full animate-hero-zoom object-cover motion-reduce:animate-none"
      />
      {/* Navy wash — text sits on this, never directly on the photo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/60"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-24 lg:py-32">
        <div className="max-w-2xl">
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              {eyebrow}
            </p>
          )}
          <h1
            className={`font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl ${
              eyebrow ? 'mt-4' : ''
            }`}
          >
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            {description}
          </p>
          <Link
            to={ctaPath}
            className="group mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-accent-blue px-6 py-3 font-semibold text-white transition-all hover:bg-brand-blue"
          >
            {ctaLabel}
            <Icon
              name="arrow-right"
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
