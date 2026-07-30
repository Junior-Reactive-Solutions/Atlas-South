import { Link } from 'react-router-dom';
import { animate, createTimeline, stagger } from 'animejs';
import { COMPANY, PACKAGES_PAGE } from '@atlas-south/shared';
import { Icon } from '../ui/Icon';
import { useAnimationScope } from '../../hooks/useAnimationScope';
import { DURATION, EASE } from '../../lib/motion-tokens';

/**
 * Hero background — first-choice candidate from docs/build/03-HERO-SECTION-SPEC.md §3
 * (Unsplash, standard license, free for commercial use, no attribution required).
 * Photographer: Glenov Brankovic — https://unsplash.com/photos/ZYUcxbMeaIY
 *
 * TODO (docs/build/12-HOSTING-DEPLOYMENT.md §5): once a Cloudinary account exists,
 * download this image and re-serve it from Cloudinary with f_auto,q_auto rather than
 * hotlinking Unsplash's CDN directly, per the performance requirement in
 * docs/build/09-SEO-PERFORMANCE-CHECKLIST.md §5.
 */
const HERO_IMAGE_DESKTOP =
  'https://images.unsplash.com/photo-1694521787193-9293daeddbaa?auto=format&fit=crop&w=1920&q=80';
const HERO_IMAGE_MOBILE =
  'https://images.unsplash.com/photo-1694521787193-9293daeddbaa?auto=format&fit=crop&w=800&h=1000&crop=faces&q=80';

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

/** Choreography per docs/build/03-HERO-SECTION-SPEC.md §6 — one timeline, sequenced. */
export function Hero() {
  const root = useAnimationScope(() => {
    const tl = createTimeline();
    tl.add('.hero-eyebrow', { opacity: [0, 1], translateY: [16, 0], duration: DURATION.base, ease: EASE.standard })
      .add(
        '.hero-headline-line',
        {
          opacity: [0, 1],
          translateY: [16, 0],
          delay: stagger(80),
          duration: DURATION.hero,
          ease: EASE.standard,
        },
        '-=150',
      )
      .add('.hero-subcopy', { opacity: [0, 1], translateY: [12, 0], duration: DURATION.base, ease: EASE.standard }, '-=200')
      .add('.hero-cta', { opacity: [0, 1], scale: [0.96, 1], duration: DURATION.base, ease: EASE.standard }, '-=150')
      .add('.hero-secondary-links', { opacity: [0, 1], duration: DURATION.base }, '-=150');

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

  return (
    <section ref={root} className="relative overflow-hidden bg-navy">
      <picture>
        <source media="(max-width: 767px)" srcSet={HERO_IMAGE_MOBILE} />
        <img
          src={HERO_IMAGE_DESKTOP}
          alt=""
          aria-hidden="true"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
      </picture>
      {/* Navy gradient overlay — keeps the dark-panel 60/30/10 recipe intact per
          docs/build/01-BRAND-SYSTEM.md §3 even with a photograph in the background */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/40"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-32">
        <p className="hero-eyebrow mb-4 inline-block rounded border border-accent-blue/40 bg-navy/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-blue">
          London &amp; South East · Est. {COMPANY.foundedYear} · Available {COMPANY.stats.coverage}
        </p>

        <h1 className="max-w-3xl font-display text-4xl font-black uppercase leading-tight text-white sm:text-5xl lg:text-6xl">
          <span className="hero-headline-line block">Trades and facilities services</span>
          <span className="hero-headline-line block text-accent-blue">you can trust —</span>
          <span className="hero-headline-line block">for your home or your business.</span>
        </h1>

        <p className="hero-subcopy mt-6 max-w-xl font-body text-lg text-white/85">
          Atlas South has delivered {COMPANY.stats.jobsCompleted} jobs across London and
          the South East since {COMPANY.foundedYear}, from emergency call-outs to fully
          managed facilities contracts.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to="/company/contact"
            className="hero-cta flex min-h-[44px] items-center gap-2 rounded bg-accent-blue px-6 text-sm font-semibold uppercase tracking-wide text-white hover:bg-white hover:text-navy"
          >
            Get a Free Quote
            <Icon name="arrow-right" size={18} />
          </Link>
          <div className="hero-secondary-links flex gap-6 text-sm font-semibold text-white/90">
            <Link to={PACKAGES_PAGE.path} className="flex items-center gap-1 hover:text-accent-blue">
              For Your Home <Icon name="arrow-right" size={14} />
            </Link>
            <Link to="/hard-services/electricals" className="flex items-center gap-1 hover:text-accent-blue">
              For Your Business <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-white/15 pt-6 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
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
    </section>
  );
}
