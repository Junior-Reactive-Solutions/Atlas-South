import { ServiceDetailPage } from '../../components/services/ServiceDetailPage.js';

export function WasteRecycling() {
  return (
    <ServiceDetailPage
      id="waste-recycling"
      path="/soft-services/waste-recycling"
      title="Waste & Recycling"
      icon="recycle"
      heroDescription="Comprehensive waste management, recycling programs, and sustainable disposal aligned with environmental compliance and ESG targets"
      overview={
        <>
          <p>
            Waste management isn't just about bins—it's about compliance, sustainability, and cost. Regulations around duty of care, waste tracking,
            and environmental reporting are strict. Atlas South manages waste streams, recycling programs, hazardous disposal, and documentation so
            you meet regulatory obligations and ESG commitments.
          </p>
          <p>
            We handle collection, segregation, recycling optimization, hazardous waste certification, and data reporting—transforming waste into a
            managed, compliant, and increasingly sustainable operation.
          </p>
        </>
      }
      features={[
        {
          icon: 'trash-2',
          title: 'General Waste Collection',
          description: 'Scheduled collection and disposal of general waste with flexible collection frequency and container sizing.',
        },
        {
          icon: 'recycle',
          title: 'Recycling Programs',
          description: 'Paper, cardboard, plastics, and mixed recycling streams with contamination control and optimization coaching.',
        },
        {
          icon: 'alert-circle',
          title: 'Hazardous Waste Disposal',
          description: 'Specialist handling and certified disposal of electrical waste, chemicals, medical waste, and other hazardous streams.',
        },
        {
          icon: 'chart-line',
          title: 'Waste Auditing & Optimization',
          description: 'Analysis of waste streams to identify cost savings, contamination issues, and recycling improvement opportunities.',
        },
        {
          icon: 'clipboard-check',
          title: 'Compliance & Documentation',
          description: 'Waste transfer notes, duty of care documentation, environmental permits, and ESG reporting support.',
        },
        {
          icon: 'leaf',
          title: 'Sustainability Initiatives',
          description: 'Zero-waste program consulting, circular-economy partnerships, and emissions tracking for carbon reporting.',
        },
      ]}
      faqs={[
        {
          question: 'What is duty of care for waste?',
          answer:
            'UK law requires waste producers to ensure waste is properly segregated, documented, and passed to licensed disposal firms. We handle all aspects, providing you with full compliance documentation.',
        },
        {
          question: 'How is recycling quality measured?',
          answer:
            'We track contamination rates in each stream (target: <5%), educate staff to reduce contamination, and provide data dashboards showing recycling rates.',
        },
        {
          question: 'Can you help with ESG waste targets?',
          answer:
            'Yes. We audit your waste streams, set realistic reduction targets, optimize recycling, and provide third-party verified reporting for ESG disclosure.',
        },
        {
          question: 'What counts as hazardous waste?',
          answer:
            'WEEE (electronics), batteries, chemicals, oils, fluorescent tubes, medical/sharps waste, and other classified materials. We determine your hazardous streams and arrange certified disposal.',
        },
        {
          question: 'How much do we save through recycling optimization?',
          answer:
            'Depends on your current profile, but many clients reduce disposal costs by 20-40% through better segregation, contamination control, and optimized collection frequency.',
        },
      ]}
      relatedServices={[
        { label: 'Facilities Management', path: '/soft-services/facilities-management' },
        { label: 'Commercial Cleaning', path: '/soft-services/commercial-cleaning' },
      ]}
    />
  );
}
