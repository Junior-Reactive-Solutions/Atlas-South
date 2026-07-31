import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';

export function SurreyKent() {
  return (
    <ServiceAreaDetailPage
      id="surrey-kent"
      title="Surrey & Kent"
      icon="map-pin"
      heroDescription="Facilities management and emergency response across Surrey and Kent, serving corporate headquarters, light industrial estates, and suburban facilities"
      overview={
        <>
          <p>
            Surrey and Kent represent Atlas South's geographic expansion beyond London's core, serving the extensive commuter belt and regional
            commercial hubs. The areas include corporate headquarters relocations, business parks, light industrial zones, and logistics
            facilities—often with larger footprints and lower service density than central London.
          </p>
          <p>
            Atlas South operates across Surrey and Kent with experienced engineers and regional coordination, delivering cost-effective
            preventative maintenance and responsive emergency support to a growing regional client base.
          </p>
        </>
      }
      responseTime="60 minutes for emergency call-outs across Surrey and Kent (postcodes CR, RH, TW, KT, DA, BR, ME, TN)"
      coverage={
        <>
          <ul>
            <li>
              <strong>Croydon & South Croydon:</strong> CR0, CR2 — major commercial hub with corporate offices, retail, and light industrial.
              Often the first point of contact for Surrey-wide clients.
            </li>
            <li>
              <strong>Surrey Hills & Epsom:</strong> RH1–5, KT17–19 — business parks, corporate facilities, and light industrial estates with
              preventative maintenance focus.
            </li>
            <li>
              <strong>Guildford & Woking:</strong> GU1–3, GU21–22 — major business park regions with large corporate campuses and logistics
              facilities.
            </li>
            <li>
              <strong>Kent East (Dartford, Erith):</strong> DA1–9, BR4–5, BR7–8 — light industrial, logistics, and commercial estates. Extended
              response times (70+ min) depending on location.
            </li>
            <li>
              <strong>Kent Central (Maidstone, Sevenoaks):</strong> ME, TN1–3 — regional business parks, light industrial, and suburban
              commercial.
            </li>
            <li>
              <strong>Kent Coastal Fringe:</strong> CT, TN — limited coverage for established clients; coordinated with regional partners.
            </li>
          </ul>
        </>
      }
      localProof={
        <>
          <p>
            Over 90 Surrey and Kent clients rely on Atlas South for regional facilities management, ranging from single-site business park
            operators to multi-location corporate FM contracts. We've built regional expertise through partnerships with local specialists and
            direct hiring in key hubs like Croydon and Guildford.
          </p>
        </>
      }
    />
  );
}
