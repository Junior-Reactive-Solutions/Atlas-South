import { ServiceAreaDetailPage } from '../../components/areas/ServiceAreaDetailPage';

export function WestLondon() {
  return (
    <ServiceAreaDetailPage
      id="west-london"
      path="/areas/west-london"
      title="West London"
      icon="map-pin"
      heroDescription="Premium and responsive facilities management across West London's affluent residential, retail, and corporate districts"
      overview={
        <>
          <p>
            West London spans affluent residential zones, high-value retail districts, corporate headquarters, hospitality venues, and
            healthcare institutions. The area combines central premium services demand with suburban facility management, and includes major
            commercial hubs and light industrial areas.
          </p>
          <p>
            Atlas South serves West London with dedicated coverage and premium service delivery tailored to the area's high-value commercial
            and institutional clients.
          </p>
        </>
      }
      responseTime="35 minutes for inner West London (W1–W12); 45 minutes for outer areas (W13–W14, including Ealing)"
      coverage={
        <>
          <ul>
            <li>
              <strong>Knightsbridge, Kensington, Chelsea:</strong> SW1, SW3, SW5, SW7 — ultra-premium residential, high-end retail, embassies,
              and institutional facilities with white-glove service expectations.
            </li>
            <li>
              <strong>Mayfair, Belgravia, Pimlico:</strong> SW1, W1 — premium offices, boutique retail, high-value residential with strict
              compliance and scheduling.
            </li>
            <li>
              <strong>South Kensington & Natural History:</strong> SW7, SW5 — museums, educational institutions, mixed commercial.
            </li>
            <li>
              <strong>Hammersmith & Fulham:</strong> W6, W12, SW6 — established commercial hub with offices, retail, creative studios, and
              riverside facilities.
            </li>
            <li>
              <strong>Ealing & Acton:</strong> W3, W5, W13, W14 — suburban offices, retail chains, mixed-use developments with medium-sized
              FM contracts.
            </li>
            <li>
              <strong>Brentford & Richmond fringe:</strong> TW8, TW9, TW10 — light industrial, logistics, and suburban commercial.
            </li>
          </ul>
        </>
      }
      localProof={
        <>
          <p>
            Over 200 West London clients include luxury retail chains, premium office buildings, hospitality groups, educational institutions,
            and healthcare trusts. We maintain a dedicated presence serving West London's high-value commercial market with premium responsiveness
            and tailored service delivery.
          </p>
        </>
      }
    />
  );
}
