import { Link } from 'react-router-dom';
import { animate, createTimeline, stagger } from 'animejs';
import { COMPANY, PACKAGES_PAGE } from '@atlas-south/shared';
import { Icon, useAnimationScope, DURATION, EASE, STAGGER_GAP, prefersReducedMotion } from '@atlas-south/design-system';
import { HeroCarousel } from './HeroCarousel.js';

interface Stat {
  label: string;
  value: string;
  /** Only set for stats that should animate as a count-up (docs/build/02-ANIMATION-SYSTEM.md
   * "Stat counters" row). "24/7" and the founding year display as static text — counting
   * up to a year or mangling "24/7" into a number would be a bug, not an animation. */
  countTo?: number;
  suffix?: string;
}

const STATS: Stat[] = [
  { label: 'Happy Clients', value: COMPANY.stats.clients, countTo: 700, suffix: '+' },
  { label: 'Emergency Cover', value: COMPANY.stats.coverage },
  { label: 'Jobs Completed', value: COMPANY.stats.jobsCompleted, countTo: 12000, suffix: '+' },
  { label: 'Founded', value: String(COMPANY.foundedYear) },
];

interface HeroProps {
  headlineLines?: [string, string, string];
  subcopy?: string;
  primaryCtaLabel?: string;
  homeCtaLabel?: string;
  businessCtaLabel?: string;
}

const DEFAULT_HEADLINE_LINES: [string, string, string] = [
  'Trades and facilities services',
  'you can trust —',
  'for your home or your business.',
];

/**
 * Choreography per docs/build/03-HERO-SECTION-SPEC.md §6 — one timeline, sequenced.
 * Text props are optional and default to the values above so the entrance animation
 * (which targets fixed DOM elements on mount) never has to wait on the content fetch
 * in Home.tsx — copy just swaps in once /api/content/home resolves.
 */
export function Hero({
  headlineLines = DEFAULT_HEADLINE_LINES,
  subcopy,
  primaryCtaLabel = 'Get a Free Quote',
  homeCtaLabel = 'For Your Home',
  businessCtaLabel = 'For Your Business',
}: HeroProps) {
  const root = useAnimationScope(() => {
    const tl = createTimeline();
    tl.add('.hero-eyebrow', {
        opacity: [0, 1],
        translateY: [16, 0],
        scaleX: [0.85, 1],
        duration: DURATION.base,
        ease: EASE.standard,
      })
      .add(
        '.hero-headline-line',
        {
          opacity: [0, 1],
          translateY: [28, 0],
          scale: [0.97, 1],
          delay: stagger(80),
          duration: DURATION.hero,
          ease: EASE.standard,
        },
        '-=150',
      )
      .add('.hero-subcopy', { opacity: [0, 1], translateY: [12, 0], duration: DURATION.base, ease: EASE.standard }, '-=200')
      .add('.hero-cta', { opacity: [0, 1], scale: [0.96, 1], duration: DURATION.base, ease: EASE.standard }, '-=150')
      .add('.hero-secondary-links', { opacity: [0, 1], duration: DURATION.base }, '-=150')
      .add(
        '.hero-stat',
        {
          opacity: [0, 1],
          translateY: [20, 0],
          delay: stagger(STAGGER_GAP),
          duration: DURATION.base,
          ease: EASE.standard,
        },
        '-=100',
      );

    // Gentle continuous nudge on the primary CTA's arrow — draws the eye back to it after
    // the entrance sequence settles, transform-only so it stays compositor-friendly.
    // Skipped under prefers-reduced-motion per docs/build/02-ANIMATION-SYSTEM.md §4 — an
    // infinite loop is exactly the kind of non-essential motion that rule exists to disable.
    if (!prefersReducedMotion()) {
      animate('.hero-cta-arrow', {
        translateX: [0, 4, 0],
        duration: 1400,
        loop: true,
        ease: EASE.emphasis,
      });
    }

    // Stat count-up — plays on load (the one exception to scroll-triggered per spec §6).
    // Only elements carrying a data-count-to target animate; "24/7" and the founding
    // year render as static text (set directly in JSX, never touched here).
    document.querySelectorAll<HTMLElement>('[data-count-to]').forEach((el) => {
      const target = parseInt(el.dataset.countTo ?? '', 10);
      const suffix = el.dataset.suffix ?? '';
      if (!target) return;
      const obj = { value: 0 };
      animate(obj, {
        value: target,
        duration: DURATION.slow,
        round: 1,
        onUpdate: () => {
          el.textContent = `${obj.value}${suffix}`;
        },
      });
    });
  }, []);

  const resolvedSubcopy = (
    subcopy ??
    'Atlas South has delivered {jobsCompleted} jobs across London and the South East since {foundedYear}, from emergency call-outs to fully managed facilities contracts.'
  )
    .replace('{jobsCompleted}', COMPANY.stats.jobsCompleted)
    .replace('{foundedYear}', String(COMPANY.foundedYear));

  return (
    <section ref={root}>
      <HeroCarousel>
        <div className="mx-auto max-w-7xl px-4 py-20 lg:py-32">
          <p className="hero-eyebrow mb-4 inline-block origin-left rounded border border-white/30 bg-navy/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
            London &amp; South East · Est. {COMPANY.foundedYear} · Available {COMPANY.stats.coverage}
          </p>

          <h1 className="max-w-3xl font-display text-4xl font-black uppercase leading-tight text-white sm:text-5xl lg:text-6xl">
            <span className="hero-headline-line block">{headlineLines[0]}</span>
            <span className="hero-headline-line block text-accent-blue">{headlineLines[1]}</span>
            <span className="hero-headline-line block">{headlineLines[2]}</span>
          </h1>

          <p className="hero-subcopy mt-6 max-w-xl font-body text-lg text-white/85">{resolvedSubcopy}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/company/contact"
              className="hero-cta flex min-h-[44px] items-center gap-2 rounded bg-accent-blue px-6 text-sm font-semibold uppercase tracking-wide text-white hover:bg-white hover:text-navy"
            >
              {primaryCtaLabel}
              <Icon name="arrow-right" size={18} className="hero-cta-arrow" />
            </Link>
            <div className="hero-secondary-links flex gap-6 text-sm font-semibold text-white/90">
              <Link to={PACKAGES_PAGE.path} className="flex items-center gap-1 hover:text-accent-blue">
                {homeCtaLabel} <Icon name="arrow-right" size={14} />
              </Link>
              <Link to="/hard-services/electricals" className="flex items-center gap-1 hover:text-accent-blue">
                {businessCtaLabel} <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-white/15 pt-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <dt className="sr-only">{stat.label}</dt>
                <dd
                  className="font-display text-2xl font-extrabold text-white"
                  data-count-to={stat.countTo}
                  data-suffix={stat.suffix}
                >
                  {stat.countTo ? '0' : stat.value}
                </dd>
                <p className="text-xs uppercase tracking-wide text-white/70">{stat.label}</p>
              </div>
            ))}
          </dl>
        </div>
      </HeroCarousel>
    </section>
  );
}
