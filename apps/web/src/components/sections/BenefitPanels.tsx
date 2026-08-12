import { animate, stagger } from 'animejs';
import { Icon, type IconName, useAnimationScope, DURATION, EASE, STAGGER_GAP } from '@atlas-south/design-system';
import { panelImage } from '../../content/imagery';

export interface BenefitPanel {
  title: string;
  description: string;
  icon?: IconName;
}

interface BenefitPanelsProps {
  panels: BenefitPanel[];
  /** Alternate the image side per row. Off gives a plain image-left grid. */
  alternate?: boolean;
}

/**
 * Alternating image + text panels — the workhorse block of the inspiration site's detail
 * pages, and the direct replacement for the narrow markdown prose column that made every
 * service and industry page read as an essay.
 *
 * Each row is a real content pair (a claim and its explanation) rather than a paragraph,
 * which is what lets the same underlying copy carry visual weight. Images come from
 * content/imagery.ts by position, so content authors never have to pick one.
 */
export function BenefitPanels({ panels, alternate = true }: BenefitPanelsProps) {
  const root = useAnimationScope(
    (self) => {
      self?.add('reveal', () => {
        animate('.benefit-panel', {
          opacity: [0, 1],
          translateY: [24, 0],
          delay: stagger(STAGGER_GAP),
          duration: DURATION.slow,
          ease: EASE.standard,
        });
      });
    },
    [panels.length],
  );

  if (panels.length === 0) return null;

  return (
    <div ref={root} className="space-y-12 sm:space-y-16">
      {panels.map((panel, index) => {
        const imageRight = alternate && index % 2 === 1;

        return (
          <div
            key={panel.title}
            className="benefit-panel grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
          >
            <div className={imageRight ? 'lg:order-2' : ''}>
              <img
                src={panelImage(index)}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
              />
            </div>

            <div className={imageRight ? 'lg:order-1' : ''}>
              {panel.icon && (
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
                  <Icon name={panel.icon} size={24} className="text-accent-blue" />
                </div>
              )}
              <h3 className="font-display text-2xl font-bold text-navy sm:text-3xl">
                {panel.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-slate">{panel.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
