import { ServiceDetailPage } from '../../components/services/ServiceDetailPage.js';

export function SecurityServices() {
  return (
    <ServiceDetailPage
      id="security"
      title="Security Services"
      icon="shield-check"
      heroDescription="Professional security staffing, CCTV systems, and access control tailored to your building's risk profile"
      overview={
        <>
          <p>
            Security isn't one-size-fits-all. A retail centre needs different coverage than an office park; a data centre requires different protocols
            than a healthcare facility. Atlas South designs security solutions matching your actual risk profile, operations, and budget.
          </p>
          <p>
            We provide everything: uniformed security officers, CCTV system design and monitoring, access control wiring and maintenance, incident
            response protocols, and liaison with police and insurers.
          </p>
        </>
      }
      features={[
        {
          icon: 'shield-check',
          title: 'Security Staffing',
          description: 'Licensed security officers for on-site patrols, gate duty, or response. SIA-accredited with vetting and insurance.',
        },
        {
          icon: 'eye',
          title: 'CCTV Systems',
          description: 'Design, installation, maintenance of modern IP-based CCTV with cloud storage and mobile access.',
        },
        {
          icon: 'lock',
          title: 'Access Control',
          description: 'Electronic door locks, card readers, biometric access, and audit-trail logging for sensitive areas.',
        },
        {
          icon: 'radio',
          title: 'Incident Response',
          description: 'Protocols for break-ins, suspicious activity, and emergency lockdown procedures tailored to your site.',
        },
        {
          icon: 'clipboard-check',
          title: 'Audit & Compliance',
          description: 'Security audit per your building classification; support for insurer and police liaison.',
        },
        {
          icon: 'zap',
          title: 'Integration',
          description: 'Tie security systems into your building management—alarms, access, CCTV feeds in one dashboard.',
        },
      ]}
      faqs={[
        {
          question: 'Do we need uniformed security or just CCTV?',
          answer:
            'Risk assessment determines the right mix. We audit your building and recommend staffing levels balancing cost with your actual exposure.',
        },
        {
          question: 'How is security staffing priced?',
          answer: 'Typically hourly rates for officers plus administrative overhead. Longer deployments (5+ days/week) get volume discounts.',
        },
        {
          question: 'What happens if an incident occurs?',
          answer:
            'Our officers follow incident protocols: document everything, preserve evidence, call police if required, and notify your emergency contact immediately.',
        },
        {
          question: 'Can you access CCTV footage remotely?',
          answer:
            'Yes. Modern IP systems support cloud storage and mobile apps. You or your security team can review footage 24/7 from anywhere.',
        },
        {
          question: 'Does security tie into fire/emergency systems?',
          answer:
            'Yes. We integrate access control with fire alarms and emergency procedures so lockdown happens automatically during incidents.',
        },
      ]}
      relatedServices={[
        { label: 'Facilities Management', path: '/soft-services/facilities-management' },
        { label: 'Commercial Cleaning', path: '/soft-services/commercial-cleaning' },
      ]}
    />
  );
}
