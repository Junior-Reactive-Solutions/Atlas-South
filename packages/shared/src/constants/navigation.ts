/**
 * Single source of truth for the site's information architecture.
 * Mirrors the client's navigation brief and docs/build/06-PAGE-SPECIFICATIONS.md.
 *
 * The header nav, footer columns, sitemap generator, and the enquiry form's
 * "service requested" dropdown all import from here — this is what makes a dead link
 * or a nav/footer mismatch structurally impossible rather than something to remember
 * to keep in sync by hand (the exact class of bug the original audit found ~90 of).
 */

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string; // lucide-react icon name, see docs/build/01-BRAND-SYSTEM.md §5
  /** true while real content is pending — docs/build/06-PAGE-SPECIFICATIONS.md */
  placeholder?: boolean;
}

export const COMPANY_PAGES: NavItem[] = [
  { id: 'mission', label: 'Mission', path: '/company#mission', icon: 'target' },
  { id: 'vision', label: 'Vision', path: '/company#vision', icon: 'eye' },
  { id: 'join-us', label: 'Join Us', path: '/company/join-us', icon: 'users' },
  { id: 'contact-us', label: 'Contact Us', path: '/company/contact', icon: 'mail' },
];

export const HARD_SERVICES: NavItem[] = [
  { id: 'electricals', label: 'Electricals', path: '/hard-services/electricals', icon: 'zap' },
  { id: 'plumbing', label: 'Plumbing', path: '/hard-services/plumbing', icon: 'wrench' },
  { id: 'reactive-maintenance', label: 'Reactive Maintenance', path: '/hard-services/reactive-maintenance', icon: 'hammer' },
  { id: 'fire-safety', label: 'Fire & Safety', path: '/hard-services/fire-safety', icon: 'flame', placeholder: true },
];

export const SOFT_SERVICES: NavItem[] = [
  { id: 'facilities-management', label: 'Facilities Management', path: '/soft-services/facilities-management', icon: 'building-2' },
  { id: 'security', label: 'Security Services', path: '/soft-services/security', icon: 'shield-check' },
  { id: 'commercial-cleaning', label: 'Commercial Cleaning', path: '/soft-services/commercial-cleaning', icon: 'spray-can' },
  { id: 'catering', label: 'Catering', path: '/soft-services/catering', icon: 'utensils', placeholder: true },
  { id: 'aviation', label: 'Aviation Services', path: '/soft-services/aviation', icon: 'plane', placeholder: true },
  { id: 'concierge', label: 'Concierge', path: '/soft-services/concierge', icon: 'concierge-bell', placeholder: true },
  { id: 'waste-recycling', label: 'Waste & Recycling', path: '/soft-services/waste-recycling', icon: 'recycle', placeholder: true },
];

export const INDUSTRIES: NavItem[] = [
  { id: 'government-public-sector', label: 'Government & Public Sector', path: '/industries/government-public-sector', icon: 'landmark', placeholder: true },
  { id: 'corporate', label: 'Corporate', path: '/industries/corporate', icon: 'briefcase' },
  { id: 'healthcare', label: 'Healthcare', path: '/industries/healthcare', icon: 'cross' },
  { id: 'oil-gas', label: 'Oil & Gas', path: '/industries/oil-gas', icon: 'flame-kindling', placeholder: true },
  { id: 'retail', label: 'Retail', path: '/industries/retail', icon: 'shopping-bag' },
  { id: 'manufacturing', label: 'Manufacturing', path: '/industries/manufacturing', icon: 'factory', placeholder: true },
  { id: 'education', label: 'Education & Learning Institutions', path: '/industries/education', icon: 'graduation-cap' },
  { id: 'data-centres', label: 'Data Centres', path: '/industries/data-centres', icon: 'server', placeholder: true },
  { id: 'venues', label: 'Venues', path: '/industries/venues', icon: 'theater', placeholder: true },
];

export const SERVICE_AREAS: NavItem[] = [
  { id: 'central-london', label: 'Central London', path: '/areas/central-london', icon: 'map-pin' },
  { id: 'south-east-london', label: 'South East London', path: '/areas/south-east-london', icon: 'map-pin' },
  { id: 'north-london', label: 'North London', path: '/areas/north-london', icon: 'map-pin' },
  { id: 'east-london', label: 'East London', path: '/areas/east-london', icon: 'map-pin' },
  { id: 'west-london', label: 'West London', path: '/areas/west-london', icon: 'map-pin' },
  { id: 'surrey-kent', label: 'Surrey & Kent', path: '/areas/surrey-kent', icon: 'map-pin' },
];

/** Residential/homeowner offering — retained per docs/agile/user-stories.md decision 1. */
export const PACKAGES_PAGE: NavItem = {
  id: 'packages',
  label: 'Packages',
  path: '/packages',
  icon: 'package',
};

export const LEGAL_PAGES: NavItem[] = [
  { id: 'privacy-policy', label: 'Privacy Policy', path: '/legal/privacy-policy', icon: 'shield' },
  { id: 'terms-of-use', label: 'Terms of Use', path: '/legal/terms-of-use', icon: 'file-text' },
];

/** Every enquiry-eligible service, used to build the quote form's dropdown + validation enum. */
export const ALL_SERVICES = [...HARD_SERVICES, ...SOFT_SERVICES] as const;

export const ALL_NAV_ITEMS = [
  ...COMPANY_PAGES,
  ...HARD_SERVICES,
  ...SOFT_SERVICES,
  ...INDUSTRIES,
  ...SERVICE_AREAS,
  PACKAGES_PAGE,
  ...LEGAL_PAGES,
] as const;
