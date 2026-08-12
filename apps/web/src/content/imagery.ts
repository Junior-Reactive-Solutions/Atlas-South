/**
 * Central image map — one place that decides which photograph every page uses.
 *
 * Why a map rather than an `image` field per content row: photography is the thing most
 * likely to be replaced wholesale (see the note below), and routing every page through
 * one module means swapping the client's own photography in later is a single-file edit
 * rather than 21 content migrations plus a CMS pass.
 *
 * ⚠ These are Unsplash stock placeholders. ABM — the inspiration site this structure
 * mirrors — uses its OWN photography of its OWN people and sites, which is a large part
 * of why it reads as credible rather than generic. Stock photos of unrelated people will
 * always read as stock. Replacing these with real Atlas South photography (vans, team,
 * completed jobs, site work) is the single highest-value content task remaining.
 *
 * Unsplash License: free to use, no attribution required, no Unsplash+ images used here.
 * Served straight from Unsplash's CDN with `auto=format` — this matches the existing
 * pattern already shipped in HeroCarousel.tsx. `03-HERO-SECTION-SPEC.md` originally
 * specced a Cloudinary round-trip, but Cloudinary was never provisioned (the CLOUDINARY_*
 * env vars are empty), so this follows what the codebase actually does today.
 */

const UNSPLASH = 'https://images.unsplash.com';

/** Builds a sized, format-negotiated Unsplash CDN URL. */
function img(id: string, width = 1200): string {
  return `${UNSPLASH}/${id}?auto=format&fit=crop&w=${width}&q=70`;
}

/**
 * The verified base set. Every id here has been confirmed to resolve on Unsplash's CDN.
 * Deliberately small and reused across related pages rather than 21 bespoke shots —
 * a handful of coherent images reads better than twenty mismatched ones.
 */
const PHOTO = {
  /** Two workers in hi-vis on site — the existing hero image, already live. */
  crewOnSite: 'photo-1694521787193-9293daeddbaa',
  /** Worker in hard hat and hi-vis. */
  engineerHelmet: 'photo-1597502310092-31cdaa35b46d',
  /** Technician working on equipment. */
  technicianAtWork: 'photo-1581094488379-6a10d04c0f04',
  /** Engineer with tools, close work. */
  handsOnTools: 'photo-1581092335397-9583eb92d232',
  /** Maintenance work in a plant/services area. */
  plantRoom: 'photo-1581092162572-fe1cb11cd26e',
  /** Industrial/mechanical services detail. */
  mechanicalDetail: 'photo-1621905251918-48416bd8575a',
} as const;

export type PhotoKey = keyof typeof PHOTO;

/** Resolve a photo key to a full CDN URL at the given width. */
export function photo(key: PhotoKey, width?: number): string {
  return img(PHOTO[key], width);
}

/**
 * Per-slug hero photography. Slugs match the ContentPage slugs used by useContentPage,
 * so `heroImageFor('healthcare')` works for any service, industry or area page.
 * Anything not listed falls back to the crew-on-site shot rather than rendering an
 * empty panel.
 */
const HERO_BY_SLUG: Record<string, PhotoKey> = {
  // Hard services
  electricals: 'technicianAtWork',
  plumbing: 'handsOnTools',
  'reactive-maintenance': 'engineerHelmet',
  'fire-safety': 'plantRoom',
  'facilities-management': 'crewOnSite',
  // Soft services
  security: 'crewOnSite',
  'commercial-cleaning': 'technicianAtWork',
  catering: 'handsOnTools',
  aviation: 'mechanicalDetail',
  concierge: 'crewOnSite',
  'waste-recycling': 'plantRoom',
  // Industries
  corporate: 'crewOnSite',
  healthcare: 'plantRoom',
  retail: 'technicianAtWork',
  education: 'engineerHelmet',
  // Areas
  'central-london': 'crewOnSite',
  'south-east-london': 'engineerHelmet',
  'north-london': 'technicianAtWork',
  'east-london': 'handsOnTools',
  'west-london': 'mechanicalDetail',
  'surrey-kent': 'plantRoom',
};

const HERO_FALLBACK: PhotoKey = 'crewOnSite';

/** Hero photograph for a content slug. Never returns empty — falls back to the crew shot. */
export function heroImageFor(slug: string, width = 1600): string {
  return img(PHOTO[HERO_BY_SLUG[slug] ?? HERO_FALLBACK], width);
}

/**
 * Images used to illustrate the alternating benefit panels. Indexed by position so a
 * page with N benefits gets N distinct images without the content author choosing them.
 */
const PANEL_ROTATION: PhotoKey[] = [
  'technicianAtWork',
  'engineerHelmet',
  'handsOnTools',
  'plantRoom',
  'mechanicalDetail',
  'crewOnSite',
];

/** Image for the nth benefit panel on a page, cycling through the rotation. */
export function panelImage(index: number, width = 900): string {
  return img(PHOTO[PANEL_ROTATION[index % PANEL_ROTATION.length]], width);
}
