import { ServiceDetailPage } from '../../components/services/ServiceDetailPage.js';

export function ReactiveMaintenance() {
  return (
    <ServiceDetailPage
      id="reactive-maintenance"
      path="/hard-services/reactive-maintenance"
      title="Reactive Maintenance"
      icon="hammer"
      heroDescription="Rapid response to unplanned breakdowns, emergency repairs, and urgent facility issues — keeping you operational 24/7"
      overview={
        <>
          <p>
            Equipment fails when you least expect it. Reactive maintenance is emergency response: getting a qualified engineer on site fast,
            diagnosing the problem, and restoring operations. Atlas South operates 24/7 across London and the South East for exactly this reason.
          </p>
          <p>
            We respond to call-outs from emergency repairs (broken doors, burst pipes, electrical faults) to complex multi-trade issues. A dedicated
            control room manages dispatch to hit response-time targets even during peak demand.
          </p>
        </>
      }
      features={[
        {
          icon: 'alarm-clock',
          title: '24/7 Hotline',
          description: 'Call any time, day or night. Qualified engineers dispatched to your location within response time commitment.',
        },
        {
          icon: 'hammer',
          title: 'Multi-Trade Capability',
          description: 'Plumbing, electrical, mechanical, doors/locks, and general maintenance — often resolved by one engineer without callbacks.',
        },
        {
          icon: 'zap',
          title: 'Rapid Diagnosis',
          description: 'Specialist equipment and experience mean fast fault-finding, even for intermittent or complex issues.',
        },
        {
          icon: 'clipboard-check',
          title: 'Documentation',
          description: 'Every call documented: photos, parts fitted, root cause analysis, preventative recommendations.',
        },
        {
          icon: 'toolbox',
          title: 'Stock & Spares',
          description: 'Vans carry common parts and materials to complete repairs on first visit without material delays.',
        },
        {
          icon: 'trending-down',
          title: 'Breakdown Prevention',
          description: 'After the emergency, we recommend preventative maintenance to avoid repeating the same fault.',
        },
      ]}
      faqs={[
        {
          question: 'What counts as a reactive maintenance emergency?',
          answer:
            'Anything affecting operations or safety: equipment failure, burst pipes, electrical faults, door locks, HVAC breakdown, etc. We respond to all call-outs equally.',
        },
        {
          question: 'How much does a reactive call cost?',
          answer:
            'Call-out and first hour: fixed rate. Additional labor: hourly rate. Materials at cost + markup. We provide estimates before starting work exceeding the first-hour rate.',
        },
        {
          question: 'Can you start work before my approval?',
          answer:
            'For safety emergencies (electrical hazard, water leak, broken security), yes — we act first and explain after. For non-urgent issues, we always get approval and cost estimate first.',
        },
        {
          question: 'Is reactive maintenance covered under a maintenance contract?',
          answer:
            'Depends on the contract. Some contracts bundle reactives; others separate emergency call-out costs. We can structure contracts however suits your budget and risk profile.',
        },
        {
          question: 'Do you help with insurance claims for equipment damage?',
          answer:
            'Yes. We document everything and provide detailed reports that help with insurer claims. Many clients have us on speed-dial specifically for claims support.',
        },
      ]}
      relatedServices={[
        { label: 'Electricals', path: '/hard-services/electricals' },
        { label: 'Plumbing', path: '/hard-services/plumbing' },
        { label: 'Fire & Safety', path: '/hard-services/fire-safety' },
      ]}
    />
  );
}
