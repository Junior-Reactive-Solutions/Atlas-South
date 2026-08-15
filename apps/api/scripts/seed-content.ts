/**
 * One-time seed: loads extracted-content.json (produced by apps/web/scripts/
 * extract-content.tsx from the site's existing hardcoded pages) plus the Home page's
 * hero copy, and upserts each as a ContentPage row — both draftData and publishedData
 * set to the current live content, so switching the public pages over to reading from
 * this table causes zero regression.
 *
 * Safe to re-run: uses upsert, so it won't duplicate rows. Re-running WILL overwrite
 * publishedData with the current extracted snapshot, so don't run this again after an
 * admin has made real edits through the panel.
 */
import { PrismaClient, type Prisma } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

interface ExtractedPage {
  slug: string;
  type: 'service' | 'industry' | 'area';
  path: string;
  data: Record<string, unknown>;
}

const HOME_CONTENT = {
  headlineLines: ['Commercial facilities services', 'you can trust —', 'for every building, every sector.'],
  subcopy:
    'Atlas South has delivered {jobsCompleted} jobs across London and the South East since {foundedYear}, from emergency call-outs to fully managed facilities contracts.',
  primaryCtaLabel: 'Get a Free Quote',
  businessCtaLabel: 'View Our Services',
};

const COMPANY_CONTENT = {
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
  missionStatement:
    'To be London\'s most trusted facilities partner, delivering exceptional service with integrity, reliability, and professionalism.',
  values: [
    {
      icon: 'shield',
      title: 'Reliability',
      body: 'You can count on us to show up, on time, every time. Our 24/7 emergency line means you\'re never without support.',
    },
    {
      icon: 'target',
      title: 'Excellence',
      body: 'We don\'t just fix problems—we deliver solutions. Every job is an opportunity to exceed expectations.',
    },
    {
      icon: 'heart',
      title: 'Care',
      body: 'We treat your property like our own. Your satisfaction is our measure of success.',
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
  certifications: [
    { icon: 'award', title: 'Gas Safe Registered', body: 'All gas work certified and insured' },
    { icon: 'award', title: 'NICEIC Approved', body: 'Electrical work by certified professionals' },
    { icon: 'award', title: 'ISO 9001', body: 'Quality management certified' },
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

const CAREERS_CONTENT = {
  intro: 'We\'re building a team of talented, dedicated professionals who share our commitment to excellence. Join us and grow your career in London\'s thriving facilities sector.',
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
      payRange: '£45,000—£55,000',
      startAvailability: 'Immediate',
      description: 'We\'re looking for an experienced plumber with commercial and industrial facilities experience to join our growing team.',
    },
    {
      title: 'Facilities Manager',
      icon: 'briefcase',
      location: 'Central London office',
      hours: 'Full-time, 37.5 hours/week',
      payRange: '£35,000—£45,000',
      startAvailability: 'Next month',
      description:
        'Manage client relationships, coordinate service scheduling, and oversee our operations. Great opportunity for someone looking to move into management.',
    },
  ],
  rightToWorkNote:
    'Atlas South is committed to equal opportunities. All candidates must have the right to work in the UK. We follow all UK employment law and regulations.',
};

/**
 * Restored verbatim from the pre-rebuild live site — see
 * docs/audit/screenshots/atlas-sec-packages.png, captured 2026-07-29 and cited in the
 * audit as "Monthly packages — genuinely strong. Transparent tiers, clear feature
 * comparison, explicit inclusions/exclusions. Protect this in the redesign."
 * (docs/audit/report.html §5.4). That protection didn't happen the first time: an
 * earlier seed replaced this with four invented tiers (Essential/Professional/
 * Premium/Enterprise at £500/£1,200/£2,500/custom) that bear no relation to the real
 * £75/£180/£450 structure. This is the correction, not a new design — every price,
 * tier name, inclusion and exclusion below is transcribed from that screenshot, not
 * invented. `excludes` reproduces the original's greyed-out ✗ rows; `popular` reproduces
 * its "MOST POPULAR" badge on Professional.
 */
const PACKAGES_CONTENT = {
  eyebrow: 'Monthly Plans',
  title: 'Subscribe & never pay emergency rates',
  heroDescription:
    'Our monthly packages give you priority cover, regular maintenance visits and capped emergency callout costs — saving you hundreds every year.',
  intro: 'Whether you own a single property or manage multiple buildings, we have flexible packages designed to fit your needs and budget.',
  cancellationNote: 'Cancel anytime · 30 days notice',
  tiers: [
    {
      label: 'Starter',
      startingFrom: '£75',
      description: 'Perfect for single-property homeowners wanting essential cover and peace of mind.',
      icon: 'box',
      includes: [
        '1 property covered',
        'Priority booking (next day)',
        'Emergency callout capped at £50',
        '1 annual maintenance visit',
        'Plumbing & electrical cover',
        'Monthly email report',
      ],
      excludes: ['Security services', 'Commercial cleaning'],
    },
    {
      label: 'Professional',
      startingFrom: '£180',
      description: 'Ideal for landlords with 2-5 properties or small businesses needing full trade cover.',
      icon: 'briefcase',
      popular: true,
      includes: [
        'Up to 5 properties',
        'Priority booking (same day)',
        'Emergency callout FREE',
        'Quarterly maintenance visits',
        'All trades covered',
        'Monthly inspection report',
        'Domestic & commercial cleaning',
      ],
      excludes: ['Security services'],
    },
    {
      label: 'Enterprise',
      startingFrom: '£450',
      description: 'Full-service contract for property portfolios and commercial clients needing everything covered.',
      icon: 'crown',
      includes: [
        'Unlimited properties',
        '24/7 priority emergency cover',
        'Emergency callout FREE always',
        'Monthly maintenance visits',
        'All trades + security included',
        'Compliance management',
        'Commercial cleaning included',
        'Dedicated account manager',
      ],
      excludes: [],
    },
  ],
};

async function main() {
  const extractedPages: ExtractedPage[] = JSON.parse(
    readFileSync(resolve(__dirname, 'extracted-content.json'), 'utf-8'),
  );

  let count = 0;

  for (const page of extractedPages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        type: page.type,
        path: page.path,
        status: 'published',
        draftData: page.data as Prisma.InputJsonValue,
        publishedData: page.data as Prisma.InputJsonValue,
        publishedAt: new Date(),
      },
      update: {
        // Re-running the seed refreshes both draft and published to the extracted
        // snapshot — intentional for pre-launch use, see file header.
        draftData: page.data as Prisma.InputJsonValue,
        publishedData: page.data as Prisma.InputJsonValue,
        publishedAt: new Date(),
        status: 'published',
      },
    });
    count++;
  }

  await prisma.contentPage.upsert({
    where: { slug: 'home' },
    create: {
      slug: 'home',
      type: 'home',
      path: '/',
      status: 'published',
      draftData: HOME_CONTENT,
      publishedData: HOME_CONTENT,
      publishedAt: new Date(),
    },
    update: {
      draftData: HOME_CONTENT,
      publishedData: HOME_CONTENT,
      publishedAt: new Date(),
      status: 'published',
    },
  });
  count++;

  await prisma.contentPage.upsert({
    where: { slug: 'company' },
    create: {
      slug: 'company',
      type: 'company',
      path: '/company',
      status: 'published',
      draftData: COMPANY_CONTENT,
      publishedData: COMPANY_CONTENT,
      publishedAt: new Date(),
    },
    update: {
      draftData: COMPANY_CONTENT,
      publishedData: COMPANY_CONTENT,
      publishedAt: new Date(),
      status: 'published',
    },
  });
  count++;

  await prisma.contentPage.upsert({
    where: { slug: 'careers' },
    create: {
      slug: 'careers',
      type: 'careers',
      path: '/company/join-us',
      status: 'published',
      draftData: CAREERS_CONTENT,
      publishedData: CAREERS_CONTENT,
      publishedAt: new Date(),
    },
    update: {
      draftData: CAREERS_CONTENT,
      publishedData: CAREERS_CONTENT,
      publishedAt: new Date(),
      status: 'published',
    },
  });
  count++;

  await prisma.contentPage.upsert({
    where: { slug: 'packages' },
    create: {
      slug: 'packages',
      type: 'packages',
      path: '/packages',
      status: 'published',
      draftData: PACKAGES_CONTENT,
      publishedData: PACKAGES_CONTENT,
      publishedAt: new Date(),
    },
    update: {
      draftData: PACKAGES_CONTENT,
      publishedData: PACKAGES_CONTENT,
      publishedAt: new Date(),
      status: 'published',
    },
  });
  count++;

  console.log(`Seeded ${count} content pages (${extractedPages.length} from extraction + 4 new company pages).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
