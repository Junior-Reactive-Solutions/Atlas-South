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
 * A handful of entries (marked `{ pexels: '…' }` — currently just rail-facilities) come
 * from Pexels instead, sourced and verified the same way, chosen when a candidate on that
 * site read as more clearly relevant and had no distracting non-UK signage in frame.
 * Pexels License: free for commercial use, no attribution required.
 *
 * Served straight from each site's own CDN with format/quality params, matching the
 * pattern already shipped in HeroCarousel.tsx. `03-HERO-SECTION-SPEC.md` specced a
 * Cloudinary round-trip, but Cloudinary was never provisioned (the CLOUDINARY_* env vars
 * are empty). The API's CSP allows both images.unsplash.com and images.pexels.com.
 *
 * ⚠ These remain stock. ABM — the inspiration site this structure mirrors — uses its own
 * photography of its own people and sites, and that is a large part of why it reads as
 * credible. Replacing these with real Atlas South photography is still the single
 * highest-value content task remaining.
 */

const UNSPLASH = 'https://images.unsplash.com';
const PEXELS = 'https://images.pexels.com';

/** A photo reference: a bare Unsplash id (the long-standing convention), or an explicit
 * `{ pexels: id }` for the handful of images sourced from Pexels instead. */
type PhotoRef = string | { pexels: string };

/** Builds a sized, format-negotiated Unsplash CDN URL. */
function img(id: string, width = 1200): string {
  return `${UNSPLASH}/${id}?auto=format&fit=crop&w=${width}&q=70`;
}

