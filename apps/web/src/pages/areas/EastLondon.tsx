import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';

export function EastLondon() {
  return (
    <ServiceAreaDetailPage
      id="east-london"
      path="/areas/east-london"
      title="East London"
      icon="map-pin"
      heroDescription="Facilities management and emergency response across East London's industrial, logistics, and emerging commercial zones"
      overview={
        <>
          <p>
            East London combines established light industrial and logistics hubs with rapidly emerging mixed-use development zones. The area is
            home to data centres, logistics operators, established commercial tenants, and newer office/retail developments—each with distinct
            FM requirements and operational patterns.
          </p>
          <p>
            Atlas South operates across East London with expertise in both industrial-scale facility management and the newer commercial
            developments reshaping the area's commercial profile.
          </p>
        </>
      }
      responseTime="40 minutes for emergency call-outs across East London postcodes (E1–E18)"
      coverage={
        <>
          <ul>
            <li>
              <strong>Tower Hamlets (Whitechapel, Bethnal Green, Mile End):</strong> E1, E2, E3 — mixed commercial, retail, offices, and light
              industrial with strong cultural/creative sector presence.
            </li>
            <li>
              <strong>Bow, Stratford & Olympic Zone:</strong> E3, E15, E16, E20 — mixed-use development hubs with offices, retail, and large
              commercial estates.
            </li>
            <li>
              <strong>Newham (East Ham, Upton Park):</strong> E6, E7, E12, E13 — established light industrial, retail, and logistics with
              suburban growth.
            </li>
            <li>
              <strong>Waltham Forest (Walthamstow, Leyton):</strong> E4, E10, E11, E17 — light industrial, retail chains, small commercial
              tenants with cost-focused FM needs.
            </li>
            <li>
              <strong>Barking & Dagenham:</strong> E6, RM9, RM10 — logistics, warehouses, and industrial facilities with larger footprints and
              extended response times (50 min).
            </li>
            <li>
              <strong>Hackney Wick & Olympic Park periphery:</strong> E9, E15 — emerging creative and commercial zones with mixed-use demands.
            </li>
          </ul>
        </>
      }
      localProof={
        <>
          <p>
            Over 180 East London clients depend on Atlas South, including logistics operators, data centre facilities, retail chains, and
            mixed-use developers. East London is one of our fastest-growing coverage areas as commercial development and logistics demand
            accelerate.
          </p>
        </>
      }
    />
  );
}
