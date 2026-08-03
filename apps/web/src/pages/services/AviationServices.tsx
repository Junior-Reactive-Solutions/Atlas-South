import { ServiceDetailPage } from '../../components/services/ServiceDetailPage.js';

export function AviationServices() {
  return (
    <ServiceDetailPage
      id="aviation"
      path="/soft-services/aviation"
      title="Aviation Services"
      icon="plane"
      heroDescription="Comprehensive airport and aviation facility services including ground handling, terminal operations, and maintenance support"
      overview={
        <>
          <p>
            Aviation facilities operate 24/7 under strict safety and regulatory requirements. From terminal cleaning and passenger facilities to aircraft
            ground handling and cargo operations, every service directly impacts safety, efficiency, and passenger experience. Atlas South brings
            specialist expertise in aviation operations, compliance, and rapid-response management.
          </p>
          <p>
            We manage ground services, terminal facilities, security protocols, and coordination with air operators—all under strict CAA, Health &
            Safety, and aviation industry standards.
          </p>
        </>
      }
      features={[
        {
          icon: 'plane-takeoff',
          title: 'Ground Handling',
          description: 'Aircraft servicing, passenger boarding, baggage handling, and flight deck coordination during turnaround.',
        },
        {
          icon: 'building-2',
          title: 'Terminal Operations',
          description: 'Passenger lounge management, gate operations, baggage claim supervision, and passenger amenities maintenance.',
        },
        {
          icon: 'sparkles',
          title: 'Facilities Cleaning',
          description: 'High-frequency terminal cleaning, aircraft interior sanitization, and cargo area decontamination.',
        },
        {
          icon: 'shield-check',
          title: 'Security & Compliance',
          description: 'Security staffing, access control, and compliance with CAA, DfT, and aviation-specific regulations.',
        },
        {
          icon: 'wrench',
          title: 'Maintenance Support',
          description: 'Line maintenance support, equipment upkeep, and coordination with aircraft maintenance providers.',
        },
        {
          icon: 'radio',
          title: '24/7 Response',
          description: 'Round-the-clock operational support, emergency response, and coordination with flight crew and air operators.',
        },
      ]}
      faqs={[
        {
          question: 'Are your teams aviation-trained and certified?',
          answer:
            'Yes. All our aviation staff are trained in CAA procedures, security protocols, and safety requirements. We hold all necessary aviation certifications.',
        },
        {
          question: 'Do you handle international flight operations?',
          answer:
            'Yes. We coordinate with international carriers, manage customs and immigration-adjacent support, and comply with international aviation standards.',
        },
        {
          question: 'Can you scale for peak travel periods?',
          answer:
            'Yes. We manage seasonal demand swings, holiday peaks, and emergency surge situations with trained associate network.',
        },
        {
          question: 'What happens during operational emergencies?',
          answer:
            'We follow CAA emergency protocols, coordinate with emergency services, and ensure immediate escalation to airport operations and air crews.',
        },
        {
          question: 'How do you handle security-sensitive operations?',
          answer:
            'All staff undergo background vetting, security clearance where required, and comply with airport security protocols and information handling procedures.',
        },
      ]}
      relatedServices={[
        { label: 'Security Services', path: '/soft-services/security' },
        { label: 'Commercial Cleaning', path: '/soft-services/commercial-cleaning' },
      ]}
    />
  );
}
