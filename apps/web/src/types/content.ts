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
  homeCtaLabel: string;
  businessCtaLabel: string;
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
}

export interface CompanyContent {
  tagline: string;
  timeline: TimelineEntry[];
  missionStatement: string;
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

export interface PricingTier {
  label: string;
  startingFrom: string;
  description: string;
  includes: string[];
  icon: IconName;
}

export interface PackagesContent {
  title: string;
  heroDescription: string;
  intro: string;
  tiers: PricingTier[];
}
