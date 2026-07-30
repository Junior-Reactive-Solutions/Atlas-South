import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Master page template — docs/build/06-PAGE-SPECIFICATIONS.md §1.
 * Single <main> landmark (audit finding: previously missing entirely), Header/Footer
 * identical on every page.
 */
export function Layout({ children }: { children: ReactNode }) {
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
