import { ServiceDetailPage } from '../../components/services/ServiceDetailPage.js';

export function Concierge() {
  return (
    <ServiceDetailPage
      id="concierge"
      title="Concierge Services"
      icon="user-check"
      heroDescription="Professional visitor management, reception, and hospitality services enhancing your building's first impression and operational flow"
      overview={
        <>
          <p>
            Your building's first line of contact shapes every visitor's experience. Professional concierge and reception services require training,
            judgment, and attention to detail. Atlas South manages reception desks, visitor screening, package handling, and white-glove hospitality
            services that reflect positively on your organization.
          </p>
          <p>
            We handle everything from day-to-day visitor check-in to VIP reception, package coordination, and liaison with tenants—allowing your team
            to focus on core business.
          </p>
        </>
      }
      features={[
        {
          icon: 'user-check',
          title: 'Reception & Visitor Management',
          description: 'Professional reception staff managing visitor sign-in, badge issuance, access control, and direction.',
        },
        {
          icon: 'package',
          title: 'Package & Parcel Handling',
          description: 'Receiving, logging, storage, and delivery of parcels and mail to tenants with secure handling protocols.',
        },
        {
          icon: 'phone',
          title: 'Multi-Line Switchboard',
          description: 'Professional telephone answering, message taking, and call routing to tenants and departments.',
        },
        {
          icon: 'briefcase',
          title: 'VIP & Executive Hospitality',
          description: 'Premium greeting services, beverage service, and white-glove hospitality for VIP visits and client entertainment.',
        },
        {
          icon: 'clipboard-check',
          title: 'Building Coordination',
          description: 'Vendor management, delivery coordination, access scheduling, and event liaison.',
        },
        {
          icon: 'smile',
          title: 'Professional Appearance',
          description: 'Uniformed staff trained in corporate etiquette, multi-language support, and professional interpersonal skills.',
        },
      ]}
      faqs={[
        {
          question: 'Can concierge staff represent our brand values?',
          answer:
            'Absolutely. We hire and train staff to embody professionalism and reflect your brand tone. Uniforms, greeting standards, and service protocols are customized to your building culture.',
        },
        {
          question: 'Do you offer multi-language support?',
          answer:
            'Yes. Our London and South East team includes multi-lingual staff. We can arrange language support for regular or event-based needs.',
        },
        {
          question: 'How is concierge service priced?',
          answer:
            'Based on desk hours (full-time 24/7, business hours, or evening/weekend coverage) and scope of services. Premium VIP services have additional fees.',
        },
        {
          question: 'Can you handle package delivery volume surges?',
          answer:
            'Yes. We scale storage and handling during peak holiday periods and can implement surge protocols if delivery volume increases.',
        },
        {
          question: 'What if a situation requires judgment calls?',
          answer:
            'Our staff are trained in visitor safety assessment, problem-solving, and escalation procedures. Sensitive situations are escalated to your security or management immediately.',
        },
      ]}
      relatedServices={[
        { label: 'Security Services', path: '/soft-services/security' },
        { label: 'Facilities Management', path: '/soft-services/facilities-management' },
      ]}
    />
  );
}
