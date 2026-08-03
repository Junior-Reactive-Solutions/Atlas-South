/**
 * Atlas South design system Tailwind config — extend this in app-specific configs.
 * Docs: docs/build/01-BRAND-SYSTEM.md
 */
export default {
  theme: {
    extend: {
      colors: {
        // Brand palette sampled from atlas-south-logo.jpg and WCAG-verified
        navy: '#002484',
        // Brand blue (#0078FC) fails WCAG AA for text (4.12:1 vs required 4.5:1) —
        // reserved for graphics/decoration only, never used for text/buttons/links.
        'brand-blue': '#0078FC',
        // Accessible variant of brand blue for text, links, buttons
        'accent-blue': '#0062D6',
        // Semantic grays
        ink: '#1a1a1a',
        slate: '#6b7280',
        'canvas-tint': '#f3f4f6',
        canvas: '#ffffff',
        border: '#e5e7eb',
        success: '#10b981',
        error: '#ef4444',
      },
      fontFamily: {
        // Fonts sourced from Google Fonts; weights preloaded in apps/web/index.html.
        // See docs/build/01-BRAND-SYSTEM.md §4 for the rationale.
        display: ['"Big Shoulders Display"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
};
