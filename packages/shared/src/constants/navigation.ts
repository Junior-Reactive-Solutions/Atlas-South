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
  { id: 'about-us', label: 'About Us', path: '/company', icon: 'building-2' },
  { id: 'vision-mission', label: 'Vision & Mission', path: '/company/vision-mission', icon: 'compass' },
  { id: 'join-us', label: 'Join Us', path: '/company/join-us', icon: 'users' },
  { id: 'contact-us', label: 'Contact Us', path: '/company/contact', icon: 'mail' },
  // Added 2026-09-01. `placeholder: true` keeps it out of the public header and footer
  // (both already filter placeholders) until real case studies are published — the route
  // and the library page exist and work, but linking to an empty library from every page
  // advertises proof we cannot yet show. Drop the flag once the first write-up is live.
  { id: 'case-studies', label: 'Case Studies', path: '/case-studies', icon: 'file-text', placeholder: true },
];

// Fire & Safety removed 2026-08-20 at the client's request — no replacement page.
export const HARD_SERVICES: NavItem[] = [
  { id: 'electricals', label: 'Electricals', path: '/hard-services/electricals', icon: 'zap' },
  { id: 'plumbing', label: 'Plumbing', path: '/hard-services/plumbing', icon: 'wrench' },
  { id: 'reactive-maintenance', label: 'Reactive Maintenance', path: '/hard-services/reactive-maintenance', icon: 'hammer' },
];

// Waste & Recycling removed 2026-08-20 at the client's request, replaced in this slot by
// Parking Lot Management — moved here from INDUSTRIES, since its content (sweeping,
// pressure washing, line marking, equipment maintenance) is a service offering like the
// rest of this list, not a client vertical like Healthcare or Oil & Gas.
export const SOFT_SERVICES: NavItem[] = [
  { id: 'facilities-management', label: 'Facilities Management', path: '/soft-services/facilities-management', icon: 'building-2' },
  { id: 'security', label: 'Security Services', path: '/soft-services/security', icon: 'shield-check' },
  { id: 'commercial-cleaning', label: 'Commercial Cleaning', path: '/soft-services/commercial-cleaning', icon: 'spray-can' },
  { id: 'catering', label: 'Catering', path: '/soft-services/catering', icon: 'utensils' },
  { id: 'aviation', label: 'Aviation Services', path: '/soft-services/aviation', icon: 'plane' },
  { id: 'concierge', label: 'Concierge', path: '/soft-services/concierge', icon: 'concierge-bell' },
  { id: 'parking-lot-management', label: 'Parking Lot Management', path: '/soft-services/parking-lot-management', icon: 'square-parking' },
  // Added 2026-08-26 from the client's Rail sector one-pager (Atlas-South-Rail-Facilities.pdf)
  // — cleaning and facilities management for stations, platforms, depots and rail
  // infrastructure. Sector-specific rather than folded into the general Facilities
  // Management listing above, since the actual sell here (engineering-window scheduling,
  // trackside-adjacent access, rail-operator compliance documentation) is specific to rail
  // environments and doesn't apply to a typical office/retail FM contract.
  { id: 'rail-facilities', label: 'Rail Facilities', path: '/soft-services/rail-facilities', icon: 'train-front' },
  // Added 2026-08-31 — the original site (atlassouthes.com) offered interior painting as a
  // standalone service (per-borough landing pages); the rebuild had no equivalent. See the
  // fuller note on the content entry itself (packages/shared/src/content/extracted-pages.ts).
  { id: 'interior-painting', label: 'Interior Painting', path: '/soft-services/interior-painting', icon: 'brush' },
];

export const INDUSTRIES: NavItem[] = [
  { id: 'government-public-sector', label: 'Government & Public Sector', path: '/industries/government-public-sector', icon: 'landmark' },
  { id: 'corporate', label: 'Corporate', path: '/industries/corporate', icon: 'briefcase' },
  { id: 'healthcare', label: 'Healthcare', path: '/industries/healthcare', icon: 'cross' },
  { id: 'oil-gas', label: 'Oil & Gas', path: '/industries/oil-gas', icon: 'flame-kindling' },
  { id: 'retail', label: 'Retail', path: '/industries/retail', icon: 'shopping-bag' },
  { id: 'manufacturing', label: 'Manufacturing', path: '/industries/manufacturing', icon: 'factory' },
  { id: 'education', label: 'Education & Learning Institutions', path: '/industries/education', icon: 'graduation-cap' },
  { id: 'data-centres', label: 'Data Centres', path: '/industries/data-centres', icon: 'server' },
  { id: 'venues', label: 'Venues', path: '/industries/venues', icon: 'theater' },
];

export const SERVICE_AREAS: NavItem[] = [
  { id: 'central-london', label: 'Central London', path: '/areas/central-london', icon: 'map-pin' },
  { id: 'south-east-london', label: 'South East London', path: '/areas/south-east-london', icon: 'map-pin' },
  { id: 'north-london', label: 'North London', path: '/areas/north-london', icon: 'map-pin' },
  { id: 'east-london', label: 'East London', path: '/areas/east-london', icon: 'map-pin' },
  { id: 'west-london', label: 'West London', path: '/areas/west-london', icon: 'map-pin' },
  { id: 'surrey-kent', label: 'Surrey & Kent', path: '/areas/surrey-kent', icon: 'map-pin' },
];

// PACKAGES_PAGE (the /packages pricing page) removed 2026-08-24 at the client's explicit
// request: no pricing of any kind is to be displayed anywhere on the site.
export const LEGAL_PAGES: NavItem[] = [
  { id: 'privacy-policy', label: 'Privacy Policy', path: '/legal/privacy', icon: 'shield' },
  { id: 'terms-of-use', label: 'Terms of Use', path: '/legal/terms', icon: 'file-text' },
  { id: 'cookie-policy', label: 'Cookie Policy', path: '/legal/cookies', icon: 'cookie' },
];

/** Every enquiry-eligible service, used to build the quote form's dropdown + validation enum. */
export const ALL_SERVICES = [...HARD_SERVICES, ...SOFT_SERVICES] as const;

export const ALL_NAV_ITEMS = [
  ...COMPANY_PAGES,
  ...HARD_SERVICES,
  ...SOFT_SERVICES,
  ...INDUSTRIES,
  ...SERVICE_AREAS,
  ...LEGAL_PAGES,
] as const;
