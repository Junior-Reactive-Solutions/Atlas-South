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
import { Plumbing } from './pages/services/Plumbing';
import { Corporate } from './pages/industries/Corporate';
import { Healthcare } from './pages/industries/Healthcare';
import { Retail } from './pages/industries/Retail';
import { Education } from './pages/industries/Education';

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
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Company — Mission/Vision live as anchors on one page per user-stories.md C2 */}
        <Route
          path="/company"
          element={<PageStub title="Company — Mission & Vision" icon="target" specRef="docs/build/06-PAGE-SPECIFICATIONS.md — Company" />}
        />
        {stubRoutes(COMPANY_ROUTES, 'docs/build/06-PAGE-SPECIFICATIONS.md — Company')}

        {/* Built-out service pages (Sprint 4+) — these take precedence over stubRoutes */}
        <Route path="/hard-services/plumbing" element={<Plumbing />} />

        {/* Built-out industry pages (Sprint 5+) — these take precedence over stubRoutes */}
        <Route path="/industries/corporate" element={<Corporate />} />
        <Route path="/industries/healthcare" element={<Healthcare />} />
        <Route path="/industries/retail" element={<Retail />} />
        <Route path="/industries/education" element={<Education />} />

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
    </Layout>
  );
}
