import { Icon, type IconName } from '@atlas-south/design-system';

interface CertificationItem {
  icon: IconName;
  title: string;
  body: string;
}

export function CertificationsBar({ certifications }: { certifications: CertificationItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {certifications.map((cert) => (
        <div key={cert.title} className="flex flex-col items-center rounded-lg border border-border bg-canvas p-4 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10">
            <Icon name={cert.icon} size={20} className="text-accent-blue" aria-hidden="true" />
          </div>
          <h3 className="font-semibold text-navy">{cert.title}</h3>
          <p className="mt-2 text-xs text-slate">{cert.body}</p>
        </div>
      ))}
    </div>
  );
}
