import { ServiceDetailPage } from '../../components/services/ServiceDetailPage.js';

export function Catering() {
  return (
    <ServiceDetailPage
      id="catering"
      path="/soft-services/catering"
      title="Catering"
      icon="utensils"
      heroDescription="On-site and contracted catering for corporate events, staff canteens, and hospitality across London and the South East"
      overview={
        <>
          <p>
            Food and hospitality leave lasting impressions. Whether it's daily staff canteen services, corporate event catering, or hospitality for
            client meetings, excellence in catering reflects on your business. Atlas South manages kitchen operations, menus, procurement, and service
            to professional standards.
          </p>
          <p>
            We work with corporate dining cultures, dietary requirements, budgets, and event scale—handling everything from menu planning to kitchen
            management to post-event cleanup.
          </p>
        </>
      }
      features={[
        {
          icon: 'utensils',
          title: 'Staff Canteen Service',
          description: 'Daily meal preparation and service for on-site staff, with flexible menu rotations and dietary accommodations.',
        },
        {
          icon: 'party-popper',
          title: 'Event Catering',
          description: 'Full event catering for conferences, product launches, client entertainment, and team celebrations of any size.',
        },
        {
          icon: 'leaf',
          title: 'Dietary & Allergen Support',
          description: 'Vegan, vegetarian, gluten-free, halal, kosher, and allergen-aware menus tailored to your population.',
        },
        {
          icon: 'chef-hat',
          title: 'Menu Planning',
          description: 'Seasonal menus, nutritional balance, and culinary variety designed with your team or event theme in mind.',
        },
        {
          icon: 'package',
          title: 'Procurement & Stock',
          description: 'Sourcing, supplier relationships, and kitchen stock management to control costs and reduce waste.',
        },
        {
          icon: 'briefcase',
          title: 'Hospitality & Service',
          description: 'Professional service for VIP events, client entertainment, and high-touch hospitality scenarios.',
        },
      ]}
      faqs={[
        {
          question: 'Can you handle dietary restrictions and allergies?',
          answer:
            'Yes, absolutely. We maintain separate preparation areas, ingredient tracking, and service protocols for allergen-free and dietary-specific menus.',
        },
        {
          question: 'How is catering priced?',
          answer:
            'Staff canteen: monthly contract based on headcount and service levels. Event catering: per-head pricing based on menu and service style.',
        },
        {
          question: 'Do you manage the kitchen facilities or supply your own?',
          answer:
            'We can use your existing kitchen with our staff, or bring mobile catering units for events. Depends on your facilities and the scope.',
        },
        {
          question: 'Can you adjust menus seasonally or for preferences?',
          answer:
            'Yes. We rotate menus quarterly, gather feedback from staff, and adjust based on popular items and seasonal ingredients.',
        },
        {
          question: 'What if an event needs last-minute changes?',
          answer:
            'We accommodate menu adjustments, guest-count changes, and timing shifts up to 24 hours before. Last-minute changes incur a small surcharge.',
        },
      ]}
      relatedServices={[
        { label: 'Facilities Management', path: '/soft-services/facilities-management' },
        { label: 'Commercial Cleaning', path: '/soft-services/commercial-cleaning' },
      ]}
    />
  );
}
