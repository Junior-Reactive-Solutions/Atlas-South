import { Link } from 'react-router-dom';
import { Icon, type IconName } from '@atlas-south/design-system';

interface ServiceCardProps {
  label: string;
  icon: IconName;
  description: string;
  path: string;
}

/**
 * Service card — docs/build/06-PAGE-SPECIFICATIONS.md "Hard Services / Soft Services rows".
 * Icon, title, description, "Learn more" link. Animated on scroll via parent grid's
 * stagger. Uses the explicit icon registry from design-system so Lucide icons don't bloat
 * the bundle even when displaying dozens of services.
 */
export function ServiceCard({ label, icon, description, path }: ServiceCardProps) {
  return (
    <Link
      to={path}
      className="service-card group flex flex-col gap-4 rounded-lg border border-border bg-canvas p-6 transition-all hover:border-accent-blue hover:bg-canvas-tint hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-canvas-tint group-hover:bg-accent-blue/10">
        <Icon name={icon} size={24} className="text-navy group-hover:text-accent-blue" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-navy group-hover:text-accent-blue">
          {label}
        </h3>
        <p className="mt-2 text-sm text-slate">{description}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-accent-blue">
        Learn more
        <Icon name="arrow-right" size={16} />
      </div>
    </Link>
  );
}
