import { Link } from 'react-router-dom';
import { animate, createTimeline, stagger } from 'animejs';
import { COMPANY } from '@atlas-south/shared';
import {
  Icon,
  useAnimationScope,
  useMagneticHover,
  DURATION,
  EASE,
  STAGGER_GAP,
  prefersReducedMotion,
} from '@atlas-south/design-system';
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
  /** Secondary link — jumps to the on-page hard/soft services panel. */
  servicesCtaLabel?: string;
  /** Secondary link — jumps to the on-page industries grid. */
  industriesCtaLabel?: string;
}

/**
 * Strictly commercial/industrial. A previous revision followed
 * docs/build/03-HERO-SECTION-SPEC.md §2's dual-audience framing ("for your home or your
 * business", with a "For Your Home" CTA pointing at /packages), on the basis that the old
 * site sold residential plans. The client has since confirmed the opposite: no residential
 * mention anywhere on the site. That spec section is therefore stale — the headline and both
 * secondary links below are commercial-only, and the two links now split by *what you need*
 * (services / industries) rather than by audience.
 */
const DEFAULT_HEADLINE_LINES: [string, string, string] = [
  'Trades & facilities services',
  'you can trust —',
  'for commercial & industrial sites.',
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
  servicesCtaLabel = 'Our Services',
  industriesCtaLabel = 'Our Industries',
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
      // The headline itself no longer fades/slides per line — its entrance is the
      // typewriter effect below, which reads as more deliberate motion than a generic
      // fade-up and is what the client asked for directly ("a typing animation... makes
      // it look like it's typing in real-time"). The block still needs *some* signal it's
      // arriving, so it gets one quick, gentle fade — not a competing transform.
      .add('.hero-headline', { opacity: [0, 1], duration: DURATION.fast, ease: EASE.standard }, '-=150')
      .add('.hero-subcopy', { opacity: [0, 1], translateY: [12, 0], duration: DURATION.base, ease: EASE.standard }, '+=650')
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

    // Decorative brand-blue glow shapes (HeroCarousel) — a slow, transform-only drift so
    // the hero reads as more graphical without competing with the photo/video or the text.
    // Brand-blue is explicitly sanctioned for "decorative shapes" in the hero per
    // docs/build/01-BRAND-SYSTEM.md's dark-panel recipe table — this isn't a new colour.
    if (!prefersReducedMotion()) {
      animate('.hero-decor-orb', {
        translateX: [0, 18, 0],
        translateY: [0, -14, 0],
        duration: 9000,
        loop: true,
        ease: 'inOutSine',
        delay: stagger(600),
      });
    }

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

    // Typewriter effect on the headline. Real text is already in the DOM from the initial
    // render (so no-JS, SSR and prefers-reduced-motion visitors always see the full
    // headline immediately) — this only clears and retypes it when motion is allowed. The
    // <h1> carries an aria-label with the full headline set once, up front, so assistive
    // tech never has to listen through a character-by-character reveal; the per-line spans
    // that actually get retyped are aria-hidden.
    if (!prefersReducedMotion()) {
      const lines = Array.from(document.querySelectorAll<HTMLElement>('.hero-headline-line'));
      const fullTexts = lines.map((el) => el.textContent ?? '');
      lines.forEach((el) => {
        el.textContent = '';
      });

      const CHAR_DELAY_MS = 26; // fast enough to read as live typing, not sluggish
      const LINE_GAP_MS = 260; // pause before the next line starts
      const START_DELAY_MS = 300; // roughly when the eyebrow has landed

      let cursor: HTMLSpanElement | null = null;
      const placeCursorAfter = (el: HTMLElement) => {
        if (!cursor) {
          cursor = document.createElement('span');
          cursor.setAttribute('aria-hidden', 'true');
          cursor.className =
            'ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] animate-pulse bg-accent-blue align-middle';
        }
        el.appendChild(cursor);
      };

      let delay = START_DELAY_MS;
      lines.forEach((el, lineIndex) => {
        const text = fullTexts[lineIndex];
        for (let charIndex = 1; charIndex <= text.length; charIndex++) {
          const revealed = text.slice(0, charIndex);
          setTimeout(() => {
            // Guards against a race with unmount — this component mounts once on initial
            // page load, but the timers are plain setTimeout, not tied to React's own
            // cleanup, so this keeps a very late timer from writing into a detached node.
            if (!el.isConnected) return;
            el.textContent = revealed;
            placeCursorAfter(el);
          }, delay);
          delay += CHAR_DELAY_MS;
        }
        delay += LINE_GAP_MS;
      });
      const finalDelay = delay;
      setTimeout(() => cursor?.remove(), finalDelay);
    }
  }, []);

  const resolvedSubcopy = (
    subcopy ??
    'Atlas South has delivered {jobsCompleted} jobs across London and the South East since {foundedYear}, from emergency call-outs to fully managed facilities contracts.'
  )
    .replace('{jobsCompleted}', COMPANY.stats.jobsCompleted)
    .replace('{foundedYear}', String(COMPANY.foundedYear));

  const fullHeadline = `${headlineLines[0]} ${headlineLines[1]} ${headlineLines[2]}`;

  // Magnetic pull on the primary CTA — one shared hook (packages/design-system),
  // applied the same way on every primary CTA sitewide (see also CtaBand.tsx,
  // Packages.tsx) so the feel is identical wherever it shows up.
  const magneticCta = useMagneticHover<HTMLAnchorElement>();

  return (
    <section ref={root}>
      <HeroCarousel>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20 lg:py-32">
          <p className="hero-eyebrow mb-4 inline-block origin-left rounded border border-white/30 bg-navy/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
            London &amp; South East · Est. {COMPANY.foundedYear} · Available {COMPANY.stats.coverage}
          </p>

          <h1
            className="hero-headline max-w-3xl font-display text-3xl font-black uppercase leading-tight text-white sm:text-5xl lg:text-6xl"
            aria-label={fullHeadline}
          >
            <span className="hero-headline-line block" aria-hidden="true">
              {headlineLines[0]}
            </span>
            <span className="hero-headline-line block text-accent-blue" aria-hidden="true">
              {headlineLines[1]}
            </span>
            <span className="hero-headline-line block" aria-hidden="true">
              {headlineLines[2]}
            </span>
          </h1>

          <p className="hero-subcopy mt-6 max-w-xl font-body text-lg text-white/85">{resolvedSubcopy}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              ref={magneticCta}
              to="/company/contact"
              className="hero-cta flex min-h-[44px] items-center gap-2 rounded bg-accent-blue px-6 text-sm font-semibold uppercase tracking-wide text-white transition-transform duration-150 ease-out hover:bg-white hover:text-navy"
            >
              {primaryCtaLabel}
              <Icon name="arrow-right" size={18} className="hero-cta-arrow" />
            </Link>
            {/* Two ways into the page's own content, both commercial. Previously these
                split by audience ("For Your Home" → /packages vs "For Your Business"), which
                the client has since ruled out — the site is commercial/industrial only.
                Scrolling is driven explicitly rather than left to the browser's native
                anchor-scroll: react-router owns history here, and calling
                `history.pushState` to set the hash fights its internal listener, which was
                observed resetting the URL and cutting the scroll short. Scrolling without
                touching the URL sidesteps that; both targets still carry a real id, so a
                direct #services / #industries link pasted elsewhere still works via the
                browser's native anchor handling. */}
            <div className="hero-secondary-links flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/90">
              {(
                [
                  { id: 'services', label: servicesCtaLabel },
                  { id: 'industries', label: industriesCtaLabel },
                ] as const
              ).map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    const target = document.getElementById(id);
                    if (!target) return;
                    e.preventDefault();
                    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
                  }}
                  className="flex items-center gap-1 hover:text-accent-blue"
                >
                  {label} <Icon name="arrow-right" size={14} />
                </a>
              ))}
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-white/15 pt-6 sm:mt-14 sm:grid-cols-4 sm:gap-x-8">
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
