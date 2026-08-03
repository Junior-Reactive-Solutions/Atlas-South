import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';

/**
 * Plumbing service page — docs/build/06-PAGE-SPECIFICATIONS.md "Hard Services row".
 * Template and example for how each hard/soft service detail page should be structured.
 * Replace placeholder content with real technical specifications and FAQs once confirmed with client.
 */
export function Plumbing() {
  return (
    <ServiceDetailPage
      id="plumbing"
      path="/hard-services/plumbing"
      title="Plumbing Services"
      icon="wrench"
      heroDescription="Comprehensive plumbing solutions for commercial and industrial facilities, from emergency response to preventative maintenance."
      overview={
        <>
          <h2>Professional plumbing for buildings of all sizes</h2>
          <p>
            Atlas South provides full-spectrum plumbing services designed to keep your building's water
            systems running smoothly. Whether you need emergency response at 2 AM or planned maintenance
            schedules, our team has the expertise and equipment to handle complex commercial plumbing
            challenges.
          </p>
          <p>
            We work with healthcare trusts, shopping centres, offices, and industrial facilities — each
            with distinct plumbing demands. Our approach combines rapid fault diagnosis, minimal downtime,
            and long-term reliability.
          </p>
        </>
      }
      features={[
        {
          icon: 'wrench',
          title: 'Emergency response',
          description:
            'Burst pipes, blocked drains, failed water heaters. We respond within 60 minutes to prevent water damage.',
        },
        {
          icon: 'hammer',
          title: 'System installation',
          description:
            'Design, install, and commission new plumbing systems for renovations, new builds, and facility upgrades.',
        },
        {
          icon: 'zap',
          title: 'Preventative maintenance',
          description:
            'Scheduled inspections, cleaning, and servicing to catch problems before they become costly failures.',
        },
        {
          icon: 'shield-check',
          title: 'Compliance & certification',
          description:
            'All work meets Building Regulations, Water Regulations, and industry standards. Full documentation provided.',
        },
        {
          icon: 'server',
          title: 'Leak detection',
          description:
            'Advanced equipment to locate hidden leaks without invasive excavation, saving time and money.',
        },
        {
          icon: 'eye',
          title: 'CCTV inspections',
          description:
            'Remote camera surveys of internal pipework to diagnose blockages, cracks, and structural damage.',
        },
      ]}
      faqs={[
        {
          question: "How quickly can you respond to an emergency?",
          answer:
            "Our emergency response target is 60 minutes for facilities within our coverage area. Call our 24/7 hotline and we'll dispatch the nearest available engineer.",
        },
        {
          question: "Do you handle both water supply and drainage?",
          answer:
            "Yes. We manage cold water, hot water (including boiler integration), waste water, and surface drainage systems across commercial buildings.",
        },
        {
          question: "What areas do you cover?",
          answer:
            "We operate across 6 counties in the South. Check our service areas page for a detailed map and postcode checker.",
        },
        {
          question: "Can you work during operating hours without disrupting facilities?",
          answer:
            "Absolutely. We schedule works around your business operations and use techniques like bypass pipework to maintain water supply during maintenance.",
        },
        {
          question: "Do you offer service contracts?",
          answer:
            "Yes. We offer fixed-price annual maintenance packages tailored to your building size and age. This often costs less than reactive repairs alone.",
        },
      ]}
      relatedServices={[
        { label: 'HVAC Services', path: '/hard-services/hvac' },
        { label: 'Fire Safety Systems', path: '/hard-services/fire-safety' },
      ]}
    />
  );
}
