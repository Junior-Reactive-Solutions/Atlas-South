import { HARD_SERVICES, SOFT_SERVICES } from '@atlas-south/shared';
import { IndustryDetailPage } from '../../components/industries/IndustryDetailPage';

export function Healthcare() {
  const relevantHardServices = HARD_SERVICES.filter((s) =>
    ['electricals', 'plumbing', 'reactive-maintenance', 'fire-safety'].includes(s.id)
  );
  const relevantSoftServices = SOFT_SERVICES.filter((s) =>
    ['facilities-management', 'security', 'commercial-cleaning'].includes(s.id)
  );

  return (
    <IndustryDetailPage
      id="healthcare"
      title="Healthcare"
      icon="cross"
      heroDescription="Critical infrastructure management for hospitals, clinics, and care facilities where downtime affects patient outcomes"
      overview={
        <>
          <p>
            Healthcare facilities operate 24/7 with zero tolerance for service failures. A plumbing issue, an electrical
            fault, or a fire safety system malfunction isn't just inconvenient — it can disrupt patient care, compromise
            sterile environments, and trigger regulatory scrutiny.
          </p>
          <p>
            Atlas South understands the operational constraints of healthcare estates. Our engineers work within your
            infection control protocols, coordinate around clinical schedules, and respond to emergencies with the
            prioritization your facility requires.
          </p>
        </>
      }
      challenges={
        <>
          <ul>
            <li>
              <strong>Zero-downtime mandate:</strong> Unlike a typical office, you cannot simply "shut down" a wing for
              maintenance. Work must be coordinated around clinical operations, visiting hours, and patient transfer
              protocols.
            </li>
            <li>
              <strong>Sterility and infection control:</strong> Service engineers must understand your infection control
              zones, PPE requirements, and handover protocols — a standard tradesperson is not equipped for this.
            </li>
            <li>
              <strong>Regulatory weight:</strong> Health & Safety Executive (HSE), CQC, Fire & Rescue, environmental
              health, and your own governance committee all audit your building services and compliance records.
            </li>
            <li>
              <strong>Critical systems:</strong> Backup generators, emergency lighting, fire suppression, medical gas
              systems, water purity — failures ripple through clinical operations instantly.
            </li>
            <li>
              <strong>Aging estates:</strong> Many healthcare buildings are decades old with legacy infrastructure that
              requires specialist knowledge and careful planning to maintain without disrupting modern services running
              on top.
            </li>
          </ul>
        </>
      }
      ourApproach={
        <>
          <p>
            We embed ourselves into your healthcare operational model, not the other way around:
          </p>
          <ul>
            <li>
              <strong>Clinical-aware scheduling:</strong> Maintenance is planned around clinical calendars, shift handovers,
              and patient flow — not imposed on you.
            </li>
            <li>
              <strong>Infection control compliance:</strong> Our engineers are briefed on your facility's IC protocols and
              understand the segregation of "clean" and "dirty" zones, decontamination workflows, and PPE requirements.
            </li>
            <li>
              <strong>24/7 emergency response:</strong> A senior, hospital-experienced engineer is dispatched to any
              critical system failure, and we coordinate with your facilities team and clinical leadership in real time.
            </li>
            <li>
              <strong>Compliance documentation:</strong> Every service visit, inspection, and maintenance event is recorded
              and cross-referenced to your compliance calendar — feeding directly into your CQC and HSE evidence files.
            </li>
            <li>
              <strong>Legacy system expertise:</strong> Older buildings often have mixed-age infrastructure. We maintain
              both vintage systems and newer additions without introducing incompatibilities or silent failures.
            </li>
          </ul>
        </>
      }
      serviceHighlights={[
        {
          serviceLabel: "24/7 Emergency Response",
          description: "Senior engineers dispatched to critical infrastructure failures. Real-time coordination with clinical teams and facilities management.",
        },
        {
          serviceLabel: "Preventative Maintenance",
          description: "Scheduled works planned around clinical operations, reducing the risk of emergency breakdowns affecting patient care.",
        },
        {
          serviceLabel: "Compliance & Certification",
          description: "Fire safety, electrical testing, water safety, medical gas systems — all documented for HSE, CQC, and internal governance audits.",
        },
        {
          serviceLabel: "Cleaning & Hygiene",
          description: "Deep facility cleaning and infection control coordination, with protocols tailored to healthcare standards.",
        },
        {
          serviceLabel: "Security & Access Control",
          description: "Integrated with your clinical security needs — controlled access to equipment rooms, pharmacy areas, and sensitive infrastructure.",
        },
        {
          serviceLabel: "Legacy System Support",
          description: "Experience with older healthcare estate infrastructure, mixed-age systems, and the knowledge to maintain without disrupting modern overlays.",
        },
      ]}
      relatedServices={[
        ...relevantHardServices.map((s) => ({ label: s.label, path: s.path })),
        ...relevantSoftServices.map((s) => ({ label: s.label, path: s.path })),
      ]}
    />
  );
}
