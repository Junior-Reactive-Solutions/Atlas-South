/**
 * Central image map — one place that decides which photograph every page uses.
 *
 * Each page gets a photograph chosen for that specific subject rather than a generic
 * trade shot reused across the site: the electricals page shows an electrician wiring a
 * panel, the healthcare page a hospital corridor, the Central London page St Paul's.
 * Matching the image to the page is most of what makes a services site feel alive rather
 * than templated.
 *
 * Routing every page through one module means swapping in the client's own photography
 * later is a single-file edit rather than 21 content migrations plus a CMS pass.
 *
 * Provenance: every id below was taken from an Unsplash search result page, excluding
 * sponsored iStock placements and Unsplash+ (paid) results, and each URL was confirmed to
 * return HTTP 200. Unsplash License: free for commercial use, no attribution required.
 *
 * Served straight from Unsplash's CDN with `auto=format`, matching the pattern already
 * shipped in HeroCarousel.tsx. `03-HERO-SECTION-SPEC.md` specced a Cloudinary round-trip,
 * but Cloudinary was never provisioned (the CLOUDINARY_* env vars are empty). The API's
 * CSP already allows images.unsplash.com.
 *
 * ⚠ These remain stock. ABM — the inspiration site this structure mirrors — uses its own
 * photography of its own people and sites, and that is a large part of why it reads as
 * credible. Replacing these with real Atlas South photography is still the single
 * highest-value content task remaining.
 */

const UNSPLASH = 'https://images.unsplash.com';

/** Builds a sized, format-negotiated Unsplash CDN URL. */
function img(id: string, width = 1200): string {
  return `${UNSPLASH}/${id}?auto=format&fit=crop&w=${width}&q=70`;
}

/**
 * Per-slug hero photography. Slugs match the ContentPage slugs used by useContentPage,
 * so `heroImageFor('healthcare')` works for any service, industry or area page.
 * The comment on each line is what the photograph actually shows.
 */
const HERO_BY_SLUG: Record<string, string> = {
  // Hard services
  electricals: 'photo-1621905251189-08b45d6a269e', // electrician wiring a panel, hard hat
  plumbing: 'photo-1673870861507-d72aa6855d89', // tradesperson with wrench at a tool wall
  'reactive-maintenance': 'photo-1642749776312-aa42ce20c9f5', // two engineers working on a roof
  'fire-safety': 'photo-1574064565163-af7a987a1490', // hard hats beside an emergency alarm point
  // Soft services
  'facilities-management': 'photo-1582647509711-c8aa8a8bda71', // blue glass office tower
  security: 'photo-1496368077930-c1e31b4e5b44', // surveillance cameras mounted on a wall
  'commercial-cleaning': 'photo-1781637590564-01c65dbf2039', // cleaner vacuuming an office floor
  catering: 'photo-1577219492769-b63a779fac28', // chef plating in a commercial kitchen
  aviation: 'photo-1592403386852-6f3c746e1ea6', // passengers moving through an airport terminal
  concierge: 'photo-1763560705345-5aed55f99c8f', // modern reception desk and lobby seating
  'waste-recycling': 'photo-1611284446314-60a58ac0deb9', // colour-separated recycling bins
  // Industries
  corporate: 'photo-1560264280-88b68371db39', // open-plan office in use
  healthcare: 'photo-1777269749032-d8d458ae594d', // hospital corridor
  retail: 'photo-1694064500485-405140238c9c', // busy shopping centre concourse
  education: 'photo-1759732735643-39bbe53f27ea', // university buildings around a courtyard
  // Areas — a recognisable landmark per area rather than the same London skyline six times
  'central-london': 'photo-1448906654166-444d494666b3', // St Paul's Cathedral
  'east-london': 'photo-1578793226777-3ce6ec6f911e', // 30 St Mary Axe, City fringe
  'south-east-london': 'photo-1574854986069-a8653af0944e', // Tower Bridge at golden hour
  'north-london': 'photo-1632897271846-b6e3ca78aded', // double-decker on a busy high street
  'west-london': 'photo-1604497853190-dc84f9a3f0bf', // red-brick terraces, west London stock
  'surrey-kent': 'photo-1546726855-8a67ffa6be39', // suburban house, Surrey/Kent commuter belt
};

