/**
 * Single source of truth for NAP (Name/Address/Phone) and legal facts.
 * Verified against the live site — see docs/build/13-COMPANY-FACTS-VERIFIED.md.
 *
 * Never hand-type the phone number, email, or address anywhere else in the codebase —
 * import from here. This directly fixes the audit finding that the previous site
 * carried two different phone numbers in five formats across its pages.
 */

export const COMPANY = {
  name: 'Atlas South Technical Services',
  foundedYear: 2018,
  domain: 'atlassouthes.com',

  phone: {
    display: '07778 858278',
    tel: '+447778858278',
  },
  whatsapp: {
    url: 'https://wa.me/447778858278',
  },
  email: 'start@atlassouthes.com',

  address: {
    line1: '4th Floor, Silverstream House',
    line2: '45 Fitzroy Street, Fitzrovia',
    city: 'London',
    postalCode: 'W1T 6EB',
    country: 'GB',
  },

  stats: {
    clients: '700+',
    jobsCompleted: '12,000+',
    coverage: '24/7',
  },

  certifications: ['Gas Safe Registered', 'Part P Certified', 'SIA Licensed'] as const,
  publicLiabilityInsurance: '£5 million',

  /**
   * Deliberately empty pending client confirmation — see
   * docs/build/13-COMPANY-FACTS-VERIFIED.md. Do not fabricate a value here.
   */
  companyRegistrationNumber: null as string | null,
  vatNumber: null as string | null,
  icoRegistrationNumber: null as string | null,

  /** No social profiles confirmed yet — populate once the client supplies real URLs. */
  socialProfiles: [] as string[],
} as const;
