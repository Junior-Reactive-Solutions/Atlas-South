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
      keyframes: {
        // Slow hero zoom — see the note in components/sections/PhotoHero.tsx. Runs once
        // rather than alternating, so the image settles and stays settled.
        'hero-zoom': {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.08)' },
        },
      },
      animation: {
        'hero-zoom': 'hero-zoom 20s ease-out forwards',
      },
      fontFamily: {
        // Montserrat replaces Big Shoulders Display — the previous pick read too thin
        // at heading weight and made the whole page feel smaller at normal zoom. The
        // logo's own wordmark (assets/brand/atlas-south-logo.jpg) is a bold geometric
        // sans with flat-apex letterforms; Montserrat is the closest free, open-license
        // match (SIL OFL, Google Fonts) with genuinely strong Bold/Black weights, used
        // uniformly across every heading level. See docs/build/01-BRAND-SYSTEM.md §4.
        display: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
