import { useEffect, useState } from 'react';

export interface SectionLink {
  /** Element id to scroll to — must match the section's `id` attribute. */
  id: string;
  label: string;
}

interface SectionNavProps {
  sections: SectionLink[];
}

/**
 * Sticky in-page navigation for the long detail pages.
 *
 * Two jobs. It tells someone at a glance what the page contains — "Overview, What we
 * provide, FAQs, Related services" — which is what turns a long page from intimidating
 * into navigable. And it lets an FM buyer who only came for the FAQs get there without
 * scrolling past five panels.
 *
 * The active-section highlight uses IntersectionObserver rather than scroll maths so it
 * stays correct when panels are different heights and when images load late and shift
 * things. Links are real anchors, so this works with the keyboard and without JavaScript
 * having decided anything.
 *
 * Hidden below lg: on a phone a sticky horizontal strip competes with the content for a
 * scarce 375px, and the header drawer already provides navigation.
 */
export function SectionNav({ sections }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer the entry nearest the top of the viewport among those intersecting,
        // otherwise a tall section lower down can steal the highlight from the one the
        // reader is actually looking at.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      {
        // Top offset clears the sticky header; the large bottom margin means a section
        // counts as "current" from when it reaches the upper third of the screen.
        rootMargin: '-96px 0px -60% 0px',
        threshold: 0,
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-16 z-30 hidden border-b border-border bg-canvas/95 backdrop-blur lg:block"
    >
      <div className="mx-auto max-w-7xl px-4">
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 py-4">
          {sections.map((section) => {
            const isActive = section.id === activeId;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`border-b-2 pb-1 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-accent-blue text-accent-blue'
                      : 'border-transparent text-slate hover:text-navy'
                  }`}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
