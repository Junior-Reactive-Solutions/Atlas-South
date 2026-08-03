import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';

export function NorthLondon() {
  return (
    <ServiceAreaDetailPage
      id="north-london"
      path="/areas/north-london"
      title="North London"
      icon="map-pin"
      heroDescription="Responsive facilities management across North London's diverse commercial and institutional landscape, from King's Cross to Barnet"
      overview={
        <>
          <p>
            North London spans from the dense mixed-use redevelopment zones around King's Cross and Islington through to suburban and light
            industrial areas in Barnet, Enfield, and Haringey. The area combines high-value central properties, growing mid-market office
            space, healthcare and educational institutions, and light industrial/logistics facilities.
          </p>
          <p>
            Atlas South serves North London with dedicated coverage, leveraging our central London expertise in the inner boroughs and expanding
            capability in outer areas as demand for professional FM grows.
          </p>
        </>
      }
      responseTime="35 minutes for inner North London (N1–N8); 45 minutes for outer areas (N9–N22)"
      coverage={
        <>
          <ul>
            <li>
              <strong>King's Cross & St Pancras:</strong> N1, WC1H — high-value mixed-use development with offices, retail, hospitality, and
              strict scheduling constraints.
            </li>
            <li>
              <strong>Islington & Finsbury:</strong> N1, EC1, N5 — established commercial core with boutique offices, creative studios, and
              hospitality venues.
            </li>
            <li>
              <strong>Hackney & Shoreditch:</strong> N1, E2, E8 — creative industries, tech companies, mixed-use developments with cost-sensitive
              FM budgets.
            </li>
            <li>
              <strong>Holloway & Archway:</strong> N7, N19 — residential and small commercial with medium-sized office/retail conversions.
            </li>
            <li>
              <strong>Finchley, Barnet & Enfield:</strong> N3, N10, N12, EN postcodes — suburban office parks, logistics facilities, retail
              chains with extended response times.
            </li>
            <li>
              <strong>Waltham Forest edge:</strong> E4, E17 — light industrial and growing mixed-use development.
            </li>
          </ul>
        </>
      }
      localProof={
        <>
          <p>
            Over 120 North London clients include healthcare trusts, educational institutions, logistics operators, and corporate offices.
            We've built deep relationships across both inner and outer North London, from high-touch central services to cost-optimized suburban
            facilities contracts.
          </p>
        </>
      }
    />
  );
}