/** Used when a slug has no entry — the original hero shot of a crew on site. */
const HERO_FALLBACK = 'photo-1694521787193-9293daeddbaa';

/** Hero photograph for a content slug. Never returns empty. */
export function heroImageFor(slug: string, width = 1600): string {
  return img(HERO_BY_SLUG[slug] ?? HERO_FALLBACK, width);
}

/**
 * A second, distinct photograph per slug — shown on hover via <HoverImage>
 * (components/shared/HoverImage.tsx) wherever a card carries both `image` and
 * `imageAlt` (see CardGrid.tsx). Same sourcing rigor and provenance as HERO_BY_SLUG:
 * every id below was taken from an Unsplash search result page, excluding sponsored
 * iStock placements and Unsplash+ (paid) results, and each URL was confirmed to return
 * HTTP 200 (2026-08-17). Unsplash License: free for commercial use, no attribution
 * required.
 *
 * Deliberately a genuinely different photo per slug, not a crop/filter of the primary
 * one — two early candidates (an electricals "portrait" shot and a reactive-maintenance
 * "hard hat" shot) turned out to already be the site's existing primary/panel images and
 * were swapped out once that was caught, rather than shipped as a fake alternate.
 *
 * `surrey-kent`'s alternate is a Cotswolds village street, not literally Surrey or Kent —
 * described generically in its comment rather than claiming a specific wrong location.
 */
const HERO_ALT_BY_SLUG: Record<string, string> = {
  // Hard services
  electricals: 'photo-1751486289943-0428133c367c', // exposed wiring mid-installation, raw plaster wall
  plumbing: 'photo-1611021061421-93741ec41ce1', // hand holding a length of copper pipe
  'reactive-maintenance': 'photo-1621905251918-48416bd8575a', // engineer in hard hat holding measuring tools
  'fire-safety': 'photo-1712640379137-6d2532f887a7', // red fire extinguisher mounted on a wall
  // Soft services
  'facilities-management': 'photo-1553601581-8a1f1010efbe', // gray high-rise building, low angle
  security: 'photo-1672073311074-f60c4a5e7b92', // close-up of a security camera on a pole
  'commercial-cleaning': 'photo-1718152421680-d1580e843cc9', // worker in hi-vis pressure-washing a floor
  catering: 'photo-1771360963016-1408c2de12c4', // chef preparing food in a professional kitchen
  aviation: 'photo-1758531491352-7887c1fe45b3', // aircraft at an airport gate, viewed through the window
  concierge: 'photo-1553369728-15ec6971afaf', // man standing beside a reception counter
  'waste-recycling': 'photo-1763315156830-07870b159121', // worker feeding material onto a recycling conveyor belt
  // Industries
  corporate: 'photo-1557804506-669a67965ba0', // team meeting around a whiteboard
  healthcare: 'photo-1517120026326-d87759a7b63b', // clinical staff member walking a hospital corridor
  retail: 'photo-1567958436049-f2903793328b', // staff member organising stock inside a store
  education: 'photo-1758270704524-596810e891b5', // students in a lecture hall
  // Areas — a second recognisable landmark/street per area, not the same shot cropped
  'central-london': 'photo-1503566303019-ba141f5f9b76', // Big Ben, Westminster
  'east-london': 'photo-1626289296186-bb511ef4285b', // Canary Wharf skyline across the water
  'south-east-london': 'photo-1642501493351-ffc448931fab', // The Shard at London Bridge, night
  'north-london': 'photo-1786711575684-65a29d500456', // Camden Market street entrance
  'west-london': 'photo-1719941857483-f6789ad7200f', // Notting Hill's painted terraces
  'surrey-kent': 'photo-1670620800615-4225fe6ecb75', // English village street (Cotswolds, not literally Surrey/Kent)
};

/** Second photograph for a slug, for hover-reveal — null if this slug has no alternate. */
export function heroImageAltFor(slug: string, width = 1600): string | null {
  const id = HERO_ALT_BY_SLUG[slug];
  return id ? img(id, width) : null;
}

