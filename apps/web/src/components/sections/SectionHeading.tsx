interface SectionHeadingProps {
  /** Small uppercase kicker above the title, e.g. "OUR CORE SERVICES". */
  eyebrow?: string;
  title: string;
  /** Optional supporting sentence below the title. */
  subcopy?: string;
  /** Centre-align the block. Defaults to left, matching the detail-page templates. */
  align?: 'left' | 'center';
  /** Render light-on-dark, for use inside navy panels. */
  tone?: 'dark' | 'light';
}

/**
 * Section heading — the eyebrow + title + sub-copy triad that opens every major section.
 *
 * Exists because the inspiration site (abm.co.uk) opens essentially every block this way,
 * and repeating the markup per section is how the spacing and type scale drift apart.
 * See docs/build/06-PAGE-SPECIFICATIONS.md.
 */
export function SectionHeading({
  eyebrow,
  title,
  subcopy,
  align = 'left',
  tone = 'dark',
}: SectionHeadingProps) {
  const isCentered = align === 'center';
  const isLight = tone === 'light';

  return (
    <div className={isCentered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow && (
        <p
          className={`text-xs font-bold uppercase tracking-[0.18em] ${
            isLight ? 'text-white/70' : 'text-accent-blue'
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display text-3xl font-bold sm:text-4xl ${
          eyebrow ? 'mt-3' : ''
        } ${isLight ? 'text-white' : 'text-navy'}`}
      >
        {title}
      </h2>
      {subcopy && (
        <p className={`mt-4 text-base sm:text-lg ${isLight ? 'text-white/80' : 'text-slate'}`}>
          {subcopy}
        </p>
      )}
    </div>
  );
}
