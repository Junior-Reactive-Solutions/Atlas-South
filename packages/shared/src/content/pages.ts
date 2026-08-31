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
  tagline: 'Facilities Support Built on Precision, Trust & Accountability',
  intro:
    'Atlas South Technical Services is a London-based provider of cleaning and facilities management for commercial, corporate and government environments — from offices and aviation facilities to healthcare, manufacturing, education and public sector sites. We exist to give organisations one dependable partner for the standard of upkeep their operations, their compliance obligations and their reputation demand.',
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
      icon: 'badge-check',
      title: 'Compliance-first, not compliance-eventually',
      body: 'Documentation, health & safety records and audit-ready reporting are built into every contract from day one — the standard both commercial clients and public sector procurement expect as a baseline.',
    },
    {
      icon: 'briefcase',
      title: 'One provider, full facilities scope',
      body: 'Cleaning, technical maintenance and facilities management run under a single contract and point of contact, across every sector we serve — fewer contractors on-site, less coordination overhead for you.',
    },
    {
      icon: 'users',
      title: 'Vetted, trained, sector-briefed teams',
      body: 'Personnel are prepared for the specific access, conduct and safety expectations of the environment they're working in, from corporate offices to regulated and public sector sites.',
    },
    {
      icon: 'settings',
      title: 'Built around your operations, not ours',
      body: 'Servicing is scheduled around your operational windows, shift patterns and downtime — not the other way around — so facilities work never becomes the disruption.',
    },
    {
      icon: 'trending-up',
      title: 'Continuity you can build a contract on',
      body: 'Consistent teams, clear reporting and a single schedule reduce risk across long-term commercial and multi-year public sector contracts.',
    },
    {
      icon: 'map-pin',
      title: 'London-based, London-focused',
      body: 'Based in London and focused on London & South East delivery, with the local presence to respond quickly and the accountability of a provider that's actually nearby.',
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
  // Client-supplied job descriptions (2026-08-31 WhatsApp drop, three PDFs — one per role).
  // Replaces the two previous listings ("Experienced Plumber", "Facilities Manager"), which
  // were invented during seeding and never sourced from the client — see
  // docs on placeholder-content risk. slug drives each role's own page at
  // /company/careers/:slug (Careers.tsx links out to it instead of expanding inline).
  openRoles: [
    {
      slug: 'cleaning-supervisor',
      title: 'Cleaning Supervisor',
      icon: 'spray-can',
      department: 'Cleaning Operations',
      reportsTo: 'Operations Manager',
      location: 'London (On-Site)',
      hours: 'Full-Time, Permanent',
      startAvailability: 'Immediate',
      summary:
        "Lead our on-site cleaning teams across corporate and commercial client sites — a hands-on role for an experienced cleaning professional who can lead a team and be the day-to-day point of contact clients trust.",
      roleOverview:
        "As Cleaning Supervisor, you'll lead a team of cleaning operatives across one or more client sites, ensuring work is delivered to Atlas South's standard, on schedule, and in line with health & safety requirements. You'll be the first point of contact for site-level issues and a key link between the cleaning team and our operations function.",
      responsibilities:
        "Lead and supervise on-site cleaning teams across assigned client sites, ensuring work is completed to Atlas South's standard and schedule.\nPlan and allocate daily cleaning tasks, rotas and coverage across the team, including holiday and sickness cover.\nCarry out regular site inspections and quality checks, addressing any issues before they become client concerns.\nEnsure all cleaning is carried out in line with health & safety, COSHH and site-specific compliance requirements.\nTrain new starters and provide ongoing coaching to cleaning operatives on correct procedures, products and equipment use.\nManage stock levels of cleaning materials and equipment, and raise orders as needed.\nAct as the on-site point of contact for client facilities managers, resolving day-to-day issues quickly and professionally.\nMaintain accurate records of inspections, incidents, and team attendance, and report into the operations team.",
      requirements:
        "Previous experience as a cleaning supervisor, team leader, or senior cleaning operative, ideally in a commercial or corporate setting.\nStrong working knowledge of cleaning methods, products, equipment and health & safety / COSHH requirements.\nConfident leading and motivating a team, including managing rotas and performance.\nClear communicator, comfortable liaising directly with clients and site managers.\nWell organised, with the ability to manage multiple tasks and priorities across a site or sites.\nFlexible and reliable, with willingness to cover early mornings, evenings or out-of-hours shifts as required by site schedules.\nBased in or around London, with the ability to travel between sites as needed.",
      workingPattern:
        "This is a site-based role, working across Atlas South's client sites in London. Shift patterns may include early mornings, evenings or out-of-hours cover depending on the sites you're assigned to.",
      whatWeOffer:
        "Competitive salary, reflective of experience.\nStable, full-time hours with clear shift patterns.\nOngoing training and development, including health & safety and COSHH certifications.\nA clear path to progress into wider operations or contract management roles.\nThe chance to work across a growing range of sectors and client sites.",
    },
    {
      slug: 'junior-sales-executive',
      title: 'Junior Sales Executive — Corporate Facilities Solutions',
      icon: 'trending-up',
      department: 'Sales & Business Dev.',
      reportsTo: 'Senior Sales Manager',
      location: 'London (Hybrid)',
      hours: 'Full-Time, Permanent',
      startAvailability: 'Immediate',
      summary:
        "Join our growing sales team — a hybrid role for someone early in their sales career who's eager to learn, build a pipeline, and support the Senior Sales Manager in winning new corporate facilities management contracts.",
      roleOverview:
        "As Junior Sales Executive, you'll work closely with the Senior Sales Manager to identify leads, build the pipeline, and support proposal preparation across Atlas South's full facilities management range. This is a hands-on, learning-focused role for someone who wants to build a career in B2B sales.",
      responsibilities:
        "Support the Senior Sales Manager in identifying and qualifying new business opportunities across corporate and commercial clients.\nResearch prospective clients and sectors to build a pipeline of qualified leads.\nAssist in preparing and formatting proposals covering Atlas South's facilities management services.\nMake outbound calls and emails to introduce Atlas South's services and set up client meetings.\nMaintain accurate records of leads, contacts and pipeline activity in the CRM.\nAttend client meetings and site visits alongside senior sales staff to learn the full proposal-to-close process.\nFollow up on proposals and enquiries to keep opportunities moving through the pipeline.\nBuild a working knowledge of Atlas South's full service range across all sectors served.",
      requirements:
        "Some experience in a sales, business development, or customer-facing role (B2B experience is a plus but not essential).\nStrong communication skills, both written and verbal, with confidence on the phone and in person.\nOrganised, with good attention to detail when managing leads and proposal documents.\nA genuine interest in building a career in B2B sales, ideally within facilities management or commercial services.\nSelf-motivated and eager to learn, with the ability to work both independently and as part of a small team.\nComfortable using CRM tools, spreadsheets and standard office software.\nBased in or around London, with flexibility to attend the office and occasional client site visits.",
      workingPattern:
        'This role is based in London with a hybrid working pattern — combining remote work, time in the office, and on-site client meetings and proposal presentations as required. Flexibility to travel to client sites across London and the South East is expected.',
      whatWeOffer:
        'Competitive base salary with performance-related bonus potential.\nHybrid working — a mix of remote work, office time, and client-facing site visits.\nDirect mentorship from the Senior Sales Manager, with a clear path to growing into a more senior sales role.\nExposure to a wide range of sectors and client types from day one.\nThe chance to grow with an expanding, multi-sector business.',
    },
    {
      slug: 'senior-sales-manager',
      title: 'Senior Sales Manager — Corporate Facilities Solutions',
      icon: 'briefcase',
      department: 'Sales & Business Dev.',
      reportsTo: 'Director / HR Manager',
      location: 'London (Hybrid)',
      hours: 'Full-Time, Permanent',
      startAvailability: 'Immediate',
      summary:
        'Lead new business development across our corporate and commercial client base — a hybrid role for an experienced B2B sales professional who can confidently present our full facilities management offering and turn it into won business.',
      roleOverview:
        "As Senior Sales Manager, you will be responsible for winning new corporate facilities management contracts by identifying opportunities, building relationships with key decision-makers, and delivering compelling, tailored proposals across Atlas South's full service range. You'll work closely with leadership and operations to convert prospects into long-term client relationships.",
      responsibilities:
        "Identify, pursue and win new corporate and commercial facilities management contracts across London and the South East.\nBuild and present tailored proposals covering Atlas South's full facilities management range — cleaning, technical maintenance, compliance-driven servicing and sector-specific solutions.\nOwn the full sales cycle from initial approach through to proposal, negotiation and contract close.\nDevelop a strong pipeline across target sectors, including corporate offices, aviation, healthcare, manufacturing, education, venues, data centres, rail, and government & public sector bodies.\nBuild lasting relationships with facilities managers, procurement leads and senior decision-makers at prospective client organisations.\nWork closely with operations to ensure proposals reflect realistic, deliverable scopes and pricing.\nRepresent Atlas South at industry events, site visits and client meetings.\nTrack pipeline, forecast accurately, and report on sales performance against targets.",
      requirements:
        'Proven track record in B2B sales, ideally within facilities management, cleaning services, or a related commercial services sector.\nExperience selling into corporate, commercial or public sector clients, with confidence engaging senior stakeholders and procurement teams.\nStrong proposal writing and presentation skills — able to translate a service range into a compelling, client-specific pitch.\nComfortable managing a full sales cycle independently, from prospecting to close.\nExcellent communication and relationship-building skills.\nSelf-motivated, target-driven, and comfortable working autonomously in a hybrid role.\nBased in or around London, with flexibility to travel to client sites and the office as needed.',
      workingPattern:
        'This role is based in London with a hybrid working pattern — combining remote work, time in the office, and on-site client meetings and proposal presentations as required. Flexibility to travel to client sites across London and the South East is expected.',
      whatWeOffer:
        'Competitive base salary plus performance-based commission.\nHybrid working — a mix of remote work, office time, and client-facing site visits.\nThe opportunity to shape and grow a senior sales function across a widening range of sectors.\nDirect access to leadership and a genuine say in how proposals and client strategy are shaped.\nA growing, multi-sector business with an expanding service range to sell into.',
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