/** Builds a sized, format-negotiated Pexels CDN URL. */
function pexelsImg(id: string, width = 1200): string {
  return `${PEXELS}/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

/** Resolves any PhotoRef to a concrete, sized CDN URL regardless of source. */
function resolvePhoto(ref: PhotoRef, width: number): string {
  return typeof ref === 'string' ? img(ref, width) : pexelsImg(ref.pexels, width);
}

/**
 * Per-slug hero photography. Slugs match the ContentPage slugs used by useContentPage,
 * so `heroImageFor('healthcare')` works for any service, industry or area page.
 * The comment on each line is what the photograph actually shows.
 */
const HERO_BY_SLUG: Record<string, PhotoRef> = {
  // Hard services
  electricals: 'photo-1621905251189-08b45d6a269e', // electrician wiring a panel, hard hat
  plumbing: 'photo-1673870861507-d72aa6855d89', // tradesperson with wrench at a tool wall
  'reactive-maintenance': 'photo-1642749776312-aa42ce20c9f5', // two engineers working on a roof
  // Soft services. fire-safety and waste-recycling removed 2026-08-20 along with their
  // pages, at the client's request.
  'facilities-management': 'photo-1582647509711-c8aa8a8bda71', // blue glass office tower
  // Replaced 2026-08-20 — the previous photo was just CCTV cameras on a wall, which reads
  // as generic surveillance rather than the service itself. Security Services is centrally
  // about uniformed staffing ("licensed security officers", per the page's own copy), so
  // this shows an actual security officer on duty, clearly identifiable as such.
  security: 'photo-1652739758426-56a564265f9e', // security officer in a hi-vis "SECURITY" jacket, walking through a crowd
  'commercial-cleaning': 'photo-1781637590564-01c65dbf2039', // cleaner vacuuming an office floor
  catering: 'photo-1577219492769-b63a779fac28', // chef plating in a commercial kitchen
  aviation: 'photo-1592403386852-6f3c746e1ea6', // passengers moving through an airport terminal
  concierge: 'photo-1763560705345-5aed55f99c8f', // modern reception desk and lobby seating
  // parking-lot-management moved here from the Industries block below, 2026-08-20 — see
  // the note on its navigation.ts entry.
  'parking-lot-management': 'photo-1772461355574-3fcd84c6016b', // multi-level car park with directional signage
  // Added 2026-08-26 from the client's Rail sector one-pager. Sourced from Pexels rather
  // than Unsplash — several Unsplash-style candidates for "platform cleaning" carried
  // visible non-UK station signage (Bengali, Chinese), which would visibly signal the
  // wrong country on a London/South East contractor's own page; this one is a generic,
  // unbranded modern platform with no readable signage in frame.
  'rail-facilities': { pexels: '10390781' }, // empty modern underground platform, warm lighting, no readable signage
  // Industries
  corporate: 'photo-1560264280-88b68371db39', // open-plan office in use
  healthcare: 'photo-1777269749032-d8d458ae594d', // hospital corridor
  retail: 'photo-1694064500485-405140238c9c', // busy shopping centre concourse
  education: 'photo-1759732735643-39bbe53f27ea', // university buildings around a courtyard
  // Industries added 2026-08-20 (client content drop — see extracted-pages.ts's
  // government-public-sector/oil-gas/manufacturing/data-centres/venues entries). Same
  // sourcing process as every id above: found via Unsplash search, excluding
  // sponsored/Unsplash+ results, each URL confirmed HTTP 200.
  'government-public-sector': 'photo-1781174849484-ec624747e197', // stone civic building entrance with columns
  'oil-gas': 'photo-1781364486016-d83c39eb87f2', // industrial plant towers against a purple sky
  manufacturing: 'photo-1730584474196-b0e8a29303e8', // welders working on a machine in a factory
  'data-centres': 'photo-1584169417032-d34e8d805e8b', // server room aisle with metal equipment racks
  venues: 'photo-1773730356782-e3044e73cf6f', // rows of empty theatre seats
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
  return resolvePhoto(HERO_BY_SLUG[slug] ?? HERO_FALLBACK, width);
}

/**
 * Widths offered in a hero `srcset` — from the smallest phone up to a 1600px desktop
 * render. The browser picks whichever is closest to the actual rendered size at the
 * actual device pixel ratio, rather than everyone downloading the same 1600px file this
 * hero used to serve unconditionally regardless of viewport or connection speed.
 */
const HERO_SRCSET_WIDTHS = [480, 768, 1080, 1440, 1920];

/**
 * `srcset` string for a hero photograph — pairs with `heroImageFor` (same source image,
 * every candidate width) on the full-bleed page heroes (PhotoHero.tsx). Callers pass
 * `sizes="100vw"` alongside it since these heroes are always full viewport width.
 */
export function heroImageSrcSetFor(slug: string): string {
  const ref = HERO_BY_SLUG[slug] ?? HERO_FALLBACK;
  return HERO_SRCSET_WIDTHS.map((w) => `${resolvePhoto(ref, w)} ${w}w`).join(', ');
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
const HERO_ALT_BY_SLUG: Record<string, PhotoRef> = {
  // Hard services
  electricals: 'photo-1751486289943-0428133c367c', // exposed wiring mid-installation, raw plaster wall
  plumbing: 'photo-1611021061421-93741ec41ce1', // hand holding a length of copper pipe
  'reactive-maintenance': 'photo-1621905251918-48416bd8575a', // engineer in hard hat holding measuring tools
  // Soft services. fire-safety and waste-recycling removed 2026-08-20 along with their
  // pages, at the client's request.
  'facilities-management': 'photo-1553601581-8a1f1010efbe', // gray high-rise building, low angle
  // Replaced 2026-08-20 alongside the primary security image — see the note on that entry
  // above; this was a second CCTV-camera shot with the same generic-surveillance problem.
  security: 'photo-1772743227731-e16af7c8d85a', // security officer in a "SECURITY" jacket on rooftop patrol, different scene/setting from the primary shot
  'commercial-cleaning': 'photo-1718152421680-d1580e843cc9', // worker in hi-vis pressure-washing a floor
  catering: 'photo-1771360963016-1408c2de12c4', // chef preparing food in a professional kitchen
  aviation: 'photo-1758531491352-7887c1fe45b3', // aircraft at an airport gate, viewed through the window
  concierge: 'photo-1553369728-15ec6971afaf', // man standing beside a reception counter
  // parking-lot-management moved here from the Industries block below, 2026-08-20.
  'parking-lot-management': 'photo-1637970067784-927e66e07e36', // empty parking garage at night, lit
  'rail-facilities': { pexels: '27806682' }, // blue-tiled modern platform, different angle/scene from the primary shot, no readable signage
  // Industries
  corporate: 'photo-1557804506-669a67965ba0', // team meeting around a whiteboard
  healthcare: 'photo-1517120026326-d87759a7b63b', // clinical staff member walking a hospital corridor
  retail: 'photo-1567958436049-f2903793328b', // staff member organising stock inside a store
  education: 'photo-1758270704524-596810e891b5', // students in a lecture hall
  'government-public-sector': 'photo-1773544015678-58d09366ad6e', // ornate classical building facade with columns
  'oil-gas': 'photo-1678984239420-43cdc183bce6', // industrial plant with pipes, different vantage from the primary shot
  manufacturing: 'photo-1717386255767-52643970d483', // factory floor with machinery, no people (vs. the primary's welders)
  'data-centres': 'photo-1695668548342-c0c1ad479aee', // a different rack of servers in a server room
  venues: 'photo-1762176264161-09219da49794', // rows of empty desks in a modern conference room
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
  const ref = HERO_ALT_BY_SLUG[slug];
  return ref ? resolvePhoto(ref, width) : null;
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
 * Generic working-shot fallback for the alternating benefit panels, used only when a
 * slug has no curated photography at all (see panelImageFor below). Kept deliberately
 * generic rather than trade-specific, since a page falling back to this has no per-slug
 * photo to be specific WITH.
 */
const PANEL_FALLBACK_ROTATION: string[] = [
  'photo-1621905251918-48416bd8575a', // engineer in hard hat holding a tool
  'photo-1660330589487-39cc0177ba89', // worker in a hi-vis jacket
  'photo-1615774925655-a0e97fc85c14', // engineer on site
  'photo-1694521787193-9293daeddbaa', // crew on site
];

/**
 * Image for the nth benefit panel on a page — every service, industry and area detail
 * page's "what we provide" / "the challenge" / "our approach" panels (BenefitPanels.tsx).
 *
 * Previously this cycled through one fixed 6-photo PANEL_FALLBACK_ROTATION sitewide,
 * regardless of which page it rendered on — an electricals-page panel and a catering-page
 * panel pulled from the exact same array, which is why "testing an electrical panel with
 * a multimeter" turned up on pages that have nothing to do with electrics. This instead
 * builds a per-slug pool from photography already curated and verified for that specific
 * page (its hero photo, its hover-alt photo, and — for the three services with one — its
 * before/after pair), so every panel image is guaranteed to actually be that page's
 * subject. The alt photo is listed first, not the hero photo, so the panel directly under
 * the hero doesn't repeat the exact image the visitor just saw.
 *
 * Falls back to the generic rotation only for a slug with no curated photography at all
 * (there currently isn't one — every service, industry and area slug has at least a hero
 * + alt pair) rather than ever rendering a broken image.
 */
export function panelImageFor(slug: string, index: number, width = 900): string {
  const pool: PhotoRef[] = [];
  const altRef = HERO_ALT_BY_SLUG[slug];
  const heroRef = HERO_BY_SLUG[slug];
  const beforeAfter = BEFORE_AFTER_BY_SLUG[slug];
  if (altRef) pool.push(altRef);
  if (heroRef) pool.push(heroRef);
  if (beforeAfter) pool.push(beforeAfter.before, beforeAfter.after);

  if (pool.length === 0) {
    return img(PANEL_FALLBACK_ROTATION[index % PANEL_FALLBACK_ROTATION.length], width);
  }
  return resolvePhoto(pool[index % pool.length], width);
}

/**
 * Every photo referenced above, resolved to a concrete fetchable URL, for the
 * verification script that confirms each one still resolves. Exported as full URLs
 * (rather than bare ids) since entries now come from more than one CDN — a script
 * checking these doesn't need to know which. Broken image caught by a check, not a
 * visitor.
 */
export const ALL_PHOTO_URLS: string[] = [
  ...Object.values(HERO_BY_SLUG),
  HERO_FALLBACK,
  ...Object.values(NAMED),
  ...PANEL_FALLBACK_ROTATION,
  ...Object.values(BEFORE_AFTER_BY_SLUG).flatMap((pair) => [pair.before, pair.after]),
  ...Object.values(HERO_ALT_BY_SLUG),
].map((ref) => resolvePhoto(ref, 400));
