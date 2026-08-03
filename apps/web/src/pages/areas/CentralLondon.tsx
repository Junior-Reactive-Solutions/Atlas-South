import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';

export function CentralLondon() {
  return (
    <ServiceAreaDetailPage
      id="central-london"
      path="/areas/central-london"
      title="Central London"
      icon="map-pin"
      heroDescription="Premium facilities management and emergency response across London's high-value office, retail, and hospitality districts"
      overview={
        <>
          <p>
            Central London's dense commercial landscape demands responsive, reliable building services. From the West End to the City, high-street
            retail to corporate headquarters, facilities downtime isn't just costly — it's reputationally damaging.
          </p>
          <p>
            Atlas South maintains rapid dispatch across Westminster, the City of London, Southwark, and Lambeth, with engineers stationed to hit
            response time targets in central areas where every minute counts.
          </p>
        </>
      }
      responseTime="30 minutes for critical infrastructure failures in central postcodes (within M25)"
      coverage={
        <>
          <ul>
            <li>
              <strong>West End & Theatreland:</strong> Soho, Leicester Square, Covent Garden — high-footfall venues with demanding compliance
              schedules.
            </li>
            <li>
              <strong>Financial District (City):</strong> EC postcodes — mission-critical systems, 24/7 operations, strict regulatory oversight.
            </li>
            <li>
              <strong>South Bank & Southwark:</strong> SE1 and adjacent areas — mixed-use developments, cultural venues, hospitality.
            </li>
            <li>
              <strong>Westminster & Lambeth:</strong> Government, legal, healthcare, and institutional facilities with complex compliance profiles.
            </li>
            <li>
              <strong>Central ancillary areas:</strong> Camden, Islington (N postcodes), and the fringes of central coverage — served by standing
              engineers with slightly extended response times (40–45 min).
            </li>
          </ul>
        </>
      }
      localProof={
        <>
          <p>
            Over 200 active central London clients rely on Atlas South, from boutique law firms and financial services to multi-site retail chains
            and hospitality groups. We maintain a live presence in central areas year-round, handling the peaks of summer tourism, Christmas retail
            demand, and the operational intensity of London's financial markets.
          </p>
        </>
      }
    />
  );
}
