import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  HARD_SERVICES,
  SOFT_SERVICES,
  INDUSTRIES,
  SERVICE_AREAS,
  type NavItem,
} from '@atlas-south/shared';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/admin/AdminLayout.js';
import { Home } from './pages/Home';
import { PageStub } from './pages/PageStub';
import { NotFound } from './pages/NotFound';
import { PageLoadingFallback } from './components/PageLoadingFallback.js';

// Admin pages — not lazy loaded (small, always together)
import { AdminLogin } from './pages/admin/Login.js';
import { AdminDashboard } from './pages/admin/Dashboard.js';
import { AdminEnquiries } from './pages/admin/Enquiries.js';
import { AdminApplications } from './pages/admin/Applications.js';
import { AdminSettings } from './pages/admin/Settings.js';
import { AdminAnalytics } from './pages/admin/Analytics.js';
import { AdminContent } from './pages/admin/Content.js';
import { AdminVisibility } from './pages/admin/Visibility.js';
import { AdminContentEdit } from './pages/admin/ContentEdit.js';

// Legal pages
import { TermsOfUse } from './pages/legal/TermsOfUse.js';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy.js';
import { CookiePolicy } from './pages/legal/CookiePolicy.js';

// Route-level code splitting — docs/build/09-SEO-PERFORMANCE-CHECKLIST.md
// Each route lazy-loads its chunk on demand, reducing initial bundle size
const Plumbing = lazy(() => import('./pages/services/Plumbing.js').then((m) => ({ default: m.Plumbing })));
const Electricals = lazy(() => import('./pages/services/Electricals.js').then((m) => ({ default: m.Electricals })));
const ReactiveMaintenance = lazy(() => import('./pages/services/ReactiveMaintenance.js').then((m) => ({ default: m.ReactiveMaintenance })));
const FacilitiesManagement = lazy(() => import('./pages/services/FacilitiesManagement.js').then((m) => ({ default: m.FacilitiesManagement })));
const SecurityServices = lazy(() => import('./pages/services/SecurityServices.js').then((m) => ({ default: m.SecurityServices })));
const CommercialCleaning = lazy(() => import('./pages/services/CommercialCleaning.js').then((m) => ({ default: m.CommercialCleaning })));
const Catering = lazy(() => import('./pages/services/Catering.js').then((m) => ({ default: m.Catering })));
const AviationServices = lazy(() => import('./pages/services/AviationServices.js').then((m) => ({ default: m.AviationServices })));
const Concierge = lazy(() => import('./pages/services/Concierge.js').then((m) => ({ default: m.Concierge })));
const ParkingLotManagement = lazy(() =>
  import('./pages/services/ParkingLotManagement.js').then((m) => ({ default: m.ParkingLotManagement }))
);
const Corporate = lazy(() => import('./pages/industries/Corporate.js').then((m) => ({ default: m.Corporate })));
const Healthcare = lazy(() => import('./pages/industries/Healthcare.js').then((m) => ({ default: m.Healthcare })));
const Retail = lazy(() => import('./pages/industries/Retail.js').then((m) => ({ default: m.Retail })));
const Education = lazy(() => import('./pages/industries/Education.js').then((m) => ({ default: m.Education })));
const GovernmentPublicSector = lazy(() =>
  import('./pages/industries/GovernmentPublicSector.js').then((m) => ({ default: m.GovernmentPublicSector }))
);
const OilGas = lazy(() => import('./pages/industries/OilGas.js').then((m) => ({ default: m.OilGas })));
const Manufacturing = lazy(() => import('./pages/industries/Manufacturing.js').then((m) => ({ default: m.Manufacturing })));
const DataCentres = lazy(() => import('./pages/industries/DataCentres.js').then((m) => ({ default: m.DataCentres })));
const Venues = lazy(() => import('./pages/industries/Venues.js').then((m) => ({ default: m.Venues })));
const CentralLondon = lazy(() => import('./pages/areas/CentralLondon.js').then((m) => ({ default: m.CentralLondon })));
const SouthEastLondon = lazy(() => import('./pages/areas/SouthEastLondon.js').then((m) => ({ default: m.SouthEastLondon })));
const NorthLondon = lazy(() => import('./pages/areas/NorthLondon.js').then((m) => ({ default: m.NorthLondon })));
const EastLondon = lazy(() => import('./pages/areas/EastLondon.js').then((m) => ({ default: m.EastLondon })));
const WestLondon = lazy(() => import('./pages/areas/WestLondon.js').then((m) => ({ default: m.WestLondon })));
const SurreyKent = lazy(() => import('./pages/areas/SurreyKent.js').then((m) => ({ default: m.SurreyKent })));
const About = lazy(() => import('./pages/company/About.js').then((m) => ({ default: m.About })));
const VisionMission = lazy(() => import('./pages/company/VisionMission.js').then((m) => ({ default: m.VisionMission })));
const Contact = lazy(() => import('./pages/company/Contact.js').then((m) => ({ default: m.Contact })));
const Careers = lazy(() => import('./pages/careers/Careers.js').then((m) => ({ default: m.Careers })));


