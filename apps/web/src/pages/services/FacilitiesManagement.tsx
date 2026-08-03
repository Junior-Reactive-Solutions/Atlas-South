import { ServiceDetailPage } from '../../components/services/ServiceDetailPage.js';

export function FacilitiesManagement() {
  return (
    <ServiceDetailPage
      id="facilities-management"
      path="/soft-services/facilities-management"
      title="Facilities Management"
      icon="building-2"
      heroDescription="Integrated facilities management combining hard services, soft services, and operational support under one contract"
      overview={
        <>
          <p>
            Facilities management is the glue holding a building together—coordinating plumbing, electrical, cleaning, security, catering, and a
            hundred other moving parts. Rather than juggling multiple vendors, consolidate under a single facilities partner who knows your building,
            your people, and your operational needs.
          </p>
          <p>
            Atlas South's integrated FM model combines hard services (electrical, plumbing, maintenance) with soft services (cleaning, security,
            catering) in one contract, one invoice, one point of contact.
          </p>
        </>
      }
      features={[
        {
          icon: 'briefcase',
          title: 'Single Point of Contact',
          description: 'One account manager coordinating all building services, reducing liaison overhead and accelerating problem resolution.',
        },
        {
          icon: 'chart-line',
          title: 'Integrated Planning',
          description: 'Preventative maintenance schedules coordinated across all trades to avoid conflicts and optimize engineering time.',
        },
        {
          icon: 'layers',
          title: 'Hard + Soft Services',
          description: 'Combine electrical, plumbing, maintenance with cleaning, security, catering in one contract and budget.',
        },
        {
          icon: 'trending-down',
          title: 'Cost Optimization',
          description: 'Consolidated purchasing and cross-trade efficiency often costs less than separate vendors.',
        },
        {
          icon: 'file-check',
          title: 'Compliance & Reporting',
          description: 'Monthly performance reviews, KPI tracking, and full audit documentation for governance teams.',
        },
        {
          icon: 'headphones',
          title: '24/7 Support',
          description: 'Emergency escalation path and after-hours contact for urgent building issues.',
        },
      ]}
      faqs={[
        {
          question: 'How is FM priced—fixed monthly or variable?',
          answer:
            'We structure contracts both ways: fixed-price annual contracts for predictable budgeting, or hybrid (fixed base + variable reactives). Choose what suits your cost profile.',
        },
        {
          question: 'Can you transition existing vendors into an integrated FM model?',
          answer:
            'Yes. We work with your incumbent providers to transition services smoothly. No disruption to your operations—we plan handovers carefully.',
        },
        {
          question: 'Do you manage subcontractors or bring everything in-house?',
          answer:
            'We manage both. Larger scopes use our own teams; specialist services use qualified subcontractors vetted and managed by us.',
        },
        {
          question: 'What happens if FM demand spikes unexpectedly?',
          answer:
            'We scale up rapidly using our network of associates and subcontractors. Most spike scenarios are managed within existing contract terms.',
        },
        {
          question: 'How do we measure whether FM is working?',
          answer:
            'We track KPIs (response times, uptime, compliance %, tenant satisfaction) and review monthly. Transparency is built into every contract.',
        },
      ]}
      relatedServices={[
        { label: 'Electricals', path: '/hard-services/electricals' },
        { label: 'Plumbing', path: '/hard-services/plumbing' },
        { label: 'Security Services', path: '/soft-services/security' },
        { label: 'Commercial Cleaning', path: '/soft-services/commercial-cleaning' },
      ]}
    />
  );
}
