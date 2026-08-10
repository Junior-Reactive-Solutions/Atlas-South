import { Icon, type IconName } from '@atlas-south/design-system';

interface TimelineEntry {
  year: number;
  title: string;
  body: string;
  icon: IconName;
}

export function TimelineSection({ timeline }: { timeline: TimelineEntry[] }) {
  return (
    <div className="space-y-8">
      {timeline.map((entry, idx) => (
        <div key={entry.year} className="flex gap-6">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent-blue bg-accent-blue/10">
              <Icon name={entry.icon} size={20} className="text-accent-blue" aria-hidden="true" />
            </div>
            {idx < timeline.length - 1 && (
              <div className="h-12 w-0.5 bg-border" style={{ marginTop: '1rem' }} />
            )}
          </div>
          <div className="flex-1 pb-8">
            <p className="font-display text-lg font-bold text-navy">{entry.year}</p>
            <h3 className="mt-1 text-sm font-semibold text-navy">{entry.title}</h3>
            <p className="mt-2 text-sm text-slate">{entry.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
