/**
 * The four hand-authored page content records (home, company, careers, packages).
 *
 * Moved here from apps/api/scripts/seed-content.ts so there is exactly ONE copy in the
 * repo, shared by the seed script and by apps/web's offline-safe render path — see the
 * fuller note in ./index.ts.
 */

/**
 * Hero copy. Strictly commercial/industrial: an earlier revision of this file carried a
 * dual-audience headline ("for your home or your business") plus a "For Your Home" CTA,
 * taken from docs/build/03-HERO-SECTION-SPEC.md §2's dual-audience framing. The client has
 * since confirmed the opposite — the site is for commercial and industrial work only, with
 * no residential mention anywhere — so that framing is removed here rather than left to be
 * contradicted by the rest of the page. The two secondary links now point at two
 * commercial destinations (the on-page services panel and industries grid) instead of
 * splitting by audience.
 */
export const HOME_CONTENT = {
  headlineLines: ['Trades & facilities services', 'you can trust —', 'for commercial & industrial sites.'],
  subcopy:
    'Atlas South has delivered {jobsCompleted} jobs across London and the South East since {foundedYear}, from emergency call-outs to fully managed facilities contracts.',
  primaryCtaLabel: 'Get a Free Quote',
  servicesCtaLabel: 'Our Services',
  industriesCtaLabel: 'Our Industries',
  // Client-supplied copy (2026-08-20 WhatsApp content drop, "Atlas South-About-Us.pdf"),
  // replacing an invented placeholder statement that was never sourced from the client.
  missionStatement:
    "To deliver cleaning and facilities management that works around our clients' operations, meets every compliance standard their sector demands, and is backed by one accountable point of contact from first enquiry to ongoing delivery.",
};

export const COMPANY_CONTENT = {
  tagline: 'Trusted London facilities partner since 2018',
  timeline: [
    {
      year: 2018,
      title: 'Atlas South Founded',
      body: 'Started with a vision to provide reliable, professional facilities services across London.',
      icon: 'rocket',
    },
    {
      year: 2019,
      title: 'Expanded Team',
      body: 'Grew from 5 to 15 team members, adding specialized trades services.',
      icon: 'users',
    },
    {
      year: 2021,
      title: 'Major Contracts',
      body: 'Secured first major commercial facilities management contracts.',
      icon: 'briefcase',
    },
    {
      year: 2024,
      title: 'Continued Growth',
      // Previously "over 100 clients with 40+ team members" — both figures were invented
      // during seeding and the client count directly contradicted the verified 700+ used
      // site-wide (docs/build/13-COMPANY-FACTS-VERIFIED.md). Rewritten to the verified
      // figure; headcount dropped rather than guessed.
      body: 'Now serving 700+ clients across every service line, from single call-outs to fully managed contracts.',
      icon: 'trending-up',
    },
  ],
  // Client-supplied copy (2026-08-20 WhatsApp content drop, "Atlas South-About-Us.pdf"),
  // replacing an invented placeholder statement that was never sourced from the client.
  missionStatement:
    "To deliver cleaning and facilities management that works around our clients' operations, meets every compliance standard their sector demands, and is backed by one accountable point of contact from first enquiry to ongoing delivery.",
  // "Vision" used to be entirely absent from this file — navigation.ts carried a long
  // comment explaining it had been removed because no vision statement existed anywhere
  // in verified content, and inventing one wasn't ours to do (see git history on that
  // file). This is that gap closed with the client's own words, from the same document.
  visionStatement:
    'To be the most trusted facilities partner for organisations that cannot afford to get cleaning and site upkeep wrong — where standards, compliance and reputation are always on the line.',
  values: [
    {
      icon: 'shield',
      title: 'Reliability',
      body: "You can count on us to show up, on time, every time. Our 24/7 emergency line means you're never without support.",
    },
    {
      icon: 'target',
      title: 'Excellence',
      body: "We don't just fix problems—we deliver solutions. Every job is an opportunity to exceed expectations.",
    },
    {
      icon: 'heart',
      title: 'Care',
      body: 'We treat every site as if it were our own. Your satisfaction is our measure of success.',
    },
  ],
  team: [
    {
      role: 'Founder & Director',
      since: 2018,
      bio: 'With 15+ years in the facilities sector, our founder built Atlas South on principles of reliability and excellence.',
    },
    {
      role: 'Operations Manager',
      since: 2019,
      bio: 'Oversees scheduling and team coordination across all services and locations.',
    },
    {
      role: 'Lead Plumber',
      since: 2018,
      bio: 'Master tradesperson with specialized certifications in commercial and industrial plumbing.',
    },
  ],
  // `logo` is the certifying body's own badge image (client-supplied 2026-08-17,
  // apps/web/public/certifications/) — replaces the generic `award` glyph every entry
  // used to share, which couldn't distinguish one accreditation from another at a
  // glance. `icon` stays as the fallback CertificationsBar renders if `logo` is ever
  // removed or a future certification is added without an image ready.
  certifications: [
    { icon: 'award', title: 'Gas Safe Registered', body: 'All gas work certified and insured', logo: '/certifications/gas-safe.jpg' },
    { icon: 'award', title: 'NICEIC Approved', body: 'Electrical work by certified professionals', logo: '/certifications/niceic.jpg' },
    { icon: 'award', title: 'ISO 9001', body: 'Quality management certified', logo: '/certifications/iso-9001.jpg' },
  ],
  /**
   * Left empty deliberately. This array previously held 6+ years / 100+ clients /
   * 2000+ jobs / 40+ team members — none of which had a source, and two of which
   * contradicted the verified site-wide figures (700+ clients, 12,000+ jobs) from
   * docs/build/13-COMPANY-FACTS-VERIFIED.md.
   *
   * The About page no longer reads this field at all; it renders the shared <StatBand>,
   * which derives from COMPANY.stats. Kept as an empty array rather than deleted so the
   * CompanyContent shape is unchanged for any existing database row.
   */
  stats: [] as Array<{ value: string; label: string }>,
};

