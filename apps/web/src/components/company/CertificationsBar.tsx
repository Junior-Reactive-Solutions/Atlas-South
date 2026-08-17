import { Icon, type IconName } from '@atlas-south/design-system';

interface CertificationItem {
  icon: IconName;
  title: string;
  body: string;
  /** The certifying body's own badge image, shown instead of `icon` when present. */
  logo?: string;
}

/**
 * The generic `award` glyph every certification used to share told a visitor nothing —
 * it couldn't distinguish Gas Safe from NICEIC from ISO 9001 at a glance, and it isn't
 * what a real accreditation body's mark looks like. `logo`, when supplied, renders that
 * body's actual badge image instead (client-supplied, apps/web/public/certifications/);
 * `icon` remains the fallback for any certification added later without one ready.
 */
export function CertificationsBar({ certifications }: { certifications: CertificationItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {certifications.map((cert) => (
        <div key={cert.title} className="flex flex-col items-center rounded-lg border border-border bg-canvas p-4 text-center">
          {cert.logo ? (
            <div className="mb-3 flex h-14 w-full items-center justify-center">
              <img src={cert.logo} alt={`${cert.title} certification mark`} className="h-full max-w-[88px] object-contain" />
            </div>
          ) : (
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/10">
              <Icon name={cert.icon} size={20} className="text-accent-blue" aria-hidden="true" />
            </div>
          )}
          <h3 className="font-semibold text-navy">{cert.title}</h3>
          <p className="mt-2 text-xs text-slate">{cert.body}</p>
        </div>
      ))}
    </div>
  );
}
