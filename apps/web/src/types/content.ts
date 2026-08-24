import type { IconName } from '@atlas-south/design-system';

export interface ServiceContent {
  title: string;
  icon: IconName;
  heroDescription: string;
  overview: string;
  features: Array<{ icon: IconName; title: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
  relatedServices?: Array<{ label: string; path: string }>;
}

export interface IndustryContent {
  title: string;
  icon: IconName;
  heroDescription: string;
  overview: string;
  challenges: string;
  ourApproach: string;
  serviceHighlights: Array<{ serviceLabel: string; description: string }>;
  relatedServices?: Array<{ label: string; path: string }>;
}

export interface ServiceAreaContent {
  title: string;
  icon: IconName;
  heroDescription: string;
  overview: string;
  responseTime: string;
  coverage: string;
  localProof?: string;
}

export interface HomeContent {
  headlineLines: [string, string, string];
  subcopy: string;
  primaryCtaLabel: string;
  /** Hero secondary link → the on-page services panel. */
  servicesCtaLabel: string;
  /** Hero secondary link → the on-page industries grid. */
  industriesCtaLabel: string;
  /** Optional — Home falls back to MISSION_FALLBACK if an older DB row omits it. */
  missionStatement?: string;
}

export interface TimelineEntry {
  year: number;
  title: string;
  body: string;
  icon: IconName;
}

export interface ValueItem {
  icon: IconName;
  title: string;
  body: string;
}

export interface TeamMember {
  role: string;
  since: number;
  bio: string;
}

export interface CertificationItem {
  icon: IconName;
  title: string;
  body: string;
  /** The certifying body's own badge image, shown instead of `icon` when present. */
  logo?: string;
}

export interface CompanyContent {
  tagline: string;
  timeline: TimelineEntry[];
  missionStatement: string;
  /**
   * Optional — an already-seeded database row from before this field existed won't have
   * it. About.tsx's Vision & Mission section renders the Vision column only when present,
   * rather than crashing or showing an empty box for a stale row.
   */
  visionStatement?: string;
  values: ValueItem[];
  team: TeamMember[];
  certifications: CertificationItem[];
  stats: Array<{ label: string; value: string }>;
}

export interface BenefitItem {
  icon?: IconName;
  title: string;
  description: string;
}

export interface OpenRole {
  title: string;
  icon: IconName;
  location: string;
  hours: string;
  payRange: string;
  startAvailability: string;
  description?: string;
}

export interface CareersContent {
  intro: string;
  benefits: BenefitItem[];
  openRoles: OpenRole[];
  rightToWorkNote?: string;
}

// PricingTier / PackagesContent removed 2026-08-24 at the client's explicit request: no
// pricing of any kind is to be displayed on the website. The /packages page, its nav entry,
// footer/header links, the homepage pricing teaser, and the PayPal subscription components
// that rendered on it were removed in the same change — see git history on this file.