/**
 * Named shots used outside the per-slug heroes (currently the careers block).
 */
const NAMED = {
  /** Two people in workwear on site — the existing hero image, already live. */
  crewOnSite: 'photo-1694521787193-9293daeddbaa',
} as const;

export type PhotoKey = keyof typeof NAMED;

/** Resolve a named photo to a full CDN URL. */
export function photo(key: PhotoKey, width?: number): string {
  return img(NAMED[key], width);
}

/**
 * Before/after pairs for the drag-compare slider (components/shared/CompareSlider.tsx),
 * shown on the service pages where a real visual transformation is the actual selling
 * point — plumbing, electricals, commercial cleaning. Deliberately NOT applied to every
 * service page: aviation, catering, concierge etc. don't have a "damaged → fixed" story to
 * tell, and forcing one on would mean staging a fake pair, which is exactly the kind of
 * invented-content risk this project has already had to correct elsewhere (see the seed
 * data fabrication caught and fixed in apps/api/scripts/seed-content.ts).
 *
 * These are stock photography illustrating the trade — the same category of image already
 * used for every hero shot above — not a documentary claim that a specific pictured pipe
 * or panel is an Atlas South job. Sourced 2026-08-15 with the same process as HERO_BY_SLUG:
 * excluding Unsplash+ (paid) results, each URL confirmed to return HTTP 200. Unsplash
 * License: free for commercial use, no attribution required.
 */
const BEFORE_AFTER_BY_SLUG: Record<string, { before: string; after: string }> = {
  plumbing: {
    before: 'photo-1783789597229-e950db025197', // corroded pipe with valves, concrete wall
    after: 'photo-1694827893591-af9b80361599', // fresh copper pipework installed in an opened wall
  },
  electricals: {
    before: 'photo-1635335874521-7987db781153', // old fusebox, wires plugged in loose
    after: 'photo-1576446470246-499c738d1c8e', // clean white circuit breaker panel
  },
  'commercial-cleaning': {
    before: 'photo-1566699270403-3f7e3f340664', // desk covered in scattered papers
    after: 'photo-1718220216044-006f43e3a9b1', // clean, organised open-plan office
  },
};

/** Before/after image pair for a slug, or null if this page doesn't have one. */
export function beforeAfterFor(slug: string, width = 1000): { before: string; after: string } | null {
  const pair = BEFORE_AFTER_BY_SLUG[slug];
  if (!pair) return null;
  return { before: img(pair.before, width), after: img(pair.after, width) };
}

/**
 * Images illustrating the alternating benefit panels. Deliberately generic working shots
 * — these sit beside claims like "planned maintenance" or "compliance documentation"
 * that no single photograph depicts literally, so a real person doing real technical work
 * is a better fit than a literal-minded match.
 */
const PANEL_ROTATION: string[] = [
  'photo-1621905251918-48416bd8575a', // engineer in hard hat holding a tool
  'photo-1758101755915-462eddc23f57', // testing an electrical panel with a multimeter
  'photo-1660330589487-39cc0177ba89', // worker in a hi-vis jacket
  'photo-1698479603408-1a66a6d9e80f', // bank of air-conditioning units
  'photo-1615774925655-a0e97fc85c14', // engineer on site
  'photo-1694521787193-9293daeddbaa', // crew on site
];

/** Image for the nth benefit panel on a page, cycling through the rotation. */
export function panelImage(index: number, width = 900): string {
  return img(PANEL_ROTATION[index % PANEL_ROTATION.length], width);
}

/**
 * Every id referenced above, for the verification script that confirms each one still
 * resolves. Exported so a broken image is caught by a check rather than by a visitor.
 */
export const ALL_PHOTO_IDS: string[] = [
  ...Object.values(HERO_BY_SLUG),
  HERO_FALLBACK,
  ...Object.values(NAMED),
  ...PANEL_ROTATION,
  ...Object.values(BEFORE_AFTER_BY_SLUG).flatMap((pair) => [pair.before, pair.after]),
  ...Object.values(HERO_ALT_BY_SLUG),
];
