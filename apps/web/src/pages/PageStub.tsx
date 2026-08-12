import { useEffect } from 'react';
import { Icon, type IconName } from '@atlas-south/design-system';
import { useNoIndex } from '../hooks/useNoIndex.js';
import { useIsNavItemHidden } from '../hooks/useNavVisibility.js';
import { NotFound } from './NotFound';

interface PageStubProps {
  /** Nav item id, so a stub for a page hidden in the admin panel can 404 instead. */
  navId: string;
  title: string;
  icon: IconName;
  /** true for the 5 service lines / 5 industries with no existing content —
   * docs/build/06-PAGE-SPECIFICATIONS.md §2. */
  placeholder?: boolean;
  /** e.g. "docs/build/06-PAGE-SPECIFICATIONS.md — Hard Services" */
  specRef: string;
}

/**
 * Temporary content for every page not yet built out. Exists so that during
 * incremental Sprint 1–9 delivery, every nav/footer link the client sees resolves to
 * a real, on-brand page rather than a 404 or (worse) the old href="#" pattern the
 * audit flagged ~90 instances of. Each stub cites exactly which spec document will
 * replace it and when, so nothing here is a silent placeholder.
 */
export function PageStub({ navId, title, icon, placeholder, specRef }: PageStubProps) {
  const isHidden = useIsNavItemHidden(navId);

  useEffect(() => {
    // Skipped when hidden — otherwise the tab title still announces the page name of
    // something we are rendering as "not found", which both looks broken and confirms
    // the page exists.
    if (isHidden) return;
    document.title = `${title} | Atlas South Technical Services`;
  }, [title, isHidden]);

  // Thin "under construction" content has no business ranking in search — keep it out
  // of the index until real content ships, same pattern as the /admin subtree.
  useNoIndex();

  // The five unbuilt industries have no ContentPage row, so there is no content request
  // to 404 for them — this is where hiding is enforced for those routes.
  if (isHidden) return <NotFound />;

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <Icon name={icon} size={40} className="mb-4 text-accent-blue" />
      <h1 className="font-display text-3xl uppercase text-navy">{title}</h1>
      <p className="mt-4 text-slate">
        This page is under construction as part of the Atlas South rebuild.
        {placeholder && (
          <>
            {' '}
            It will ship with believable, clearly-marked placeholder content pending
            real details from the client, per the resolved scope decision in{' '}
            <code>docs/agile/user-stories.md</code>.
          </>
        )}
      </p>
      <p className="mt-2 text-xs uppercase tracking-wide text-slate/70">
        Spec: {specRef}
      </p>
    </div>
  );
}
