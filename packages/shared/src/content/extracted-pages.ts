/**
 * The 21 service / industry / service-area page content records.
 *
 * Moved here from apps/api/scripts/extracted-content.json so there is exactly ONE copy of
 * this content in the repo. It is consumed by two places that previously could not share
 * it (an app can't import another app's scripts):
 *   - apps/api/scripts/seed-content.ts, which seeds it into the ContentPage table
 *   - apps/web's useContentPage hook, which uses it as the immediate, offline-safe render
 *     source (see the fuller note in content/index.ts)
 *
 * A .ts module rather than the original .json because packages/shared compiles with plain
 * tsc, which does not copy .json files into dist/ — a JSON import here would resolve in
 * development and then be missing at runtime in a built consumer.
 *
 * Generated once from that JSON; edit this file directly from now on.
 */
export interface ExtractedPage {
  slug: string;
  type: 'service' | 'industry' | 'area';
  path: string;
  data: Record<string, unknown>;
}

export const EXTRACTED_PAGES: ExtractedPage[] = [
  {
    "slug": "electricals",
    "type": "service",
    "path": "/hard-services/electricals",
    "data": {
      "title": "Electricals",
      "icon": "zap",
      "heroDescription": "Comprehensive electrical services for commercial and industrial facilities, from installation to maintenance to emergency response",
      "overview": "Electrical systems are critical infrastructure. A fault isn't just a cost — it affects operations, safety, and compliance. Atlas South provides end-to-end electrical services: planned maintenance, rapid fault diagnosis, emergency response, and full compliance testing.\n\nOur engineers are qualified to Building Regulations, BS 7909, and all relevant electrical standards. We manage everything from routine PAT testing to major system upgrades.",
      "features": [
        {
          "icon": "zap",
          "title": "Planned Maintenance",
          "description": "Scheduled inspections, testing, and maintenance to catch faults before they cause failures."
        },
        {
          "icon": "wrench",
          "title": "Installation & Upgrades",
          "description": "New circuits, panel upgrades, lighting refits, and complete system rewiring for renovations."
        },
        {
          "icon": "alert-circle",
          "title": "Emergency Response",
          "description": "Rapid dispatch for electrical faults, outages, and safety issues causing downtime."
        },
        {
          "icon": "shield-check",
          "title": "Compliance & Testing",
          "description": "EICR inspections, PAT testing, isolation device testing, all with full documentation."
        },
        {
          "icon": "eye",
          "title": "Fault Diagnosis",
          "description": "Thermal imaging, circuit tracing, and specialist equipment to diagnose intermittent or complex issues."
        },
        {
          "icon": "lightbulb",
          "title": "Energy Optimization",
          "description": "LED retrofits, sensor controls, and load optimization to reduce electricity bills."
        }
      ],
      "faqs": [
        {
          "question": "What electrical work requires a qualified engineer?",
          "answer": "Most commercial work does. Building Regulations requires Part P qualified engineers for new circuits, distribution board work, and high-risk modifications. We are fully qualified and insured."
        },
        {
          "question": "How often do EICR inspections need doing?",
          "answer": "BS 7909 recommends every 3–5 years for most commercial buildings. High-use facilities may need annual inspections. We assess your building to recommend the right interval."
        },
        {
          "question": "What if an engineer finds something during testing?",
          "answer": "We categorize faults by risk (C1 = immediate, C2 = planned, C3 = advisory). We provide a full report with remedial quotations so you can plan budget."
        },
        {
          "question": "Can you work without shutting down the building?",
          "answer": "Yes. We use temporary supplies, phased work schedules, and non-disruptive testing techniques to minimize impact during maintenance."
        },
        {
          "question": "Do you do small jobs or only big installations?",
          "answer": "Both. From single-circuit additions to major system overhauls, we handle projects of any size with the same quality and compliance standard."
        }
      ],
      "relatedServices": [
        {
          "label": "Reactive Maintenance",
          "path": "/hard-services/reactive-maintenance"
        }
      ]
    }
  },
  {
    "slug": "plumbing",
    "type": "service",
    "path": "/hard-services/plumbing",
    "data": {
      "title": "Plumbing Services",
      "icon": "wrench",
      "heroDescription": "Comprehensive plumbing solutions for commercial and industrial facilities, from emergency response to preventative maintenance.",
      "overview": "## Professional plumbing for buildings of all sizes\n\nAtlas South provides full-spectrum plumbing services designed to keep your building's water systems running smoothly. Whether you need emergency response at 2 AM or planned maintenance schedules, our team has the expertise and equipment to handle complex commercial plumbing challenges.\n\nWe work with healthcare trusts, shopping centres, offices, and industrial facilities — each with distinct plumbing demands. Our approach combines rapid fault diagnosis, minimal downtime, and long-term reliability.",
      "features": [
        {
          "icon": "wrench",
          "title": "Emergency response",
          "description": "Burst pipes, blocked drains, failed water heaters. We respond within 60 minutes to prevent water damage."
        },
        {
          "icon": "hammer",
          "title": "System installation",
          "description": "Design, install, and commission new plumbing systems for renovations, new builds, and facility upgrades."
        },
        {
          "icon": "zap",
          "title": "Preventative maintenance",
          "description": "Scheduled inspections, cleaning, and servicing to catch problems before they become costly failures."
        },
        {
          "icon": "shield-check",
          "title": "Compliance & certification",
          "description": "All work meets Building Regulations, Water Regulations, and industry standards. Full documentation provided."
        },
        {
          "icon": "server",
          "title": "Leak detection",
          "description": "Advanced equipment to locate hidden leaks without invasive excavation, saving time and money."
        },
        {
          "icon": "eye",
          "title": "CCTV inspections",
          "description": "Remote camera surveys of internal pipework to diagnose blockages, cracks, and structural damage."
        }
      ],
      "faqs": [
        {
          "question": "How quickly can you respond to an emergency?",
          "answer": "Our emergency response target is 60 minutes for facilities within our coverage area. Call our 24/7 hotline and we'll dispatch the nearest available engineer."
        },
        {
          "question": "Do you handle both water supply and drainage?",
          "answer": "Yes. We manage cold water, hot water (including boiler integration), waste water, and surface drainage systems across commercial buildings."
        },
        {
          "question": "What areas do you cover?",
          "answer": "We operate across 6 counties in the South. Check our service areas page for a detailed map and postcode checker."
        },
        {
          "question": "Can you work during operating hours without disrupting facilities?",
          "answer": "Absolutely. We schedule works around your business operations and use techniques like bypass pipework to maintain water supply during maintenance."
        },
        {
          "question": "Do you offer service contracts?",
          "answer": "Yes. We offer fixed-price annual maintenance packages tailored to your building size and age. This often costs less than reactive repairs alone."
        }
      ],
      "relatedServices": [
        {
          "label": "Electricals",
          "path": "/hard-services/electricals"
        }
      ]
    }
  },
  {
    "slug": "reactive-maintenance",
    "type": "service",
    "path": "/hard-services/reactive-maintenance",
    "data": {
      "title": "Reactive Maintenance",
      "icon": "hammer",
      "heroDescription": "Rapid response to unplanned breakdowns, emergency repairs, and urgent facility issues — keeping you operational 24/7",
      "overview": "Equipment fails when you least expect it. Reactive maintenance is emergency response: getting a qualified engineer on site fast, diagnosing the problem, and restoring operations. Atlas South operates 24/7 across London and the South East for exactly this reason.\n\nWe respond to call-outs from emergency repairs (broken doors, burst pipes, electrical faults) to complex multi-trade issues. A dedicated control room manages dispatch to hit response-time targets even during peak demand.",
      "features": [
        {
          "icon": "alarm-clock",
          "title": "24/7 Hotline",
          "description": "Call any time, day or night. Qualified engineers dispatched to your location within response time commitment."
        },
        {
          "icon": "hammer",
          "title": "Multi-Trade Capability",
          "description": "Plumbing, electrical, mechanical, doors/locks, and general maintenance — often resolved by one engineer without callbacks."
        },
        {
          "icon": "zap",
          "title": "Rapid Diagnosis",
          "description": "Specialist equipment and experience mean fast fault-finding, even for intermittent or complex issues."
        },
        {
          "icon": "clipboard-check",
          "title": "Documentation",
          "description": "Every call documented: photos, parts fitted, root cause analysis, preventative recommendations."
        },
        {
          "icon": "toolbox",
          "title": "Stock & Spares",
          "description": "Vans carry common parts and materials to complete repairs on first visit without material delays."
        },
        {
          "icon": "trending-down",
          "title": "Breakdown Prevention",
          "description": "After the emergency, we recommend preventative maintenance to avoid repeating the same fault."
        }
      ],
      "faqs": [
        {
          "question": "What counts as a reactive maintenance emergency?",
          "answer": "Anything affecting operations or safety: equipment failure, burst pipes, electrical faults, door locks, HVAC breakdown, etc. We respond to all call-outs equally."
        },
        {
          "question": "How much does a reactive call cost?",
          "answer": "Call-out and first hour: fixed rate. Additional labor: hourly rate. Materials at cost + markup. We provide estimates before starting work exceeding the first-hour rate."
        },
        {
          "question": "Can you start work before my approval?",
          "answer": "For safety emergencies (electrical hazard, water leak, broken security), yes — we act first and explain after. For non-urgent issues, we always get approval and cost estimate first."
        },
        {
          "question": "Is reactive maintenance covered under a maintenance contract?",
          "answer": "Depends on the contract. Some contracts bundle reactives; others separate emergency call-out costs. We can structure contracts however suits your budget and risk profile."
        },
        {
          "question": "Do you help with insurance claims for equipment damage?",
          "answer": "Yes. We document everything and provide detailed reports that help with insurer claims. Many clients have us on speed-dial specifically for claims support."
        }
      ],
      "relatedServices": [
        {
          "label": "Electricals",
          "path": "/hard-services/electricals"
        },
        {
          "label": "Plumbing",
          "path": "/hard-services/plumbing"
        }
      ]
    }
  },
  // "fire-safety" record removed 2026-08-20 — page removed at the client's request; no
  // replacement.
  {
    "slug": "facilities-management",
    "type": "service",
    "path": "/soft-services/facilities-management",
    "data": {
      "title": "Facilities Management",
      "icon": "building-2",
      "heroDescription": "Integrated facilities management combining hard services, soft services, and operational support under one contract",
      "overview": "Facilities management is the glue holding a building together—coordinating plumbing, electrical, cleaning, security, catering, and a hundred other moving parts. Rather than juggling multiple vendors, consolidate under a single facilities partner who knows your building, your people, and your operational needs.\n\nAtlas South's integrated FM model combines hard services (electrical, plumbing, maintenance) with soft services (cleaning, security, catering) in one contract, one invoice, one point of contact.",
      "features": [
        {
          "icon": "briefcase",
          "title": "Single Point of Contact",
          "description": "One account manager coordinating all building services, reducing liaison overhead and accelerating problem resolution."
        },
        {
          "icon": "chart-line",
          "title": "Integrated Planning",
          "description": "Preventative maintenance schedules coordinated across all trades to avoid conflicts and optimize engineering time."
        },
        {
          "icon": "layers",
          "title": "Hard + Soft Services",
          "description": "Combine electrical, plumbing, maintenance with cleaning, security, catering in one contract and budget."
        },
        {
          "icon": "trending-down",
          "title": "Cost Optimization",
          "description": "Consolidated purchasing and cross-trade efficiency often costs less than separate vendors."
        },
        {
          "icon": "file-check",
          "title": "Compliance & Reporting",
          "description": "Monthly performance reviews, KPI tracking, and full audit documentation for governance teams."
        },
        {
          "icon": "headphones",
          "title": "24/7 Support",
          "description": "Emergency escalation path and after-hours contact for urgent building issues."
        }
      ],
      "faqs": [
        {
          "question": "How is FM priced—fixed monthly or variable?",
          "answer": "We structure contracts both ways: fixed-price annual contracts for predictable budgeting, or hybrid (fixed base + variable reactives). Choose what suits your cost profile."
        },
        {
          "question": "Can you transition existing vendors into an integrated FM model?",
          "answer": "Yes. We work with your incumbent providers to transition services smoothly. No disruption to your operations—we plan handovers carefully."
        },
        {
          "question": "Do you manage subcontractors or bring everything in-house?",
          "answer": "We manage both. Larger scopes use our own teams; specialist services use qualified subcontractors vetted and managed by us."
        },
        {
          "question": "What happens if FM demand spikes unexpectedly?",
          "answer": "We scale up rapidly using our network of associates and subcontractors. Most spike scenarios are managed within existing contract terms."
        },
        {
          "question": "How do we measure whether FM is working?",
          "answer": "We track KPIs (response times, uptime, compliance %, tenant satisfaction) and review monthly. Transparency is built into every contract."
        }
      ],
      "relatedServices": [
        {
          "label": "Electricals",
          "path": "/hard-services/electricals"
        },
        {
          "label": "Plumbing",
          "path": "/hard-services/plumbing"
        },
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        },
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        }
      ]
    }
  },
  {
    "slug": "security",
    "type": "service",
    "path": "/soft-services/security",
    "data": {
      "title": "Security Services",
      "icon": "shield-check",
      "heroDescription": "Professional security staffing, CCTV systems, and access control tailored to your building's risk profile",
      "overview": "Security isn't one-size-fits-all. A retail centre needs different coverage than an office park; a data centre requires different protocols than a healthcare facility. Atlas South designs security solutions matching your actual risk profile, operations, and budget.\n\nWe provide everything: uniformed security officers, CCTV system design and monitoring, access control wiring and maintenance, incident response protocols, and liaison with police and insurers.",
      "features": [
        {
          "icon": "shield-check",
          "title": "Security Staffing",
          "description": "Licensed security officers for on-site patrols, gate duty, or response. SIA-accredited with vetting and insurance."
        },
        {
          "icon": "eye",
          "title": "CCTV Systems",
          "description": "Design, installation, maintenance of modern IP-based CCTV with cloud storage and mobile access."
        },
        {
          "icon": "lock",
          "title": "Access Control",
          "description": "Electronic door locks, card readers, biometric access, and audit-trail logging for sensitive areas."
        },
        {
          "icon": "radio",
          "title": "Incident Response",
          "description": "Protocols for break-ins, suspicious activity, and emergency lockdown procedures tailored to your site."
        },
        {
          "icon": "clipboard-check",
          "title": "Audit & Compliance",
          "description": "Security audit per your building classification; support for insurer and police liaison."
        },
        {
          "icon": "zap",
          "title": "Integration",
          "description": "Tie security systems into your building management—alarms, access, CCTV feeds in one dashboard."
        }
      ],
      "faqs": [
        {
          "question": "Do we need uniformed security or just CCTV?",
          "answer": "Risk assessment determines the right mix. We audit your building and recommend staffing levels balancing cost with your actual exposure."
        },
        {
          "question": "How is security staffing priced?",
          "answer": "Typically hourly rates for officers plus administrative overhead. Longer deployments (5+ days/week) get volume discounts."
        },
        {
          "question": "What happens if an incident occurs?",
          "answer": "Our officers follow incident protocols: document everything, preserve evidence, call police if required, and notify your emergency contact immediately."
        },
        {
          "question": "Can you access CCTV footage remotely?",
          "answer": "Yes. Modern IP systems support cloud storage and mobile apps. You or your security team can review footage 24/7 from anywhere."
        },
        {
          "question": "Does security tie into fire/emergency systems?",
          "answer": "Yes. We integrate access control with fire alarms and emergency procedures so lockdown happens automatically during incidents."
        }
      ],
      "relatedServices": [
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        }
      ]
    }
  },
  {
    "slug": "commercial-cleaning",
    "type": "service",
    "path": "/soft-services/commercial-cleaning",
    "data": {
      "title": "Commercial Cleaning",
      "icon": "sparkles",
      "heroDescription": "Professional daily and specialized cleaning maintaining hygiene, appearance, and compliance across all facility types",
      "overview": "Cleanliness isn't cosmetic—it affects health, morale, and first impressions. Commercial cleaning requires discipline, systems, and trained staff. Atlas South manages everything from daily office cleaning to specialized deep-cleans, specialized floor care, and post-incident biohazard cleanup.\n\nWe schedule around your operations, use industry-standard protocols and eco-friendly products, track performance with checklists and photo documentation, and respond rapidly to urgent cleanup needs.",
      "features": [
        {
          "icon": "sparkles",
          "title": "Daily Cleaning",
          "description": "Regular office, corridor, and common-area cleaning scheduled outside business hours. Customizable frequency and scope."
        },
        {
          "icon": "brush",
          "title": "Specialist Cleaning",
          "description": "Floor stripping & waxing, carpet shampooing, window cleaning, high-dusting, and deep-cleans between tenants."
        },
        {
          "icon": "shield-check",
          "title": "Hygiene & Compliance",
          "description": "Washroom servicing, hand sanitizer refills, infection control protocols for healthcare and food-prep areas."
        },
        {
          "icon": "clipboard-check",
          "title": "Quality Control",
          "description": "Daily checklists, photo documentation, and performance reviews to ensure consistent standards."
        },
        {
          "icon": "alert-circle",
          "title": "Emergency Response",
          "description": "Spill cleanup, biohazard decontamination, and post-incident deep-cleans available 24/7."
        },
        {
          "icon": "leaf",
          "title": "Eco-Friendly Options",
          "description": "Non-toxic products, waste reduction, and sustainable cleaning practices upon request."
        }
      ],
      "faqs": [
        {
          "question": "How do you schedule cleaning without disrupting work?",
          "answer": "We clean outside office hours (early morning, evening, or weekends). For occupied-hour cleans (retail, healthcare), we use quiet methods and coordinate with your team."
        },
        {
          "question": "What products do you use?",
          "answer": "Industry-standard approved products with COSHH data sheets. We also offer eco-friendly or non-toxic alternatives for sensitive environments (healthcare, nurseries, etc.)."
        },
        {
          "question": "How is cleaning priced?",
          "answer": "Fixed monthly contracts for regular cleaning; hourly rates for deep-cleans and specialist services. Volume discounts apply to multi-site contracts."
        },
        {
          "question": "Do you provide equipment or do we need to?",
          "answer": "We provide all cleaning equipment, supplies, and waste disposal. All you need is access to your building."
        },
        {
          "question": "What happens if cleaning quality drops?",
          "answer": "We track performance with checklists and photos. If you flag an issue, we investigate, re-train the team, and revisit no extra charge."
        }
      ],
      "relatedServices": [
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        }
      ]
    }
  },
  {
    "slug": "catering",
    "type": "service",
    "path": "/soft-services/catering",
    "data": {
      "title": "Catering",
      "icon": "utensils",
      "heroDescription": "On-site and contracted catering for corporate events, staff canteens, and hospitality across London and the South East",
      "overview": "Food and hospitality leave lasting impressions. Whether it's daily staff canteen services, corporate event catering, or hospitality for client meetings, excellence in catering reflects on your business. Atlas South manages kitchen operations, menus, procurement, and service to professional standards.\n\nWe work with corporate dining cultures, dietary requirements, budgets, and event scale—handling everything from menu planning to kitchen management to post-event cleanup.",
      "features": [
        {
          "icon": "utensils",
          "title": "Staff Canteen Service",
          "description": "Daily meal preparation and service for on-site staff, with flexible menu rotations and dietary accommodations."
        },
        {
          "icon": "party-popper",
          "title": "Event Catering",
          "description": "Full event catering for conferences, product launches, client entertainment, and team celebrations of any size."
        },
        {
          "icon": "leaf",
          "title": "Dietary & Allergen Support",
          "description": "Vegan, vegetarian, gluten-free, halal, kosher, and allergen-aware menus tailored to your population."
        },
        {
          "icon": "chef-hat",
          "title": "Menu Planning",
          "description": "Seasonal menus, nutritional balance, and culinary variety designed with your team or event theme in mind."
        },
        {
          "icon": "package",
          "title": "Procurement & Stock",
          "description": "Sourcing, supplier relationships, and kitchen stock management to control costs and reduce waste."
        },
        {
          "icon": "briefcase",
          "title": "Hospitality & Service",
          "description": "Professional service for VIP events, client entertainment, and high-touch hospitality scenarios."
        }
      ],
      "faqs": [
        {
          "question": "Can you handle dietary restrictions and allergies?",
          "answer": "Yes, absolutely. We maintain separate preparation areas, ingredient tracking, and service protocols for allergen-free and dietary-specific menus."
        },
        {
          "question": "How is catering priced?",
          "answer": "Staff canteen: monthly contract based on headcount and service levels. Event catering: per-head pricing based on menu and service style."
        },
        {
          "question": "Do you manage the kitchen facilities or supply your own?",
          "answer": "We can use your existing kitchen with our staff, or bring mobile catering units for events. Depends on your facilities and the scope."
        },
        {
          "question": "Can you adjust menus seasonally or for preferences?",
          "answer": "Yes. We rotate menus quarterly, gather feedback from staff, and adjust based on popular items and seasonal ingredients."
        },
        {
          "question": "What if an event needs last-minute changes?",
          "answer": "We accommodate menu adjustments, guest-count changes, and timing shifts up to 24 hours before. Last-minute changes incur a small surcharge."
        }
      ],
      "relatedServices": [
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        }
      ]
    }
  },
  {
    "slug": "aviation",
    "type": "service",
    "path": "/soft-services/aviation",
    "data": {
      "title": "Aviation & Airfield Facilities",
      "icon": "plane",
      "heroDescription": "Facility cleaning, technical maintenance, compliance-driven hygiene and ground support servicing for terminals, hangars, MRO facilities and corporate aviation — engineered around your operational windows, not around ours.",
      "overview": "Aviation doesn't tolerate a delayed turnaround. Every hour a hangar bay, gate area or MRO facility is out of service has a cost. Our aviation offering is built around the industry's own constraints — tight windows, strict compliance, and zero tolerance for disruption.\n\nFacility servicing is scheduled around flight operations, curfews and shift changeovers — early mornings, overnight, and between-flight windows — so aircraft, gates and hangars stay operational. Cleaning and maintenance protocols are built around aviation hygiene, biosecurity and safety-critical facility standards, with documentation ready for audit at any time. Cleaning, technical maintenance and ground support area servicing run under a single point of contact and a single schedule — fewer contractors on-site, less coordination overhead for your operations team.",
      "features": [
        {
          "icon": "spray-can",
          "title": "Facility Cleaning: Terminal & Hangar Cleaning",
          "description": "High-standard cleaning for spaces where dust, debris and contamination are operational risks — hangar floors, bays and MRO work areas; terminal, lounge and gate area cleaning; deep cleans around scheduled maintenance checks; out-of-hours and overnight scheduling."
        },
        {
          "icon": "wrench",
          "title": "Technical Maintenance: Building & Systems Upkeep",
          "description": "Ongoing technical maintenance that keeps facility infrastructure reliable around continuous aviation operations — HVAC, lighting and electrical upkeep; planned preventative maintenance schedules; facility fabric and fixture repairs; rapid-response callouts for operational areas."
        },
        {
          "icon": "shield-check",
          "title": "Compliance-Driven Cleaning: Regulatory & Hygiene Standards",
          "description": "Cleaning protocols mapped to the hygiene, biosecurity and safety documentation aviation sites are audited against — protocols aligned to aviation hygiene standards, biosecurity-conscious procedures, full audit-ready documentation and reporting, COSHH-compliant materials handling."
        },
        {
          "icon": "plane",
          "title": "Ground Support Services: Apron & Ground Area Servicing",
          "description": "Facility-level support for ground operations areas, keeping ground support zones clean, maintained and ready — equipment storage area servicing, apron-adjacent facility cleaning and upkeep, staff welfare and ground crew facility maintenance, coordinated scheduling around flight rotations."
        }
      ],
      "faqs": [],
      "relatedServices": [
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        },
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        }
      ]
    }
  },
  {
    "slug": "concierge",
    "type": "service",
    "path": "/soft-services/concierge",
    "data": {
      "title": "Concierge Services",
      "icon": "user-check",
      "heroDescription": "Professional visitor management, reception, and hospitality services enhancing your building's first impression and operational flow",
      "overview": "Your building's first line of contact shapes every visitor's experience. Professional concierge and reception services require training, judgment, and attention to detail. Atlas South manages reception desks, visitor screening, package handling, and white-glove hospitality services that reflect positively on your organization.\n\nWe handle everything from day-to-day visitor check-in to VIP reception, package coordination, and liaison with tenants—allowing your team to focus on core business.",
      "features": [
        {
          "icon": "user-check",
          "title": "Reception & Visitor Management",
          "description": "Professional reception staff managing visitor sign-in, badge issuance, access control, and direction."
        },
        {
          "icon": "package",
          "title": "Package & Parcel Handling",
          "description": "Receiving, logging, storage, and delivery of parcels and mail to tenants with secure handling protocols."
        },
        {
          "icon": "phone",
          "title": "Multi-Line Switchboard",
          "description": "Professional telephone answering, message taking, and call routing to tenants and departments."
        },
        {
          "icon": "briefcase",
          "title": "VIP & Executive Hospitality",
          "description": "Premium greeting services, beverage service, and white-glove hospitality for VIP visits and client entertainment."
        },
        {
          "icon": "clipboard-check",
          "title": "Building Coordination",
          "description": "Vendor management, delivery coordination, access scheduling, and event liaison."
        },
        {
          "icon": "smile",
          "title": "Professional Appearance",
          "description": "Uniformed staff trained in corporate etiquette, multi-language support, and professional interpersonal skills."
        }
      ],
      "faqs": [
        {
          "question": "Can concierge staff represent our brand values?",
          "answer": "Absolutely. We hire and train staff to embody professionalism and reflect your brand tone. Uniforms, greeting standards, and service protocols are customized to your building culture."
        },
        {
          "question": "Do you offer multi-language support?",
          "answer": "Yes. Our London and South East team includes multi-lingual staff. We can arrange language support for regular or event-based needs."
        },
        {
          "question": "How is concierge service priced?",
          "answer": "Based on desk hours (full-time 24/7, business hours, or evening/weekend coverage) and scope of services. Premium VIP services have additional fees."
        },
        {
          "question": "Can you handle package delivery volume surges?",
          "answer": "Yes. We scale storage and handling during peak holiday periods and can implement surge protocols if delivery volume increases."
        },
        {
          "question": "What if a situation requires judgment calls?",
          "answer": "Our staff are trained in visitor safety assessment, problem-solving, and escalation procedures. Sensitive situations are escalated to your security or management immediately."
        }
      ],
      "relatedServices": [
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        },
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        }
      ]
    }
  },
  // "waste-recycling" record removed 2026-08-20 — replaced in the Soft Services nav slot
  // by "parking-lot-management" (see that record further down, moved here from Industries).
  {
    "slug": "corporate",
    "type": "industry",
    "path": "/industries/corporate",
    "data": {
      "title": "Corporate",
      "icon": "briefcase",
      "heroDescription": "Multi-site compliance, predictable costs, and responsive support for enterprise building management",
      "overview": "Corporate headquarters and multi-site office portfolios demand building services that don't just react to problems — they anticipate them. Your facilities underpin business continuity, employee safety, and regulatory compliance across often-complex estate profiles.\n\nAtlas South has supported corporate clients from FTSE-listed firms to growth-stage tech companies, managing everything from routine maintenance schedules to emergency response coordination across multiple buildings, often across multiple regions.",
      "challenges": "- **Spread-out sites:** Managing 5, 10, or 50+ sites means coordinating maintenance, compliance, and emergency response across locations — without creating a procurement nightmare.\n- **Regulatory weight:** Health & Safety, Fire Safety, electrical testing, water safety — the compliance calendar never stops. A missed inspection or certification lapse carries real liability.\n- **Cost control:** Building services budgets need predictability and visibility. Reactive repairs eat contingency; poor preventative planning wastes money.\n- **Tenant/employee safety:** Any service failure is not just a cost — it affects day-to-day operations and employee experience.\n- **Partner coordination:** Juggling multiple service providers across sites creates coordination overhead and the risk of gaps where \"we thought the other vendor was handling that.\"",
      "ourApproach": "We consolidate your building services under a single partner, reducing the overhead of managing multiple vendors. For corporate clients, we typically structure a combination of:\n\n- **Preventative maintenance contracts** with fixed annual costs and clearly scheduled works, so you know what to budget and what's covered.\n- **24/7 emergency response** for unplanned breakdowns — one call, one dispatcher, engineers deployed to whichever site needs them.\n- **Compliance management** where we track, schedule, and execute all inspections and certifications, and provide you with a live audit trail for your own compliance reporting.\n- **On-site liaison** — for larger estates, a dedicated point of contact who knows your sites, your people, and your operational constraints.\n\nThis model works across Hard Services (electrical, plumbing, reactive maintenance, fire safety) and Soft Services (facilities management, security coordination, catering support) — consolidating procurement and improving response times.",
      "serviceHighlights": [
        {
          "serviceLabel": "Facilities Management",
          "description": "Integrated hard and soft services under one contract, with predictable budgets and scheduled maintenance reducing downtime and reactive costs."
        },
        {
          "serviceLabel": "Compliance & Certifications",
          "description": "Fire safety, electrical testing, water safety, H&S audits — all scheduled, executed, and documented for your own compliance reporting."
        },
        {
          "serviceLabel": "Emergency Response",
          "description": "24/7 hotline with engineers dispatched to any of your sites within our response-time commitment, keeping your operations running."
        },
        {
          "serviceLabel": "Security & Safety",
          "description": "Coordination with your internal security teams and integration of our security services across your site portfolio."
        },
        {
          "serviceLabel": "Cost Visibility",
          "description": "Monthly or quarterly reporting on spend, trends, and preventative work completed — helping you forecast and optimize building services budgets."
        },
        {
          "serviceLabel": "Site Handover Support",
          "description": "New build or lease assumption? We handle the fit-out services, compliance audit, and full documentation handover."
        }
      ],
      "relatedServices": [
        {
          "label": "Electricals",
          "path": "/hard-services/electricals"
        },
        {
          "label": "Plumbing",
          "path": "/hard-services/plumbing"
        },
        {
          "label": "Reactive Maintenance",
          "path": "/hard-services/reactive-maintenance"
        },
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        }
      ]
    }
  },
  {
    "slug": "healthcare",
    "type": "industry",
    "path": "/industries/healthcare",
    "data": {
      "title": "Healthcare",
      "icon": "cross",
      "heroDescription": "Infection-control-conscious cleaning and facilities management for clinical and non-clinical healthcare spaces, with protocols built to protect patients, staff and visitors while keeping disruption to care to a minimum.",
      "overview": "Cleaning protocols are built around infection prevention and control principles, with clear separation between clinical and non-clinical area procedures. Servicing is scheduled around ward routines, patient turnover and clinical activity, so care is never interrupted by facilities work.\n\nDocumentation and reporting are kept to the standard healthcare settings are expected to evidence at any time, and teams working in patient-facing environments are trained to work quietly, respectfully and with awareness of the setting.",
      "challenges": "- **Infection control comes first:** Cleaning protocols are built around infection prevention and control principles, with clear separation between clinical and non-clinical area procedures.\n- **Minimal disruption to patient care:** Servicing is scheduled around ward routines, patient turnover and clinical activity, so care is never interrupted by facilities work.\n- **Hygiene standards ready for inspection:** Documentation and reporting are kept to the standard healthcare settings are expected to evidence at any time.\n- **Discretion and professionalism as standard:** Teams working in patient-facing environments are trained to work quietly, respectfully and with awareness of the setting.",
      "ourApproach": "Servicing is scheduled around clinical activity, not the other way around:\n\n- **Clinical and non-clinical area cleaning**, kept to their own separate procedures.\n- **Infection-control-aligned cleaning protocols**, built around infection prevention and control principles.\n- **Ward turnaround and deep cleaning**, scheduled around patient turnover and clinical activity.\n- **Hygiene compliance documentation & reporting**, kept ready for inspection at any time.\n- **Facilities maintenance for healthcare buildings**, coordinated the same discreet way as cleaning.",
      "serviceHighlights": [
        {
          "serviceLabel": "Clinical & Non-Clinical Area Cleaning",
          "description": "Cleaning kept to its own separate procedure for clinical versus non-clinical areas, aligned to infection prevention and control principles."
        },
        {
          "serviceLabel": "Ward Turnaround & Deep Cleaning",
          "description": "Scheduled around patient turnover and clinical activity, so servicing never interrupts care."
        },
        {
          "serviceLabel": "Hygiene Compliance Documentation",
          "description": "Documentation and reporting kept to the standard healthcare settings are expected to evidence at any time."
        },
        {
          "serviceLabel": "Facilities Maintenance",
          "description": "Maintenance for healthcare buildings, coordinated around clinical schedules rather than imposed on them."
        }
      ],
      "relatedServices": [
        {
          "label": "Electricals",
          "path": "/hard-services/electricals"
        },
        {
          "label": "Plumbing",
          "path": "/hard-services/plumbing"
        },
        {
          "label": "Reactive Maintenance",
          "path": "/hard-services/reactive-maintenance"
        },
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        },
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        }
      ]
    }
  },
  {
    "slug": "retail",
    "type": "industry",
    "path": "/industries/retail",
    "data": {
      "title": "Retail",
      "icon": "shopping-bag",
      "heroDescription": "Keep customer-facing spaces operational, safe, and compliant while managing costs across multi-unit estates",
      "overview": "Retail centres, flagship stores, and distributed retail chains share one overriding constraint: the building must be ready to serve customers every day the doors are open. A fire alarm fault, a water leak, or broken HVAC isn't just a maintenance issue — it's lost trading hours, customer experience damage, and potential evacuation.\n\nAtlas South has managed retail estates ranging from single high-street stores to multi-unit regional portfolios, coordinating maintenance schedules around trading hours and tenant requirements.",
      "challenges": "- **Trading hours constraints:** Most retail works must happen outside opening hours, creating a tight scheduling window and premium rates for any emergency overnight call.\n- **Multi-tenant coordination:** If the building houses independent retailers, each has its own lease terms, insurance, and operational priorities — plus the landlord's broader infrastructure to manage.\n- **Customer safety liability:** High footfall means high risk exposure. Any service failure affecting customer safety (trips, electrical hazards, fire safety) creates immediate liability and reputational risk.\n- **Energy efficiency:** Retail spaces run heating, cooling, and lighting for long hours. A poorly maintained HVAC or lighting system drains profitability fast.\n- **Specialist areas:** Retail chains often require food prep facilities, cold storage, secure areas, and specialist flooring — all with specific maintenance and compliance requirements.",
      "ourApproach": "We structure retail support around the trading calendar, not against it:\n\n- **Trading-hours aware scheduling:** Maintenance and inspections are coordinated outside opening hours, with weekend or overnight works available for time-critical issues.\n- **Multi-site coordination:** Manage one portfolio across multiple locations with a single point of contact, reducing the overhead of coordinating with separate vendors per unit.\n- **Tenant liaison:** For managed centres, we coordinate with tenant teams, manage insurance handovers, and handle the logistical complexity of working in occupied retail environments.\n- **Compliance & safety:** Fire safety, electrical testing, and Health & Safety inspections stay on schedule, reducing liability exposure.\n- **Cost optimization:** Preventative maintenance on HVAC, lighting, and water systems reduces emergency call-outs and keeps energy bills predictable.",
      "serviceHighlights": [
        {
          "serviceLabel": "Out-of-Hours Maintenance",
          "description": "Scheduled works outside trading hours, with emergency response available overnight and weekends for critical issues."
        },
        {
          "serviceLabel": "Multi-Unit Portfolio Management",
          "description": "Single point of contact and coordination across multiple retail locations, reducing procurement overhead and improving response times."
        },
        {
          "serviceLabel": "Compliance & Inspections",
          "description": "Fire safety, electrical testing, gas safety, water systems — all scheduled and documented without disrupting customer experience."
        },
        {
          "serviceLabel": "Energy Efficiency",
          "description": "HVAC optimization, lighting controls, and preventative maintenance to keep energy costs down across the estate."
        },
        {
          "serviceLabel": "Cleaning & Hygiene",
          "description": "Deep cleaning, post-incident remediation, and health & safety compliance cleaning for food/beverage areas."
        },
        {
          "serviceLabel": "Security Integration",
          "description": "Coordination with retail security systems, access control, and CCTV integration across your sites."
        }
      ],
      "relatedServices": [
        {
          "label": "Electricals",
          "path": "/hard-services/electricals"
        },
        {
          "label": "Plumbing",
          "path": "/hard-services/plumbing"
        },
        {
          "label": "Reactive Maintenance",
          "path": "/hard-services/reactive-maintenance"
        },
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        },
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        }
      ]
    }
  },
  {
    "slug": "education",
    "type": "industry",
    "path": "/industries/education",
    "data": {
      "title": "Education & Learning Institutions",
      "icon": "graduation-cap",
      "heroDescription": "Cleaning and facilities management for schools, colleges and training environments, keeping learning spaces safe, well-kept and ready — scheduled around term time and daily site occupancy.",
      "overview": "Servicing runs around term time, holiday periods and daily occupancy, so classrooms and communal spaces are ready without disrupting learning. Staff working in education environments are prepared for the safeguarding expectations that come with working around students of all ages.\n\nClassrooms, canteens, washrooms and communal areas are cleaned to standards that hold up under heavy daily use, and ongoing maintenance support helps keep older school and college buildings safe, functional and well presented.",
      "challenges": "- **Scheduled around the school day:** Servicing runs around term time, holiday periods and daily occupancy, so classrooms and communal spaces are ready without disrupting learning.\n- **Safeguarding-aware personnel:** Staff working in education environments are prepared for the safeguarding expectations that come with working around students of all ages.\n- **High-footfall hygiene standards:** Classrooms, canteens, washrooms and communal areas are cleaned to standards that hold up under heavy daily use.\n- **Facilities upkeep for ageing estates:** Ongoing maintenance support helps keep older school and college buildings safe, functional and well presented.",
      "ourApproach": "Servicing is scheduled around the academic calendar, not the other way around:\n\n- **Classroom, canteen & communal area cleaning**, kept to a standard that holds up under heavy daily use.\n- **Term-time and holiday deep cleaning programmes**, timed to site occupancy rather than a fixed weekly round.\n- **Washroom & high-footfall hygiene servicing**, across the areas students and staff use most.\n- **Facilities maintenance for education buildings**, including support for ageing estates.\n- **Health & safety compliance support**, documented to the standard the institution needs.",
      "serviceHighlights": [
        {
          "serviceLabel": "Term-Time & Holiday Cleaning",
          "description": "Deep cleaning programmes timed to term time, holiday periods and daily site occupancy."
        },
        {
          "serviceLabel": "Classroom & Communal Area Cleaning",
          "description": "Classrooms, canteens and communal areas cleaned to a standard that holds up under heavy daily use."
        },
        {
          "serviceLabel": "Safeguarding-Aware Personnel",
          "description": "Staff prepared for the safeguarding expectations that come with working around students of all ages."
        },
        {
          "serviceLabel": "Facilities Maintenance",
          "description": "Ongoing maintenance support for education buildings, including ageing estates."
        }
      ],
      "relatedServices": [
        {
          "label": "Electricals",
          "path": "/hard-services/electricals"
        },
        {
          "label": "Plumbing",
          "path": "/hard-services/plumbing"
        },
        {
          "label": "Reactive Maintenance",
          "path": "/hard-services/reactive-maintenance"
        },
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        },
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        }
      ]
    }
  },
  {
    "slug": "central-london",
    "type": "area",
    "path": "/areas/central-london",
    "data": {
      "title": "Central London",
      "icon": "map-pin",
      "heroDescription": "Premium facilities management and emergency response across London's high-value office, retail, and hospitality districts",
      "overview": "Central London's dense commercial landscape demands responsive, reliable building services. From the West End to the City, high-street retail to corporate headquarters, facilities downtime isn't just costly — it's reputationally damaging.\n\nAtlas South maintains rapid dispatch across Westminster, the City of London, Southwark, and Lambeth, with engineers stationed to hit response time targets in central areas where every minute counts.",
      "responseTime": "30 minutes for critical infrastructure failures in central postcodes (within M25)",
      "coverage": "- **West End & Theatreland:** Soho, Leicester Square, Covent Garden — high-footfall venues with demanding compliance schedules.\n- **Financial District (City):** EC postcodes — mission-critical systems, 24/7 operations, strict regulatory oversight.\n- **South Bank & Southwark:** SE1 and adjacent areas — mixed-use developments, cultural venues, hospitality.\n- **Westminster & Lambeth:** Government, legal, healthcare, and institutional facilities with complex compliance profiles.\n- **Central ancillary areas:** Camden, Islington (N postcodes), and the fringes of central coverage — served by standing engineers with slightly extended response times (40–45 min).",
      "localProof": "Over 200 active central London clients rely on Atlas South, from boutique law firms and financial services to multi-site retail chains and hospitality groups. We maintain a live presence in central areas year-round, handling the peaks of summer tourism, Christmas retail demand, and the operational intensity of London's financial markets."
    }
  },
  {
    "slug": "south-east-london",
    "type": "area",
    "path": "/areas/south-east-london",
    "data": {
      "title": "South East London",
      "icon": "map-pin",
      "heroDescription": "Comprehensive facilities management for growing South East London estates, from Lewisham to Crystal Palace to Croydon",
      "overview": "South East London is a mixed-use commercial landscape with rapidly expanding office space, established retail districts, and light industrial zones. Estates here are often larger and more distributed than central areas, requiring coordinated multi-site management and flexible scheduling.\n\nAtlas South operates across SE London with a network of engineers capable of handling everything from emergency response to planned preventative maintenance at competitive rates that reflect the area's market conditions.",
      "responseTime": "40 minutes for emergency call-outs across SE London postcodes (SE1–SE28)",
      "coverage": "- **Lewisham & Deptford:** SE8, SE13, SE14 — mixed commercial and retail estates with growing office conversion projects.\n- **Southwark edge & Elephant & Castle:** SE17 — rapidly gentrifying area with new commercial development and compliance-heavy estates.\n- **Camberwell & Peckham:** SE15, SE5 — light industrial, creative studios, small commercial tenants with cost-conscious FM needs.\n- **Bermondsey & Canada Water:** SE16, SE18 — larger commercial estates, warehouses, and logistics facilities with 24/7 operations.\n- **Crystal Palace, Dulwich & surrounding:** SE19, SE21, SE26 — suburban mixed-use and medium-sized office buildings with longer response times (50 min).\n- **Croydon fringe:** South SE edge of London coverage — coordinated with full Croydon/Surrey capability.",
      "localProof": "Over 150 SE London clients depend on Atlas South, including logistics operators, growing tech/creative companies, retail chains, and NHS facilities. We've grown significantly in the area over the past 3 years as South East London development accelerates."
    }
  },
  {
    "slug": "north-london",
    "type": "area",
    "path": "/areas/north-london",
    "data": {
      "title": "North London",
      "icon": "map-pin",
      "heroDescription": "Responsive facilities management across North London's diverse commercial and institutional landscape, from King's Cross to Barnet",
      "overview": "North London spans from the dense mixed-use redevelopment zones around King's Cross and Islington through to suburban and light industrial areas in Barnet, Enfield, and Haringey. The area combines high-value central properties, growing mid-market office space, healthcare and educational institutions, and light industrial/logistics facilities.\n\nAtlas South serves North London with dedicated coverage, leveraging our central London expertise in the inner boroughs and expanding capability in outer areas as demand for professional FM grows.",
      "responseTime": "35 minutes for inner North London (N1–N8); 45 minutes for outer areas (N9–N22)",
      "coverage": "- **King's Cross & St Pancras:** N1, WC1H — high-value mixed-use development with offices, retail, hospitality, and strict scheduling constraints.\n- **Islington & Finsbury:** N1, EC1, N5 — established commercial core with boutique offices, creative studios, and hospitality venues.\n- **Hackney & Shoreditch:** N1, E2, E8 — creative industries, tech companies, mixed-use developments with cost-sensitive FM budgets.\n- **Holloway & Archway:** N7, N19 — small commercial units with medium-sized office/retail conversions.\n- **Finchley, Barnet & Enfield:** N3, N10, N12, EN postcodes — suburban office parks, logistics facilities, retail chains with extended response times.\n- **Waltham Forest edge:** E4, E17 — light industrial and growing mixed-use development.",
      "localProof": "Over 120 North London clients include healthcare trusts, educational institutions, logistics operators, and corporate offices. We've built deep relationships across both inner and outer North London, from high-touch central services to cost-optimized suburban facilities contracts."
    }
  },
  {
    "slug": "east-london",
    "type": "area",
    "path": "/areas/east-london",
    "data": {
      "title": "East London",
      "icon": "map-pin",
      "heroDescription": "Facilities management and emergency response across East London's industrial, logistics, and emerging commercial zones",
      "overview": "East London combines established light industrial and logistics hubs with rapidly emerging mixed-use development zones. The area is home to data centres, logistics operators, established commercial tenants, and newer office/retail developments—each with distinct FM requirements and operational patterns.\n\nAtlas South operates across East London with expertise in both industrial-scale facility management and the newer commercial developments reshaping the area's commercial profile.",
      "responseTime": "40 minutes for emergency call-outs across East London postcodes (E1–E18)",
      "coverage": "- **Tower Hamlets (Whitechapel, Bethnal Green, Mile End):** E1, E2, E3 — mixed commercial, retail, offices, and light industrial with strong cultural/creative sector presence.\n- **Bow, Stratford & Olympic Zone:** E3, E15, E16, E20 — mixed-use development hubs with offices, retail, and large commercial estates.\n- **Newham (East Ham, Upton Park):** E6, E7, E12, E13 — established light industrial, retail, and logistics with suburban growth.\n- **Waltham Forest (Walthamstow, Leyton):** E4, E10, E11, E17 — light industrial, retail chains, small commercial tenants with cost-focused FM needs.\n- **Barking & Dagenham:** E6, RM9, RM10 — logistics, warehouses, and industrial facilities with larger footprints and extended response times (50 min).\n- **Hackney Wick & Olympic Park periphery:** E9, E15 — emerging creative and commercial zones with mixed-use demands.",
      "localProof": "Over 180 East London clients depend on Atlas South, including logistics operators, data centre facilities, retail chains, and mixed-use developers. East London is one of our fastest-growing coverage areas as commercial development and logistics demand accelerate."
    }
  },
  {
    "slug": "west-london",
    "type": "area",
    "path": "/areas/west-london",
    "data": {
      "title": "West London",
      "icon": "map-pin",
      "heroDescription": "Premium and responsive facilities management across West London's high-value retail, corporate, and institutional districts",
      "overview": "West London spans high-value retail districts, corporate headquarters, hospitality venues, and healthcare institutions. The area combines central premium services demand with suburban facility management, and includes major commercial hubs and light industrial areas.\n\nAtlas South serves West London with dedicated coverage and premium service delivery tailored to the area's high-value commercial and institutional clients.",
      "responseTime": "35 minutes for inner West London (W1–W12); 45 minutes for outer areas (W13–W14, including Ealing)",
      "coverage": "- **Knightsbridge, Kensington, Chelsea:** SW1, SW3, SW5, SW7 — high-end retail, embassies, and institutional facilities with white-glove service expectations.\n- **Mayfair, Belgravia, Pimlico:** SW1, W1 — premium offices and boutique retail with strict compliance and scheduling.\n- **South Kensington & Natural History:** SW7, SW5 — museums, educational institutions, mixed commercial.\n- **Hammersmith & Fulham:** W6, W12, SW6 — established commercial hub with offices, retail, creative studios, and riverside facilities.\n- **Ealing & Acton:** W3, W5, W13, W14 — suburban offices, retail chains, mixed-use developments with medium-sized FM contracts.\n- **Brentford & Richmond fringe:** TW8, TW9, TW10 — light industrial, logistics, and suburban commercial.",
      "localProof": "Over 200 West London clients include luxury retail chains, premium office buildings, hospitality groups, educational institutions, and healthcare trusts. We maintain a dedicated presence serving West London's high-value commercial market with premium responsiveness and tailored service delivery."
    }
  },
  {
    "slug": "surrey-kent",
    "type": "area",
    "path": "/areas/surrey-kent",
    "data": {
      "title": "Surrey & Kent",
      "icon": "map-pin",
      "heroDescription": "Facilities management and emergency response across Surrey and Kent, serving corporate headquarters, light industrial estates, and suburban facilities",
      "overview": "Surrey and Kent represent Atlas South's geographic expansion beyond London's core, serving the extensive commuter belt and regional commercial hubs. The areas include corporate headquarters relocations, business parks, light industrial zones, and logistics facilities—often with larger footprints and lower service density than central London.\n\nAtlas South operates across Surrey and Kent with experienced engineers and regional coordination, delivering cost-effective preventative maintenance and responsive emergency support to a growing regional client base.",
      "responseTime": "60 minutes for emergency call-outs across Surrey and Kent (postcodes CR, RH, TW, KT, DA, BR, ME, TN)",
      "coverage": "- **Croydon & South Croydon:** CR0, CR2 — major commercial hub with corporate offices, retail, and light industrial. Often the first point of contact for Surrey-wide clients.\n- **Surrey Hills & Epsom:** RH1–5, KT17–19 — business parks, corporate facilities, and light industrial estates with preventative maintenance focus.\n- **Guildford & Woking:** GU1–3, GU21–22 — major business park regions with large corporate campuses and logistics facilities.\n- **Kent East (Dartford, Erith):** DA1–9, BR4–5, BR7–8 — light industrial, logistics, and commercial estates. Extended response times (70+ min) depending on location.\n- **Kent Central (Maidstone, Sevenoaks):** ME, TN1–3 — regional business parks, light industrial, and suburban commercial.\n- **Kent Coastal Fringe:** CT, TN — limited coverage for established clients; coordinated with regional partners.",
      "localProof": "Over 90 Surrey and Kent clients rely on Atlas South for regional facilities management, ranging from single-site business park operators to multi-location corporate FM contracts. We've built regional expertise through partnerships with local specialists and direct hiring in key hubs like Croydon and Guildford."
    }
  },
  {
    "slug": "government-public-sector",
    "type": "industry",
    "path": "/industries/government-public-sector",
    "data": {
      "title": "Government & Public Sector",
      "icon": "landmark",
      "heroDescription": "Cleaning and facilities management for government offices, civic buildings and public sector sites — built around compliance, vetted personnel, and the standard of upkeep the public expects from its institutions.",
      "overview": "Government and public sector contracts are held to a documented standard. Our cleaning and facilities protocols are built with compliance, health & safety records, and audit-ready reporting as the baseline, not an extra.\n\nStaff working in government offices, civic buildings and public-facing sites are prepared for the vetting, conduct and security expectations these environments require — because council offices, courts, libraries and civic buildings are judged on their upkeep, and a clean, well-maintained public building reflects directly on the institution behind it.",
      "challenges": "- **Procurement-ready, compliance-first:** Government and public sector contracts are held to a documented standard — compliance, health & safety records and audit-ready reporting are the baseline, not an extra.\n- **Vetted personnel for public buildings:** Staff working in government offices, civic buildings and public-facing sites are prepared for the vetting, conduct and security expectations these environments require.\n- **Public trust is on the line:** Council offices, courts, libraries and civic buildings are judged on their upkeep. A clean, well-maintained public building reflects directly on the institution behind it.\n- **Continuity across long-term contracts:** Public sector work runs on service continuity. One point of contact, consistent teams and a single schedule reduce risk across multi-year facilities contracts.",
      "ourApproach": "We build every public sector contract around procurement's own expectations, not around a standard commercial scope adapted afterward:\n\n- **Office & civic building cleaning**, including public-facing area and reception cleaning kept to the presentation standard a visitor-facing institution needs.\n- **Compliance-driven cleaning protocols**, with health & safety compliance documentation ready for audit at any time.\n- **Planned preventative facilities maintenance**, scheduled around the site rather than disrupting it.\n- **Vetted, security-conscious personnel**, prepared for the access and conduct expectations of council offices, courts, libraries and civic buildings.\n- **Out-of-hours and scheduled servicing**, plus multi-site contract management for local authorities running several sites under one contract.",
      "serviceHighlights": [
        {
          "serviceLabel": "Office & Civic Building Cleaning",
          "description": "Office and public-facing area cleaning, including reception spaces, kept to the presentation standard a public institution is judged on."
        },
        {
          "serviceLabel": "Compliance-Driven Protocols",
          "description": "Cleaning protocols built with health & safety compliance documentation as the baseline, ready for procurement audit at any time."
        },
        {
          "serviceLabel": "Planned Preventative Maintenance",
          "description": "Facilities maintenance scheduled around the site's own operations rather than imposed on it."
        },
        {
          "serviceLabel": "Vetted, Security-Conscious Personnel",
          "description": "Staff prepared for the vetting, conduct and security expectations of council offices, courts, libraries and civic buildings."
        },
        {
          "serviceLabel": "Multi-Site Contract Management",
          "description": "One point of contact and a single schedule across multi-year, multi-site local authority contracts."
        }
      ],
      "relatedServices": [
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        },
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        }
      ]
    }
  },
  {
    "slug": "oil-gas",
    "type": "industry",
    "path": "/industries/oil-gas",
    "data": {
      "title": "Oil & Gas",
      "icon": "flame-kindling",
      "heroDescription": "Cleaning and facilities management for oil and gas operational sites, control rooms and office facilities — built around COSHH compliance, site safety inductions, and round-the-clock operational schedules.",
      "overview": "Teams working on or near operational sites are trained in COSHH-compliant materials handling, so cleaning never becomes a site safety liability. Staff are prepared for site inductions, PPE requirements and access controls before ever stepping on-site.\n\nSites that run continuous shifts need servicing that fits around them — including night and weekend coverage without disrupting operations — with cleaning and facilities records kept audit-ready, in line with the health & safety documentation oil and gas sites are held to.",
      "challenges": "- **Hazardous-materials awareness as standard:** Teams working on or near operational sites are trained in COSHH-compliant materials handling, so cleaning never becomes a site safety liability.\n- **Site induction and access-controlled personnel:** Staff are prepared for site inductions, PPE requirements and access controls before ever stepping on-site.\n- **Round-the-clock scheduling:** Sites that run continuous shifts need servicing that fits around them — including night and weekend coverage without disrupting operations.\n- **Compliance documentation on demand:** Cleaning and facilities records are kept audit-ready, in line with the health & safety documentation oil and gas sites are held to.",
      "ourApproach": "Servicing is built to work inside a site's existing safety culture, not alongside it:\n\n- **Operational and office facility cleaning**, plus control room and site facility upkeep.\n- **COSHH-compliant materials handling** as standard practice, not a special request.\n- **Planned preventative maintenance** for site facilities, coordinated with operational schedules.\n- **Shift-pattern and 24/7 scheduling**, so servicing runs around continuous operations rather than against them.\n- **Health & safety compliance documentation**, kept audit-ready for the standard onshore sites are held to.",
      "serviceHighlights": [
        {
          "serviceLabel": "Operational & Office Facility Cleaning",
          "description": "Cleaning across operational areas, control rooms and office facilities, coordinated with site operations."
        },
        {
          "serviceLabel": "COSHH-Compliant Materials Handling",
          "description": "Materials handling trained and documented to COSHH compliance, so cleaning is never a site safety liability."
        },
        {
          "serviceLabel": "Planned Preventative Maintenance",
          "description": "Maintenance for site facilities scheduled to avoid disruption to continuous operations."
        },
        {
          "serviceLabel": "Shift-Pattern & 24/7 Scheduling",
          "description": "Night and weekend coverage built around continuous-shift operations, not office hours."
        },
        {
          "serviceLabel": "Compliance Documentation",
          "description": "Health & safety records kept audit-ready, in line with the documentation oil and gas sites are held to."
        }
      ],
      "relatedServices": [
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Reactive Maintenance",
          "path": "/hard-services/reactive-maintenance"
        },
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        }
      ]
    }
  },
  {
    "slug": "manufacturing",
    "type": "industry",
    "path": "/industries/manufacturing",
    "data": {
      "title": "Manufacturing",
      "icon": "factory",
      "heroDescription": "Facility cleaning and maintenance for production floors, warehousing and office areas, scheduled to protect throughput while maintaining the housekeeping and safety standards manufacturing sites are held to.",
      "overview": "Cleaning and maintenance are scheduled around downtime windows and shift changeovers, so servicing never slows the line. Clean, well-organised floors and walkways reduce workplace hazards — housekeeping is treated as part of site safety, not separate from it.\n\nCleaning near production and QA-sensitive areas is handled with awareness of contamination risk and material compatibility, with production floor, warehouse and office cleaning and maintenance running under a single schedule and point of contact.",
      "challenges": "- **Production keeps running:** Cleaning and maintenance are scheduled around downtime windows and shift changeovers, so servicing never slows the line.\n- **Housekeeping as a safety standard:** Clean, well-organised floors and walkways reduce workplace hazards — housekeeping is treated as part of site safety, not separate from it.\n- **Contamination-conscious cleaning:** Cleaning near production and QA-sensitive areas is handled with awareness of contamination risk and material compatibility.\n- **One contract across the whole site:** Production floor, warehouse and office cleaning and maintenance run under a single schedule and point of contact.",
      "ourApproach": "Servicing is scheduled to protect throughput first:\n\n- **Production floor & warehouse cleaning**, plus office and welfare facility cleaning under the same contract.\n- **Planned preventative maintenance**, coordinated with downtime windows and shift-pattern scheduling.\n- **Site housekeeping & walkway safety standards**, treated as part of site safety rather than a separate cleaning task.\n- **Health & safety compliance support** across production, warehousing and distribution areas.",
      "serviceHighlights": [
        {
          "serviceLabel": "Production Floor & Warehouse Cleaning",
          "description": "Cleaning across production and warehousing areas, handled with awareness of contamination risk near QA-sensitive zones."
        },
        {
          "serviceLabel": "Downtime-Window Scheduling",
          "description": "Cleaning and maintenance scheduled around downtime windows and shift changeovers so servicing never slows the line."
        },
        {
          "serviceLabel": "Site Housekeeping & Walkway Safety",
          "description": "Clean, well-organised floors and walkways, treated as part of site safety standards rather than separate from them."
        },
        {
          "serviceLabel": "Planned Preventative Maintenance",
          "description": "Maintenance for production, warehouse and office facilities under a single schedule and point of contact."
        }
      ],
      "relatedServices": [
        {
          "label": "Reactive Maintenance",
          "path": "/hard-services/reactive-maintenance"
        },
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        }
      ]
    }
  },
  {
    "slug": "data-centres",
    "type": "industry",
    "path": "/industries/data-centres",
    "data": {
      "title": "Data Centres",
      "icon": "server",
      "heroDescription": "Cleaning and facilities management for data centre environments — built around particulate control, security-cleared access, and scheduling that never touches an uptime-critical window.",
      "overview": "Cleaning protocols are built to minimise dust and particulate contamination around server halls and technical equipment, using anti-static, low-residue methods. Personnel working in data centre environments are prepared for security clearance, access control and escort procedures before ever entering a facility.\n\nServicing is scheduled around maintenance windows and never scheduled in a way that risks operational uptime or equipment access protocols — with teams briefed on temperature, humidity and ESD-sensitive conditions specific to data hall environments, so cleaning never becomes a risk to equipment.",
      "challenges": "- **Particulate control protects the hardware:** Cleaning protocols are built to minimise dust and particulate contamination around server halls and technical equipment, using anti-static, low-residue methods.\n- **Security and access come first:** Personnel working in data centre environments are prepared for security clearance, access control and escort procedures before ever entering a facility.\n- **Uptime is never negotiable:** Servicing is scheduled around maintenance windows and never scheduled in a way that risks operational uptime or equipment access protocols.\n- **Environmental sensitivity, understood:** Teams are briefed on temperature, humidity and ESD-sensitive conditions specific to data hall environments, so cleaning never becomes a risk to equipment.",
      "ourApproach": "Every visit is planned around the facility's own uptime and access rules:\n\n- **Server hall & technical area cleaning**, using anti-static, low-particulate cleaning protocols throughout.\n- **Office, control room & welfare facility cleaning**, kept separate from technical-area protocols.\n- **Scheduling around maintenance windows**, so servicing is never a risk to operational uptime.\n- **Security-cleared, access-controlled personnel**, prepared for escort procedures before entering a facility.\n- **Facilities maintenance & planned preventative upkeep**, coordinated the same way as cleaning access.",
      "serviceHighlights": [
        {
          "serviceLabel": "Server Hall & Technical Area Cleaning",
          "description": "Anti-static, low-particulate cleaning protocols built specifically to minimise contamination risk around technical equipment."
        },
        {
          "serviceLabel": "Security-Cleared Personnel",
          "description": "Staff prepared for security clearance, access control and escort procedures before entering a facility."
        },
        {
          "serviceLabel": "Uptime-Safe Scheduling",
          "description": "Servicing scheduled around maintenance windows, never in a way that risks operational uptime or access protocols."
        },
        {
          "serviceLabel": "Office, Control Room & Welfare Cleaning",
          "description": "Non-technical area cleaning kept to its own protocol, separate from data hall procedures."
        }
      ],
      "relatedServices": [
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        },
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Reactive Maintenance",
          "path": "/hard-services/reactive-maintenance"
        }
      ]
    }
  },
  {
    "slug": "venues",
    "type": "industry",
    "path": "/industries/venues",
    "data": {
      "title": "Venues",
      "icon": "theater",
      "heroDescription": "Cleaning and facilities management for event venues, conference centres and arenas — built around fast turnarounds between events and the front-of-house standard visitors expect the moment they walk in.",
      "overview": "Venues move from one event to the next fast. Cleaning and reset are scheduled tightly around load-in, event hours and load-out, so the space is ready for what's next. Lobbies, auditoriums, washrooms and public areas are cleaned to a presentation standard that holds up under high footfall and full public view.\n\nGreen rooms, backstage corridors and technical/plant areas get the same standard of care as public-facing spaces, without getting in the way of production and technical crews — and high-volume waste and debris after events are cleared efficiently, so venues are event-ready again on schedule.",
      "challenges": "- **Turnaround windows measured in hours, not days:** Venues move from one event to the next fast. Cleaning and reset are scheduled tightly around load-in, event hours and load-out.\n- **Front-of-house has to be flawless:** Lobbies, auditoriums, washrooms and public areas are cleaned to a presentation standard that holds up under high footfall and full public view.\n- **Backstage and technical areas matter just as much:** Green rooms, backstage corridors and technical/plant areas get the same standard of care as public-facing spaces, without getting in the way of production and technical crews.\n- **Post-event reset and waste management:** High-volume waste and debris after events are cleared efficiently, so venues are event-ready again on schedule.",
      "ourApproach": "Scheduling is built around the event calendar, not a fixed weekly routine:\n\n- **Front-of-house & public area cleaning**, to a presentation standard that holds up under full public view.\n- **Post-event deep cleaning & reset**, including high-volume waste management, cleared efficiently between events.\n- **Backstage, green room & technical area cleaning**, without getting in the way of production and technical crews.\n- **Event turnaround & load-in/load-out scheduling**, plus facilities maintenance for the venue building itself.",
      "serviceHighlights": [
        {
          "serviceLabel": "Front-of-House & Public Area Cleaning",
          "description": "Lobbies, auditoriums and washrooms cleaned to a presentation standard that holds up under high footfall."
        },
        {
          "serviceLabel": "Post-Event Deep Cleaning & Reset",
          "description": "High-volume waste and debris cleared efficiently, so venues are event-ready again on schedule."
        },
        {
          "serviceLabel": "Backstage & Technical Area Cleaning",
          "description": "Green rooms, backstage corridors and technical/plant areas serviced without disrupting production and technical crews."
        },
        {
          "serviceLabel": "Event Turnaround Scheduling",
          "description": "Cleaning and reset scheduled tightly around load-in, event hours and load-out."
        }
      ],
      "relatedServices": [
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        },
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        }
      ]
    }
  },
  {
    "slug": "parking-lot-management",
    "type": "service",
    "path": "/soft-services/parking-lot-management",
    "data": {
      "title": "Parking Lot Management",
      "icon": "square-parking",
      "heroDescription": "Cleaning and facilities management for car parks and parking facilities — keeping surfaces clean, markings clear, and equipment maintained across sites that never stop being used.",
      "overview": "A car park is often the first thing a visitor sees and the last thing they remember. Clean surfaces, clear markings and working lighting set the tone before anyone reaches the front door. Litter, spillages, faded line markings and poor lighting are trip, slip and safety risks — ongoing cleaning and maintenance keep car parks compliant and safe for daily use.\n\nCar parks at retail, corporate, healthcare and transport sites see constant vehicle and pedestrian traffic. Sweeping, waste management, pressure washing and facilities maintenance run under a single contract — one point of contact instead of multiple contractors and missed handoffs.",
      "features": [
        {
          "icon": "spray-can",
          "title": "Sweeping & Surface Cleaning",
          "description": "Sweeping, litter removal and pressure washing across surface, multi-storey and basement car parks, scheduled around peak usage hours."
        },
        {
          "icon": "square-parking",
          "title": "Line Marking & Signage Upkeep",
          "description": "Line marking and signage kept clear and legible — a direct trip, slip and safety risk when left to fade."
        },
        {
          "icon": "wrench",
          "title": "Lighting, Barrier & Equipment Maintenance",
          "description": "Facilities maintenance covering lighting, barriers and EV charging bay areas alongside cleaning."
        },
        {
          "icon": "recycle",
          "title": "Waste & Graffiti Management",
          "description": "Waste bin management and collection, plus graffiti removal, run under the same single contract."
        }
      ],
      "faqs": [],
      "relatedServices": [
        {
          "label": "Facilities Management",
          "path": "/soft-services/facilities-management"
        },
        {
          "label": "Commercial Cleaning",
          "path": "/soft-services/commercial-cleaning"
        },
        {
          "label": "Security Services",
          "path": "/soft-services/security"
        }
      ]
    }
  }
];
