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
