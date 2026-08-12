import { Link } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { Icon, type IconName, useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';
import { useNavVisibility } from '../../hooks/useNavVisibility.js';

export interface GridCard {
  label: string;
  path: string;
  /** Nav item id. When supplied, the card disappears if an admin hides that page. */
  navId?: string;
  description?: string;
  icon?: IconName;
  /** Optional photograph. Without one the card renders as a brand-gradient tile. */
  image?: string;
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
export function CardGrid({ cards, columns = 3, ctaLabel = 'Learn more' }: CardGridProps) {
  const { hidden } = useNavVisibility();

  // Cards carrying a navId respect the admin's visibility switches. Cards without one
  // (ad-hoc links) always render, so this can't silently swallow a card by accident.
  const visibleCards = cards.filter((card) => !(card.navId && hidden.has(card.navId)));

  const root = useAnimationScope(
    (self) => {
      self?.add('reveal', () => {
        animate('.grid-card', {
          opacity: [0, 1],
          translateY: [24, 0],
          delay: stagger(STAGGER_GAP),
          duration: DURATION.slow,
          ease: EASE.standard,
        });
      });
    },
    [visibleCards.length],
  );

  if (visibleCards.length === 0) return null;

  return (
    <div ref={root} className={`grid gap-6 ${COLUMN_CLASS[columns]}`}>
      {visibleCards.map((card) => {
        const inner = (
          <>
            <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-navy to-brand-blue">
              {card.image && (
                <img
                  src={card.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
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
                <h3 className="font-display text-lg font-bold text-navy group-hover:text-accent-blue">
                  {card.label}
                </h3>
                {card.placeholder && (
                  <span className="flex-shrink-0 rounded-full bg-canvas-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate">
                    Coming soon
                  </span>
                )}
              </div>

              {card.description && (
                <p className="mt-3 text-sm leading-relaxed text-slate">{card.description}</p>
              )}

              {!card.placeholder && (
                <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-accent-blue">
                  {ctaLabel}
                  <Icon name="arrow-right" size={16} />
                </span>
              )}
            </div>
          </>
        );

        const cardClass =
          'grid-card group flex flex-col overflow-hidden rounded-2xl border border-border bg-canvas transition-all';

        // A placeholder entry is not a link — sending someone to a stub page is worse than
        // showing them it isn't ready yet.
        return card.placeholder ? (
          <div key={card.path} className={`${cardClass} opacity-75`}>
            {inner}
          </div>
        ) : (
          <Link
            key={card.path}
            to={card.path}
            className={`${cardClass} hover:border-accent-blue hover:shadow-lg`}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
