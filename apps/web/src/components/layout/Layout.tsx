import type { ReactNode } from 'react';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { usePageTracking } from '../../hooks/usePageTracking.js';

/**
 * Master page template — docs/build/06-PAGE-SPECIFICATIONS.md §1.
 * Single <main> landmark (audit finding: previously missing entirely), Header/Footer
 * identical on every page.
 */
export function Layout({ children }: { children: ReactNode }) {
  // Track page views for analytics
  usePageTracking();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
