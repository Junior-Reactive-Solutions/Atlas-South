import { ServiceDetailPage } from '../../components/services/ServiceDetailPage.js';

export function CommercialCleaning() {
  return (
    <ServiceDetailPage
      id="commercial-cleaning"
      path="/soft-services/commercial-cleaning"
      title="Commercial Cleaning"
      icon="sparkles"
      heroDescription="Professional daily and specialized cleaning maintaining hygiene, appearance, and compliance across all facility types"
      overview={
        <>
          <p>
            Cleanliness isn't cosmetic—it affects health, morale, and first impressions. Commercial cleaning requires discipline, systems, and trained
            staff. Atlas South manages everything from daily office cleaning to specialized deep-cleans, specialized floor care, and post-incident
            biohazard cleanup.
          </p>
          <p>
            We schedule around your operations, use industry-standard protocols and eco-friendly products, track performance with checklists and photo
            documentation, and respond rapidly to urgent cleanup needs.
          </p>
        </>
      }
      features={[
        {
          icon: 'sparkles',
          title: 'Daily Cleaning',
          description: 'Regular office, corridor, and common-area cleaning scheduled outside business hours. Customizable frequency and scope.',
        },
        {
          icon: 'brush',
          title: 'Specialist Cleaning',
          description: 'Floor stripping & waxing, carpet shampooing, window cleaning, high-dusting, and deep-cleans between tenants.',
        },
        {
          icon: 'shield-check',
          title: 'Hygiene & Compliance',
          description: 'Washroom servicing, hand sanitizer refills, infection control protocols for healthcare and food-prep areas.',
        },
        {
          icon: 'clipboard-check',
          title: 'Quality Control',
          description: 'Daily checklists, photo documentation, and performance reviews to ensure consistent standards.',
        },
        {
          icon: 'alert-circle',
          title: 'Emergency Response',
          description: 'Spill cleanup, biohazard decontamination, and post-incident deep-cleans available 24/7.',
        },
        {
          icon: 'leaf',
          title: 'Eco-Friendly Options',
          description: 'Non-toxic products, waste reduction, and sustainable cleaning practices upon request.',
        },
      ]}
      faqs={[
        {
          question: 'How do you schedule cleaning without disrupting work?',
          answer:
            'We clean outside office hours (early morning, evening, or weekends). For occupied-hour cleans (retail, healthcare), we use quiet methods and coordinate with your team.',
        },
        {
          question: 'What products do you use?',
          answer:
            'Industry-standard approved products with COSHH data sheets. We also offer eco-friendly or non-toxic alternatives for sensitive environments (healthcare, nurseries, etc.).',
        },
        {
          question: 'How is cleaning priced?',
          answer: 'Fixed monthly contracts for regular cleaning; hourly rates for deep-cleans and specialist services. Volume discounts apply to multi-site contracts.',
        },
        {
          question: 'Do you provide equipment or do we need to?',
          answer:
            'We provide all cleaning equipment, supplies, and waste disposal. All you need is access to your building.',
        },
        {
          question: 'What happens if cleaning quality drops?',
          answer:
            'We track performance with checklists and photos. If you flag an issue, we investigate, re-train the team, and revisit no extra charge.',
        },
      ]}
      relatedServices={[
        { label: 'Facilities Management', path: '/soft-services/facilities-management' },
        { label: 'Security Services', path: '/soft-services/security' },
      ]}
    />
  );
}
