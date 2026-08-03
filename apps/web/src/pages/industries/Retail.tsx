import { HARD_SERVICES, SOFT_SERVICES } from '@atlas-south/shared';
import { IndustryDetailPage } from '../../components/industries/IndustryDetailPage';

export function Retail() {
  const relevantHardServices = HARD_SERVICES.filter((s) =>
    ['electricals', 'plumbing', 'reactive-maintenance', 'fire-safety'].includes(s.id)
  );
  const relevantSoftServices = SOFT_SERVICES.filter((s) =>
    ['facilities-management', 'security', 'commercial-cleaning'].includes(s.id)
  );

  return (
    <IndustryDetailPage
      id="retail"
      path="/industries/retail"
      title="Retail"
      icon="shopping-bag"
      heroDescription="Keep customer-facing spaces operational, safe, and compliant while managing costs across multi-unit estates"
      overview={
        <>
          <p>
            Retail centres, flagship stores, and distributed retail chains share one overriding constraint: the building
            must be ready to serve customers every day the doors are open. A fire alarm fault, a water leak, or broken
            HVAC isn't just a maintenance issue — it's lost trading hours, customer experience damage, and potential
            evacuation.
          </p>
          <p>
            Atlas South has managed retail estates ranging from single high-street stores to multi-unit regional portfolios,
            coordinating maintenance schedules around trading hours and tenant requirements.
          </p>
        </>
      }
      challenges={
        <>
          <ul>
            <li>
              <strong>Trading hours constraints:</strong> Most retail works must happen outside opening hours, creating a
              tight scheduling window and premium rates for any emergency overnight call.
            </li>
            <li>
              <strong>Multi-tenant coordination:</strong> If the building houses independent retailers, each has its own
              lease terms, insurance, and operational priorities — plus the landlord's broader infrastructure to manage.
            </li>
            <li>
              <strong>Customer safety liability:</strong> High footfall means high risk exposure. Any service failure
              affecting customer safety (trips, electrical hazards, fire safety) creates immediate liability and reputational
              risk.
            </li>
            <li>
              <strong>Energy efficiency:</strong> Retail spaces run heating, cooling, and lighting for long hours. A poorly
              maintained HVAC or lighting system drains profitability fast.
            </li>
            <li>
              <strong>Specialist areas:</strong> Retail chains often require food prep facilities, cold storage, secure
              areas, and specialist flooring — all with specific maintenance and compliance requirements.
            </li>
          </ul>
        </>
      }
      ourApproach={
        <>
          <p>
            We structure retail support around the trading calendar, not against it:
          </p>
          <ul>
            <li>
              <strong>Trading-hours aware scheduling:</strong> Maintenance and inspections are coordinated outside opening
              hours, with weekend or overnight works available for time-critical issues.
            </li>
            <li>
              <strong>Multi-site coordination:</strong> Manage one portfolio across multiple locations with a single point of
              contact, reducing the overhead of coordinating with separate vendors per unit.
            </li>
            <li>
              <strong>Tenant liaison:</strong> For managed centres, we coordinate with tenant teams, manage insurance
              handovers, and handle the logistical complexity of working in occupied retail environments.
            </li>
            <li>
              <strong>Compliance & safety:</strong> Fire safety, electrical testing, and Health & Safety inspections stay on
              schedule, reducing liability exposure.
            </li>
            <li>
              <strong>Cost optimization:</strong> Preventative maintenance on HVAC, lighting, and water systems reduces
              emergency call-outs and keeps energy bills predictable.
            </li>
          </ul>
        </>
      }
      serviceHighlights={[
        {
          serviceLabel: "Out-of-Hours Maintenance",
          description: "Scheduled works outside trading hours, with emergency response available overnight and weekends for critical issues.",
        },
        {
          serviceLabel: "Multi-Unit Portfolio Management",
          description: "Single point of contact and coordination across multiple retail locations, reducing procurement overhead and improving response times.",
        },
        {
          serviceLabel: "Compliance & Inspections",
          description: "Fire safety, electrical testing, gas safety, water systems — all scheduled and documented without disrupting customer experience.",
        },
        {
          serviceLabel: "Energy Efficiency",
          description: "HVAC optimization, lighting controls, and preventative maintenance to keep energy costs down across the estate.",
        },
        {
          serviceLabel: "Cleaning & Hygiene",
          description: "Deep cleaning, post-incident remediation, and health & safety compliance cleaning for food/beverage areas.",
        },
        {
          serviceLabel: "Security Integration",
          description: "Coordination with retail security systems, access control, and CCTV integration across your sites.",
        },
      ]}
      relatedServices={[
        ...relevantHardServices.map((s) => ({ label: s.label, path: s.path })),
        ...relevantSoftServices.map((s) => ({ label: s.label, path: s.path })),
      ]}
    />
  );
}
