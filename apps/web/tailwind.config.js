/**
 * Brand tokens per docs/build/01-BRAND-SYSTEM.md.
 *
 * Colours were sampled directly from assets/brand/atlas-south-logo.jpg (not chosen
 * freehand) and verified against WCAG 2.1 AA before being encoded here.
 *
 * `brand-blue` (#0078FC, the raw logo blue) measures 4.12:1 on white — it FAILS AA for
 * text (needs 4.5:1). It is reserved for decorative/graphic use only (icon fills,
 * gradients, borders ≥3px). `accent-blue` (#0062D6) is the accessible variant and is
 * the ONLY blue permitted for text, links, or button labels. See 01-BRAND-SYSTEM.md §2
 * for the full verification table — do not reintroduce brand-blue as a text colour.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#002484',
          deep: '#0A2472',
        },
        'brand-blue': '#0078FC', // decorative/graphic use ONLY — fails AA for text
        'accent-blue': '#0062D6', // use for ALL text/links/buttons
        ink: '#0B1220',
        slate: '#47547A',
        canvas: {
          DEFAULT: '#FFFFFF',
          tint: '#F5F8FD',
        },
        border: '#DCE3F0',
        success: '#1E7A4C',
        error: '#C0392B',
      },
      fontFamily: {
        // "Big Shoulders" was designed around Chicago's industrial/structural
        // architecture (its name references Carl Sandburg's "City of Big Shoulders") —
        // a genuine match for a trades/facilities brand whose own logo is a building
        // silhouette, not a stylistic pick. One cut used for every heading level (not
        // split by size) so `font-display` stays a single uniform token site-wide.
        // "Inter" pairs as body copy for its proven legibility across the long
        // feature/FAQ copy every service page carries. See docs/build/01-BRAND-SYSTEM.md §4.
        display: ['"Big Shoulders Display"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
