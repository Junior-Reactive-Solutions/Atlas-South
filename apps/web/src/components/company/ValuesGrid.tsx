import { Icon, type IconName } from '@atlas-south/design-system';

interface ValueItem {
  icon: IconName;
  title: string;
  body: string;
}

export function ValuesGrid({ values }: { values: ValueItem[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {values.map((value) => (
        <div key={value.title} className="rounded-lg border border-border bg-canvas p-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10">
            <Icon name={value.icon} size={20} className="text-accent-blue" />
          </div>
          <h3 className="font-semibold text-navy">{value.title}</h3>
          <p className="mt-2 text-sm text-slate">{value.body}</p>
        </div>
      ))}
    </div>
  );
}
