import type { IconName } from '@atlas-south/design-system';

export interface ServiceContent {
  title: string;
  /** Optional, more detailed <title> tag — falls back to `title` alone when absent. Kept
   * separate from `title` because `title` also renders as the page's on-page H1; a
   * keyword-rich SEO title and a clean, readable H1 don't have to be the same string.
   * Added 2026-08-31 as part of a site-wide title audit (client request: "clear and
   * detailed... professional, up-to-standard title to every page"). */
  seoTitle?: string;
  /** Optional purpose-written meta description (140–160 chars) for search results and link
   * previews — falls back to `heroDescription` when absent. Separate for the same reason
   * `seoTitle` is: `heroDescription` is on-page hero copy, written to be read above the
   * fold, and is routinely far outside the length a preview can actually show. Added
   * 2026-08-31 after an audit found 34 of 37 pages outside the 140–160 target — 26 of them
   * because they were reusing hero copy verbatim. */
  seoDescription?: string;
  icon: IconName;
  heroDescription: string;
  overview: string;
  features: Array<{ icon: IconName; title: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
  relatedServices?: Array<{ label: string; path: string }>;
}

export interface IndustryContent {
  title: string;
  /** See the same field on ServiceContent for why this exists separately from `title`. */
  seoTitle?: string;
  /** See the same field on ServiceContent. */
  seoDescription?: string;
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
  /** See the same field on ServiceContent for why this exists separately from `title`. */
  seoTitle?: string;
  /** See the same field on ServiceContent. */
  seoDescription?: string;
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
  /** Intro paragraph below the headline, describing Atlas South's focus and mission. */
  intro?: string;
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
  /** URL slug for this role's own page, e.g. "cleaning-supervisor" — /company/careers/:slug. */
  slug: string;
  title: string;
  icon: IconName;
  /** e.g. "Cleaning Operations", "Sales & Business Dev." */
  department?: string;
  /** e.g. "Operations Manager", "Senior Sales Manager" */
  reportsTo?: string;
  location: string;
  /** Job type/hours, e.g. "Full-Time, Permanent". */
  hours: string;
  /** Deliberately not shown on the public Careers page — pay is set per candidate based on
   * experience, so a fixed range on the listing either undersells a strong candidate or
   * sets an expectation the offer then has to walk back. Kept optional (rather than
   * removed outright) so old published content carrying it doesn't break; the admin editor
   * and public page both just ignore it now. */
  payRange?: string;
  startAvailability: string;
  /** Short one/two-line teaser shown on the listing card. */
  summary?: string;
  /** Optional meta description (140–160 chars) for search results and link previews.
   * `summary` is the listing-card teaser and runs well past what a preview can show, so it
   * is only the fallback — see the same field on ServiceContent. */
  seoDescription?: string;
  /** Longer "Role Overview" paragraph shown on the role's own page. */
  roleOverview?: string;
  /** One bullet per line — split on "\n" and rendered as a list on the role page. */
  responsibilities?: string;
  /** One bullet per line — split on "\n" and rendered as a list on the role page. */
  requirements?: string;
  /** e.g. shift pattern / hybrid split — optional paragraph. */
  workingPattern?: string;
  /** One bullet per line — split on "\n" and rendered as a list on the role page. */
  whatWeOffer?: string;
  /** Legacy field from before the role got its own page — still rendered as a fallback
   * paragraph when the richer fields above aren't present, so old published rows don't
   * regress to an empty page. */
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
