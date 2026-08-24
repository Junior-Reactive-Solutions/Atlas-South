import { Link } from 'react-router-dom';
import { Icon } from '@atlas-south/design-system';
import { useNoIndex } from '../hooks/useNoIndex.js';

/**
 * docs/build/06-PAGE-SPECIFICATIONS.md §3 "404 (Not Found)". Replaces the previous
 * site's bare 236-byte Apache default with real navigation back into the site — the
 * Header/Footer are still present via <Layout>, so navigation is never actually lost.
 * The hosting config (docs/build/12-HOSTING-DEPLOYMENT.md) must return a real HTTP 404
 * status for unmatched routes, not 200 — that's a server-config task, not something
 * this component can guarantee on its own.
 */
export function NotFound() {
  // Vercel's SPA rewrite serves this page with an HTTP 200 for every unmatched path
  // (a platform-level limitation of client-side routing, not fixable from the component) —
  // this meta tag is the only reliable way to stop it from being indexed as real content.
  useNoIndex();

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <Icon name="compass" size={40} className="mb-4 text-accent-blue" />
      <h1 className="font-display text-3xl uppercase text-navy">Page not found</h1>
      <p className="mt-4 text-slate">
        The page you're looking for doesn't exist or has moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="flex min-h-[44px] items-center rounded bg-accent-blue px-5 text-sm font-semibold uppercase tracking-wide text-white"
        >
          Home
        </Link>
        <Link
          to="/company/contact"
          className="flex min-h-[44px] items-center rounded border border-navy px-5 text-sm font-semibold uppercase tracking-wide text-navy"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
