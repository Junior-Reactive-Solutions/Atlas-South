import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  HARD_SERVICES,
  SOFT_SERVICES,
  INDUSTRIES,
  SERVICE_AREAS,
  PACKAGES_PAGE,
  LEGAL_PAGES,
  type NavItem,
} from '@atlas-south/shared';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { PageStub } from './pages/PageStub';
import { NotFound } from './pages/NotFound';

// Route-level code splitting — docs/build/09-SEO-PERFORMANCE-CHECKLIST.md
// Each route lazy-loads its chunk on demand, reducing initial bundle size
const Plumbing = lazy(() => import('./pages/services/Plumbing.js').then((m) => ({ default: m.Plumbing })));
const Corporate = lazy(() => import('./pages/industries/Corporate.js').then((m) => ({ default: m.Corporate })));
const Healthcare = lazy(() => import('./pages/industries/Healthcare.js').then((m) => ({ default: m.Healthcare })));
const Retail = lazy(() => import('./pages/industries/Retail.js').then((m) => ({ default: m.Retail })));
const Education = lazy(() => import('./pages/industries/Education.js').then((m) => ({ default: m.Education })));
const CentralLondon = lazy(() => import('./pages/areas/CentralLondon.js').then((m) => ({ default: m.CentralLondon })));
const SouthEastLondon = lazy(() => import('./pages/areas/SouthEastLondon.js').then((m) => ({ default: m.SouthEastLondon })));
const NorthLondon = lazy(() => import('./pages/areas/NorthLondon.js').then((m) => ({ default: m.NorthLondon })));
const EastLondon = lazy(() => import('./pages/areas/EastLondon.js').then((m) => ({ default: m.EastLondon })));
const WestLondon = lazy(() => import('./pages/areas/WestLondon.js').then((m) => ({ default: m.WestLondon })));
const SurreyKent = lazy(() => import('./pages/areas/SurreyKent.js').then((m) => ({ default: m.SurreyKent })));

/** Loading fallback shown while route chunk is being fetched. */
function RouteLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate border-t-accent-blue" />
        <p className="mt-4 text-sm text-slate">Loading...</p>
      </div>
    </div>
  );
}

/** Company pages that resolve to real, distinct routes (not the /company#anchor pair). */
const COMPANY_ROUTES: NavItem[] = [
  { id: 'join-us', label: 'Join Us', path: '/company/join-us', icon: 'users' },
  { id: 'contact-us', label: 'Contact Us', path: '/company/contact', icon: 'mail' },
];

function stubRoutes(items: NavItem[], specRef: string) {
  return items.map((item) => (
    <Route
      key={item.id}
      path={item.path}
      element={<PageStub title={item.label} icon={item.icon} placeholder={item.placeholder} specRef={specRef} />}
    />
  ));
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Company — Mission/Vision live as anchors on one page per user-stories.md C2 */}
          <Route
            path="/company"
            element={<PageStub title="Company — Mission & Vision" icon="target" specRef="docs/build/06-PAGE-SPECIFICATIONS.md — Company" />}
          />
          {stubRoutes(COMPANY_ROUTES, 'docs/build/06-PAGE-SPECIFICATIONS.md — Company')}

          {/* Built-out service pages (Sprint 4+) — lazy-loaded for performance */}
          <Route path="/hard-services/plumbing" element={<Plumbing />} />

          {/* Built-out industry pages (Sprint 5+) — lazy-loaded for performance */}
          <Route path="/industries/corporate" element={<Corporate />} />
          <Route path="/industries/healthcare" element={<Healthcare />} />
          <Route path="/industries/retail" element={<Retail />} />
          <Route path="/industries/education" element={<Education />} />

          {/* Built-out service area pages (Sprint 6+) — lazy-loaded for performance */}
          <Route path="/areas/central-london" element={<CentralLondon />} />
          <Route path="/areas/south-east-london" element={<SouthEastLondon />} />
          <Route path="/areas/north-london" element={<NorthLondon />} />
          <Route path="/areas/east-london" element={<EastLondon />} />
          <Route path="/areas/west-london" element={<WestLondon />} />
          <Route path="/areas/surrey-kent" element={<SurreyKent />} />

          {stubRoutes(HARD_SERVICES, 'docs/build/06-PAGE-SPECIFICATIONS.md — Hard Services')}
          {stubRoutes(SOFT_SERVICES, 'docs/build/06-PAGE-SPECIFICATIONS.md — Soft Services')}
          {stubRoutes(INDUSTRIES, 'docs/build/06-PAGE-SPECIFICATIONS.md — Industries')}
          {stubRoutes(SERVICE_AREAS, 'docs/build/06-PAGE-SPECIFICATIONS.md — Service Areas')}
          {stubRoutes(LEGAL_PAGES, 'docs/build/10-LEGAL-CONTENT-PLAN.md')}

          <Route
            path={PACKAGES_PAGE.path}
            element={<PageStub title={PACKAGES_PAGE.label} icon="package" specRef="docs/build/06-PAGE-SPECIFICATIONS.md — Home & Company" />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