export const CAREERS_CONTENT = {
  intro:
    "We're building a team of talented, dedicated professionals who share our commitment to excellence. Join us and grow your career in London's thriving facilities sector.",
  benefits: [
    {
      icon: 'users',
      title: 'Collaborative Culture',
      description: 'Work with experienced professionals who support your development and growth.',
    },
    {
      icon: 'dollar-sign',
      title: 'Competitive Pay',
      description: 'Industry-leading salaries plus benefits package including pension and health cover.',
    },
    {
      icon: 'calendar',
      title: 'Flexible Hours',
      description: 'We value work-life balance. Choose from full-time, part-time, and flexible scheduling options.',
    },
    {
      icon: 'award',
      title: 'Training & Development',
      description: 'We invest in your skills with ongoing training and professional certification support.',
    },
    {
      icon: 'zap',
      title: 'Career Growth',
      description: 'Clear progression paths from team member to management and leadership roles.',
    },
    {
      icon: 'shield',
      title: 'Safe Working',
      description: 'Top-tier health and safety standards across all roles and locations.',
    },
  ],
  openRoles: [
    {
      title: 'Experienced Plumber',
      icon: 'wrench',
      location: 'London-based, travel to sites',
      hours: 'Full-time, 40 hours/week',
      startAvailability: 'Immediate',
      description:
        "We're looking for an experienced plumber with commercial and industrial facilities experience to join our growing team.",
    },
    {
      title: 'Facilities Manager',
      icon: 'briefcase',
      location: 'Central London office',
      hours: 'Full-time, 37.5 hours/week',
      startAvailability: 'Next month',
      description:
        'Manage client relationships, coordinate service scheduling, and oversee our operations. Great opportunity for someone looking to move into management.',
    },
  ],
  rightToWorkNote:
    'Atlas South is committed to equal opportunities. All candidates must have the right to work in the UK. We follow all UK employment law and regulations.',
};

// PACKAGES_CONTENT (the /packages pricing page's tiers, prices and inclusions) removed
// 2026-08-24 at the client's explicit request: no pricing of any kind is to be displayed
// anywhere on the site. See git history on this file for the removed £75/£180/£450 tier
// structure, and packages/shared/src/constants/navigation.ts for the corresponding nav
// removal.
