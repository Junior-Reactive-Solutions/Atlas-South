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
  /** The certifying body's own badge image, shown instead of `icon` when present. */
  logo?: string;
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
  /**
   * Optional, not required: earlier seeded content omitted this field entirely on every
   * tier, and something reading `.length` off it unconditionally crashed the whole page.
   * Render call sites must guard for it being absent, not just empty.
   */
  includes?: string[];
  /**
   * Features shown struck through / greyed out — what this tier does NOT cover. The
   * original site's packages section showed both included and excluded items side by
   * side per tier (e.g. Starter: "✗ Security services", "✗ Commercial cleaning"), which
   * the audit called out as a genuine strength: it pre-qualifies leads by letting a buyer
   * self-select before enquiring, rather than finding out after contact that a tier
   * doesn't cover what they need.
   */
  excludes?: string[];
  /** Renders the "Most Popular" badge and a highlighted card treatment on this tier. */
  popular?: boolean;
  /** PayPal billing plan id for this tier's recurring subscription — see paypal.ts. */
  paypalPlanId?: string;
  icon: IconName;
}

export interface PackagesContent {
  eyebrow?: string;
  title: string;
  heroDescription: string;
  intro: string;
  /** e.g. "Cancel anytime · 30 days notice" — shown near the pricing grid. */
  cancellationNote?: string;
  tiers: PricingTier[];
}
