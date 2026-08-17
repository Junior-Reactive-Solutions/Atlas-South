import { Link } from 'react-router-dom';
import { Icon, type IconName, useScrollReveal, useSpotlight } from '@atlas-south/design-system';
import { useNavVisibility } from '../../hooks/useNavVisibility.js';
import { HoverImage } from '../shared/HoverImage.js';

export interface GridCard {
  label: string;
  path: string;
  /** Nav item id. When supplied, the card disappears if an admin hides that page. */
  navId?: string;
  description?: string;
  icon?: IconName;
  /** Optional photograph. Without one the card renders as a brand-gradient tile. */
  image?: string;
  /** A second photograph, crossfaded in on hover (HoverImage.tsx). Without one, `image` is static. */
  imageAlt?: string | null;
  /** Renders a "Coming soon" chip and removes the link affordance. */
  placeholder?: boolean;
}

interface CardGridProps {
  cards: GridCard[];
  /** Cards per row at the largest breakpoint. */
  columns?: 2 | 3 | 4;
  ctaLabel?: string;
}

const COLUMN_CLASS: Record<2 | 3 | 4, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

/**
 * Image card grid — used for the industries grid, sibling-service cross-links, and the
 * "more solutions" blocks that the inspiration site closes its detail pages with.
 *
 * Cards without a photograph fall back to a navy→brand-blue gradient tile rather than a
 * blank box, so a grid stays visually coherent while some entries still lack imagery.
 * brand-blue is decorative here only — every text colour on the card is AA-verified.
 */
const CARD_CLASS =
  'grid-card spotlight-card group flex flex-col overflow-hidden rounded-2xl border border-border bg-canvas transition-all';

/**
 * One card. Its own component so `useSpotlight` gets a real per-card hook instance —
 * calling a hook inside a `.map()` body breaks React's rules of hooks.
 *
 * Carries `.spotlight-card` so the cursor-following glow behaves identically here (every
 * services / industries / areas grid on the site) and on the pricing cards, which were
 * previously the only place that effect appeared. `overflow-hidden` is safe with it: the
 * glow clips to the card's own rounded corners, and unlike the pricing cards nothing here
 * is positioned outside the card's box.
 */
function GridCardItem({ card, ctaLabel }: { card: GridCard; ctaLabel: string }) {
  const spotlightRef = useSpotlight<HTMLAnchorElement>();
  const placeholderRef = useSpotlight<HTMLDivElement>();

  const inner = (
    <>
      <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-navy to-brand-blue">
        {card.image && (
          <HoverImage
            src={card.image}
            altSrc={card.imageAlt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {card.icon && !card.image && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name={card.icon} size={40} className="text-white/90" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-navy group-hover:text-accent-blue">{card.label}</h3>
          {card.placeholder && (
            <span className="flex-shrink-0 rounded-full bg-canvas-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate">
              Coming soon
            </span>
          )}
        </div>

        {card.description && <p className="mt-3 text-sm leading-relaxed text-slate">{card.description}</p>}

        {!card.placeholder && (
          <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-accent-blue">
            {ctaLabel}
            <Icon name="arrow-right" size={16} />
          </span>
        )}
      </div>
    </>
  );

  // A placeholder entry is not a link — sending someone to a stub page is worse than
  // showing them it isn't ready yet. (Callers now filter placeholders out entirely; this
  // stays as the safe rendering for any that reach a grid directly.)
  if (card.placeholder) {
    return (
      <div ref={placeholderRef} className={`${CARD_CLASS} opacity-75`}>
        {inner}
      </div>
    );
  }

  return (
    <Link ref={spotlightRef} to={card.path} className={`${CARD_CLASS} hover:border-accent-blue hover:shadow-lg`}>
      {inner}
    </Link>
  );
}

export function CardGrid({ cards, columns = 3, ctaLabel = 'Learn more' }: CardGridProps) {
  const { hidden } = useNavVisibility();

  // Cards carrying a navId respect the admin's visibility switches. Cards without one
  // (ad-hoc links) always render, so this can't silently swallow a card by accident.
  const visibleCards = cards.filter((card) => !(card.navId && hidden.has(card.navId)));

  const root = useScrollReveal('.grid-card');

  if (visibleCards.length === 0) return null;

  return (
    <div ref={root} className={`grid gap-6 ${COLUMN_CLASS[columns]}`}>
      {visibleCards.map((card) => (
        <GridCardItem key={card.path} card={card} ctaLabel={ctaLabel} />
      ))}
    </div>
  );
}
