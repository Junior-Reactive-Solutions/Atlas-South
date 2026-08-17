import { Outlet } from 'react-router-dom';
import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { usePageTracking } from '../../hooks/usePageTracking.js';
import { useHashScroll } from '../../hooks/useHashScroll.js';

/**
 * Master page template — docs/build/06-PAGE-SPECIFICATIONS.md §1.
 * Single <main> landmark (audit finding: previously missing entirely), Header/Footer
 * identical on every page. Used as a React Router layout route (App.tsx), so the page
 * content comes from the matched child route via <Outlet />, not a children prop.
 */
export function Layout() {
  // Track page views for analytics
  usePageTracking();
  // Makes /path#anchor links actually land on their section — see the hook's own note on
  // why the browser's native hash handling never fires in this app.
  useHashScroll();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
