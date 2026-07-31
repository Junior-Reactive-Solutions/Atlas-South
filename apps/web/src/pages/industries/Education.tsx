import { HARD_SERVICES, SOFT_SERVICES } from '@atlas-south/shared';
import { IndustryDetailPage } from '../../components/industries/IndustryDetailPage';

export function Education() {
  const relevantHardServices = HARD_SERVICES.filter((s) =>
    ['electricals', 'plumbing', 'reactive-maintenance', 'fire-safety'].includes(s.id)
  );
  const relevantSoftServices = SOFT_SERVICES.filter((s) =>
    ['facilities-management', 'security', 'commercial-cleaning'].includes(s.id)
  );

  return (
    <IndustryDetailPage
      id="education"
      title="Education & Learning Institutions"
      icon="graduation-cap"
      heroDescription="Safe, compliant, and cost-effective building services for schools, universities, and training centres"
      overview={
        <>
          <p>
            Educational facilities are often multi-purpose environments serving hundreds or thousands of students, staff,
            and visitors daily. A single safety failure or unplanned closure affects education delivery, student welfare,
            and staff safety.
          </p>
          <p>
            Atlas South works with schools, sixth forms, universities, and specialist training centres, managing building
            services around term schedules and balancing safety, compliance, and budget constraints.
          </p>
        </>
      }
      challenges={
        <>
          <ul>
            <li>
              <strong>Duty of care:</strong> Educational institutions have explicit safeguarding and duty of care
              responsibilities to students and staff. Any building safety issue (faulty wiring, poor ventilation, blocked
              fire exits) triggers immediate liability.
            </li>
            <li>
              <strong>Budget constraints:</strong> Educational budgets are typically tight, with competing priorities for
              teaching resources. Building services must deliver compliance and safety without excessive cost.
            </li>
            <li>
              <strong>Term-time operations:</strong> Schools operate on term calendars with holiday breaks. Maintenance
              must fit around school hours, exams, term ends, and break periods.
            </li>
            <li>
              <strong>High-use environments:</strong> Schools and universities pack intensive use into shared spaces —
              lecture halls, labs, kitchens, residences, sports facilities. Maintenance demand is high and wear predictable.
            </li>
            <li>
              <strong>Regulatory oversight:</strong> HSE, DfE, local authority inspections, and Ofsted all assess your
              facility management and safety record.
            </li>
          </ul>
        </>
      }
      ourApproach={
        <>
          <p>
            We align building services with educational operations, not the reverse:
          </p>
          <ul>
            <li>
              <strong>Term-aware scheduling:</strong> Maintenance is planned around term calendars, holiday breaks, and
              exam schedules — minimizing disruption to teaching.
            </li>
            <li>
              <strong>Preventative focus:</strong> Regular inspections and scheduled maintenance reduce emergency breakdowns
              that force closures or disrupt learning.
            </li>
            <li>
              <strong>Safety & compliance:</strong> Fire safety, electrical testing, asbestos management (if applicable),
              water safety, and gas — all documented for HSE and Ofsted audits.
            </li>
            <li>
              <strong>Budget transparency:</strong> Fixed-price maintenance contracts deliver cost predictability for
              institutional budgets, with clear documentation for governors/trustees.
            </li>
            <li>
              <strong>Emergency response:</strong> When something breaks during term, we respond quickly and minimize
              impact on teaching and student welfare.
            </li>
          </ul>
        </>
      }
      serviceHighlights={[
        {
          serviceLabel: "Term-Aware Planning",
          description: "Maintenance scheduled around term calendars, exams, and holiday breaks to minimize disruption to teaching.",
        },
        {
          serviceLabel: "Preventative Maintenance",
          description: "Regular inspections and scheduled works reduce emergency breakdowns that force closures or affect learning.",
        },
        {
          serviceLabel: "Safety & Compliance",
          description: "Fire safety, electrical testing, water quality, gas safety, and H&S audits — all documented for HSE, DfE, and Ofsted.",
        },
        {
          serviceLabel: "Budget Transparency",
          description: "Fixed-price annual contracts for institutional budgets with clear documentation for governors, trustees, and finance teams.",
        },
        {
          serviceLabel: "Facilities Support",
          description: "Cleaning, catering support, security coordination, and day-to-day operations across the entire campus.",
        },
        {
          serviceLabel: "Emergency Response",
          description: "When urgent repairs are needed during term, we respond quickly and coordinate with teaching staff to minimize impact.",
        },
      ]}
      relatedServices={[
        ...relevantHardServices.map((s) => ({ label: s.label, path: s.path })),
        ...relevantSoftServices.map((s) => ({ label: s.label, path: s.path })),
      ]}
    />
  );
}
