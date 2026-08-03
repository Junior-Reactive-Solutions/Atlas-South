import { ServiceDetailPage } from '../../components/services/ServiceDetailPage.js';

export function FireSafety() {
  return (
    <ServiceDetailPage
      id="fire-safety"
      path="/hard-services/fire-safety"
      title="Fire & Safety"
      icon="flame"
      heroDescription="Comprehensive fire safety, emergency lighting, and life-safety systems to keep your building code-compliant and people protected"
      overview={
        <>
          <p>
            Fire safety isn't optional—it's a legal duty and a moral imperative. Fire Safety Order 2005 requires regular testing, maintenance, and
            certification. Atlas South manages the full scope: sprinkler systems, emergency lighting, fire alarms, evacuation procedures, and compliance
            records.
          </p>
          <p>
            We work with fire safety engineers, local authorities, and insurers to ensure your building meets all statutory requirements and your team
            understands emergency protocols.
          </p>
        </>
      }
      features={[
        {
          icon: 'flame',
          title: 'Sprinkler Systems',
          description: 'Installation, testing, and annual certification of fire sprinkler systems per BS 9251 and insurance requirements.',
        },
        {
          icon: 'lightbulb',
          title: 'Emergency Lighting',
          description: 'Testing, maintenance, and battery replacement for emergency lighting and exit signage systems.',
        },
        {
          icon: 'alert-circle',
          title: 'Fire Alarm Systems',
          description: 'Design, installation, testing, and ongoing maintenance of fire detection and alarm systems.',
        },
        {
          icon: 'map-pin',
          title: 'Evacuation Planning',
          description: 'Risk assessment, evacuation route planning, assembly point setup, and staff training programs.',
        },
        {
          icon: 'shield-check',
          title: 'Compliance & Audit',
          description: 'Full compliance audits against Fire Safety Order, Building Regulations, and insurance requirements.',
        },
        {
          icon: 'clipboard-check',
          title: 'Documentation',
          description: 'Comprehensive maintenance records, test certificates, and compliance reports for insurers and authorities.',
        },
      ]}
      faqs={[
        {
          question: 'What tests do fire safety systems need?',
          answer:
            'Sprinklers annually (BS 9251); emergency lighting monthly walkthrough + annual full test; fire alarms weekly/monthly depending on system type. We schedule and document everything.',
        },
        {
          question: 'Who is responsible for fire safety compliance?',
          answer:
            'The building owner and occupier have a joint duty under Fire Safety Order 2005. We help you meet that duty through testing, training, and documentation.',
        },
        {
          question: 'What if your tests find a fault?',
          answer:
            'We report the fault, recommend remedial action, and provide quotations for repairs. Critical faults (failed sprinkler test, non-functional alarm) must be fixed before re-use.',
        },
        {
          question: 'Do you help with fire safety training?',
          answer:
            'We coordinate with accredited fire training providers. We can arrange on-site drill training and evacuation exercises tailored to your building layout.',
        },
        {
          question: 'Are fire safety costs covered by insurance?',
          answer:
            'No, fire safety compliance is a legal requirement, not an insurance-covered item. However, lapses in fire safety can void insurance, so staying compliant protects you.',
        },
      ]}
      relatedServices={[
        { label: 'Electricals', path: '/hard-services/electricals' },
        { label: 'Plumbing', path: '/hard-services/plumbing' },
        { label: 'Reactive Maintenance', path: '/hard-services/reactive-maintenance' },
      ]}
    />
  );
}
