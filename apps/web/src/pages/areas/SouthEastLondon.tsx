import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';

export function SouthEastLondon() {
  return (
    <ServiceAreaDetailPage
      id="south-east-london"
      path="/areas/south-east-london"
      title="South East London"
      icon="map-pin"
      heroDescription="Comprehensive facilities management for growing South East London estates, from Lewisham to Crystal Palace to Croydon"
      overview={
        <>
          <p>
            South East London is a mixed commercial and residential landscape with rapidly expanding office space, established retail districts,
            and light industrial zones. Estates here are often larger and more distributed than central areas, requiring coordinated multi-site
            management and flexible scheduling.
          </p>
          <p>
            Atlas South operates across SE London with a network of engineers capable of handling everything from emergency response to
            planned preventative maintenance at competitive rates that reflect the area's market conditions.
          </p>
        </>
      }
      responseTime="40 minutes for emergency call-outs across SE London postcodes (SE1–SE28)"
      coverage={
        <>
          <ul>
            <li>
              <strong>Lewisham & Deptford:</strong> SE8, SE13, SE14 — mixed commercial, retail, and residential estates with growing office
              conversion projects.
            </li>
            <li>
              <strong>Southwark edge & Elephant & Castle:</strong> SE17 — rapidly gentrifying area with new commercial development and
              compliance-heavy estates.
            </li>
            <li>
              <strong>Camberwell & Peckham:</strong> SE15, SE5 — light industrial, creative studios, small commercial tenants with cost-conscious
              FM needs.
            </li>
            <li>
              <strong>Bermondsey & Canada Water:</strong> SE16, SE18 — larger commercial estates, warehouses, and logistics facilities with
              24/7 operations.
            </li>
            <li>
              <strong>Crystal Palace, Dulwich & surrounding:</strong> SE19, SE21, SE26 — suburban mixed-use and medium-sized office buildings
              with longer response times (50 min).
            </li>
            <li>
              <strong>Croydon fringe:</strong> South SE edge of London coverage — coordinated with full Croydon/Surrey capability.
            </li>
          </ul>
        </>
      }
      localProof={
        <>
          <p>
            Over 150 SE London clients depend on Atlas South, including logistics operators, growing tech/creative companies, retail chains,
            and NHS facilities. We've grown significantly in the area over the past 3 years as South East London development accelerates.
          </p>
        </>
      }
    />
  );
}
