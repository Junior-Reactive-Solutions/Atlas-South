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
  headlineLines: ['Trades and facilities services', 'you can trust —', 'for your home or your business.'],
  subcopy:
    'Atlas South has delivered {jobsCompleted} jobs across London and the South East since {foundedYear}, from emergency call-outs to fully managed facilities contracts.',
  primaryCtaLabel: 'Get a Free Quote',
  homeCtaLabel: 'For Your Home',
  businessCtaLabel: 'For Your Business',
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
      body: 'Now serving over 100 clients with 40+ team members across all services.',
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
      bio: 'Master tradesperson with specialized certifications in domestic and commercial plumbing.',
    },
  ],
  certifications: [
    { icon: 'award', title: 'Gas Safe Registered', body: 'All gas work certified and insured' },
    { icon: 'award', title: 'NICEIC Approved', body: 'Electrical work by certified professionals' },
    { icon: 'award', title: 'ISO 9001', body: 'Quality management certified' },
  ],
  stats: [
    { value: '6+', label: 'Years of experience' },
    { value: '100+', label: 'Satisfied clients' },
    { value: '2000+', label: 'Jobs completed' },
    { value: '40+', label: 'Team members' },
  ],
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
      description: 'We\'re looking for an experienced plumber with domestic and commercial experience to join our growing team.',
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

const PACKAGES_CONTENT = {
  title: 'Our Packages',
  heroDescription: 'Choose the right facilities solution for your needs. From one-off jobs to ongoing management.',
  intro: 'Whether you own a single property or manage multiple buildings, we have flexible packages designed to fit your needs and budget.',
  tiers: [
    {
      label: 'Essential',
      startingFrom: 'From £500/month',
      description: 'Monthly maintenance checks and emergency support. Perfect for small properties or occasional needs.',
      icon: 'box',
    },
    {
      label: 'Professional',
      startingFrom: 'From £1,200/month',
      description: 'Proactive maintenance, 24/7 emergency line, and dedicated support. Our most popular option.',
      icon: 'briefcase',
    },
    {
      label: 'Premium',
      startingFrom: 'From £2,500/month',
      description: 'Full facilities management with scheduled inspections, predictive maintenance, and priority response.',
      icon: 'crown',
    },
    {
      label: 'Enterprise',
      startingFrom: 'Custom quote',
      description: 'Tailored solutions for complex properties or multi-site management. Dedicated account manager included.',
      icon: 'building',
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
