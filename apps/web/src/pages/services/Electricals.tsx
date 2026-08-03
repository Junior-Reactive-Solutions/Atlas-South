import { ServiceDetailPage } from '../../components/services/ServiceDetailPage.js';

export function Electricals() {
  return (
    <ServiceDetailPage
      id="electricals"
      title="Electricals"
      icon="zap"
      heroDescription="Comprehensive electrical services for commercial and industrial facilities, from installation to maintenance to emergency response"
      overview={
        <>
          <p>
            Electrical systems are critical infrastructure. A fault isn't just a cost — it affects operations, safety, and compliance. Atlas South
            provides end-to-end electrical services: planned maintenance, rapid fault diagnosis, emergency response, and full compliance testing.
          </p>
          <p>
            Our engineers are qualified to Building Regulations, BS 7909, and all relevant electrical standards. We manage everything from routine
            PAT testing to major system upgrades.
          </p>
        </>
      }
      features={[
        {
          icon: 'zap',
          title: 'Planned Maintenance',
          description: 'Scheduled inspections, testing, and maintenance to catch faults before they cause failures.',
        },
        {
          icon: 'wrench',
          title: 'Installation & Upgrades',
          description: 'New circuits, panel upgrades, lighting refits, and complete system rewiring for renovations.',
        },
        {
          icon: 'alert-circle',
          title: 'Emergency Response',
          description: 'Rapid dispatch for electrical faults, outages, and safety issues causing downtime.',
        },
        {
          icon: 'shield-check',
          title: 'Compliance & Testing',
          description: 'EICR inspections, PAT testing, isolation device testing, all with full documentation.',
        },
        {
          icon: 'eye',
          title: 'Fault Diagnosis',
          description: 'Thermal imaging, circuit tracing, and specialist equipment to diagnose intermittent or complex issues.',
        },
        {
          icon: 'lightbulb',
          title: 'Energy Optimization',
          description: 'LED retrofits, sensor controls, and load optimization to reduce electricity bills.',
        },
      ]}
      faqs={[
        {
          question: 'What electrical work requires a qualified engineer?',
          answer:
            'Most commercial work does. Building Regulations requires Part P qualified engineers for new circuits, distribution board work, and high-risk modifications. We are fully qualified and insured.',
        },
        {
          question: 'How often do EICR inspections need doing?',
          answer:
            'BS 7909 recommends every 3–5 years for most commercial buildings. High-use facilities may need annual inspections. We assess your building to recommend the right interval.',
        },
        {
          question: 'What if an engineer finds something during testing?',
          answer:
            'We categorize faults by risk (C1 = immediate, C2 = planned, C3 = advisory). We provide a full report with remedial quotations so you can plan budget.',
        },
        {
          question: 'Can you work without shutting down the building?',
          answer:
            'Yes. We use temporary supplies, phased work schedules, and non-disruptive testing techniques to minimize impact during maintenance.',
        },
        {
          question: 'Do you do small jobs or only big installations?',
          answer:
            'Both. From single-circuit additions to major system overhauls, we handle projects of any size with the same quality and compliance standard.',
        },
      ]}
      relatedServices={[
        { label: 'Fire & Safety', path: '/hard-services/fire-safety' },
        { label: 'Reactive Maintenance', path: '/hard-services/reactive-maintenance' },
      ]}
    />
  );
}