function stubRoutes(items: NavItem[], specRef: string) {
  return items.map((item) => (
    <Route
      key={item.id}
      path={item.path}
      element={
        <PageStub
          navId={item.id}
          title={item.label}
          icon={item.icon}
          placeholder={item.placeholder}
          specRef={specRef}
        />
      }
    />
  ));
}

export default function App() {
  return (
    <>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Admin panel routes — separate from public site layout */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          {/* Redirect post-login mustChangePassword flow to Settings where the form lives */}
          <Route path="/admin/change-password" element={<Navigate to="/admin/settings" replace />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/enquiries" element={<AdminEnquiries />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/content" element={<AdminContent />} />
            <Route path="/admin/visibility" element={<AdminVisibility />} />
            <Route path="/admin/content/:slug" element={<AdminContentEdit />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* Legal pages */}
          <Route path="/legal/terms" element={<TermsOfUse />} />
          <Route path="/legal/privacy" element={<PrivacyPolicy />} />
          <Route path="/legal/cookies" element={<CookiePolicy />} />

          {/* Public site wrapped in Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />

          {/* Company pages */}
          <Route path="/company" element={<About />} />
          <Route path="/company/vision-mission" element={<VisionMission />} />
          <Route path="/company/contact" element={<Contact />} />
          <Route path="/company/join-us" element={<Careers />} />

          {/* Built-out service pages (Sprint 4+) — lazy-loaded for performance */}
          <Route path="/hard-services/plumbing" element={<Plumbing />} />
          <Route path="/hard-services/electricals" element={<Electricals />} />
          <Route path="/hard-services/reactive-maintenance" element={<ReactiveMaintenance />} />
          <Route path="/soft-services/facilities-management" element={<FacilitiesManagement />} />
          <Route path="/soft-services/security" element={<SecurityServices />} />
          <Route path="/soft-services/commercial-cleaning" element={<CommercialCleaning />} />
          <Route path="/soft-services/catering" element={<Catering />} />
          <Route path="/soft-services/aviation" element={<AviationServices />} />
          <Route path="/soft-services/concierge" element={<Concierge />} />
          <Route path="/soft-services/parking-lot-management" element={<ParkingLotManagement />} />

          {/* Built-out industry pages (Sprint 5+) — lazy-loaded for performance */}
          <Route path="/industries/corporate" element={<Corporate />} />
          <Route path="/industries/healthcare" element={<Healthcare />} />
          <Route path="/industries/retail" element={<Retail />} />
          <Route path="/industries/education" element={<Education />} />
          <Route path="/industries/government-public-sector" element={<GovernmentPublicSector />} />
          <Route path="/industries/oil-gas" element={<OilGas />} />
          <Route path="/industries/manufacturing" element={<Manufacturing />} />
          <Route path="/industries/data-centres" element={<DataCentres />} />
          <Route path="/industries/venues" element={<Venues />} />

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


            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
