import { HARD_SERVICES, SOFT_SERVICES } from '@atlas-south/shared';
import { IndustryDetailPage } from '../../components/industries/IndustryDetailPage';

export function Corporate() {
  const relevantHardServices = HARD_SERVICES.filter((s) =>
    ['electricals', 'plumbing', 'reactive-maintenance', 'fire-safety'].includes(s.id)
  );
  const relevantSoftServices = SOFT_SERVICES.filter((s) =>
    ['facilities-management', 'security'].includes(s.id)
  );

  return (
    <IndustryDetailPage
      id="corporate"
      path="/industries/corporate"
      title="Corporate"
      icon="briefcase"
      heroDescription="Multi-site compliance, predictable costs, and responsive support for enterprise building management"
      overview={
        <>
          <p>
            Corporate headquarters and multi-site office portfolios demand building services that don't just react
            to problems — they anticipate them. Your facilities underpin business continuity, employee safety, and
            regulatory compliance across often-complex estate profiles.
          </p>
          <p>
            Atlas South has supported corporate clients from FTSE-listed firms to growth-stage tech companies,
            managing everything from routine maintenance schedules to emergency response coordination across multiple
            buildings, often across multiple regions.
          </p>
        </>
      }
      challenges={
        <>
          <ul>
            <li>
              <strong>Spread-out sites:</strong> Managing 5, 10, or 50+ sites means coordinating maintenance,
              compliance, and emergency response across locations — without creating a procurement nightmare.
            </li>
            <li>
              <strong>Regulatory weight:</strong> Health & Safety, Fire Safety, electrical testing, water safety — the
              compliance calendar never stops. A missed inspection or certification lapse carries real liability.
            </li>
            <li>
              <strong>Cost control:</strong> Building services budgets need predictability and visibility. Reactive
              repairs eat contingency; poor preventative planning wastes money.
            </li>
            <li>
              <strong>Tenant/employee safety:</strong> Any service failure is not just a cost — it affects day-to-day
              operations and employee experience.
            </li>
            <li>
              <strong>Partner coordination:</strong> Juggling multiple service providers across sites creates coordination
              overhead and the risk of gaps where "we thought the other vendor was handling that."
            </li>
          </ul>
        </>
      }
      ourApproach={
        <>
          <p>
            We consolidate your building services under a single partner, reducing the overhead of managing multiple
            vendors. For corporate clients, we typically structure a combination of:
          </p>
          <ul>
            <li>
              <strong>Preventative maintenance contracts</strong> with fixed annual costs and clearly scheduled works,
              so you know what to budget and what's covered.
            </li>
            <li>
              <strong>24/7 emergency response</strong> for unplanned breakdowns — one call, one dispatcher, engineers
              deployed to whichever site needs them.
            </li>
            <li>
              <strong>Compliance management</strong> where we track, schedule, and execute all inspections and
              certifications, and provide you with a live audit trail for your own compliance reporting.
            </li>
            <li>
              <strong>On-site liaison</strong> — for larger estates, a dedicated point of contact who knows your sites,
              your people, and your operational constraints.
            </li>
          </ul>
          <p>
            This model works across Hard Services (electrical, plumbing, reactive maintenance, fire safety) and Soft
            Services (facilities management, security coordination, catering support) — consolidating procurement and
            improving response times.
          </p>
        </>
      }
      serviceHighlights={[
        {
          serviceLabel: "Facilities Management",
          description: "Integrated hard and soft services under one contract, with predictable budgets and scheduled maintenance reducing downtime and reactive costs.",
        },
        {
          serviceLabel: "Compliance & Certifications",
          description: "Fire safety, electrical testing, water safety, H&S audits — all scheduled, executed, and documented for your own compliance reporting.",
        },
        {
          serviceLabel: "Emergency Response",
          description: "24/7 hotline with engineers dispatched to any of your sites within our response-time commitment, keeping your operations running.",
        },
        {
          serviceLabel: "Security & Safety",
          description: "Coordination with your internal security teams and integration of our security services across your site portfolio.",
        },
        {
          serviceLabel: "Cost Visibility",
          description: "Monthly or quarterly reporting on spend, trends, and preventative work completed — helping you forecast and optimize building services budgets.",
        },
        {
          serviceLabel: "Site Handover Support",
          description: "New build or lease assumption? We handle the fit-out services, compliance audit, and full documentation handover.",
        },
      ]}
      relatedServices={[
        ...relevantHardServices.map((s) => ({ label: s.label, path: s.path })),
        ...relevantSoftServices.map((s) => ({ label: s.label, path: s.path })),
      ]}
    />
  );
}
