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
];
