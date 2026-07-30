# Brand System — Colour, Typography, Iconography

Derived directly from `assets/brand/atlas-south-logo.jpg` by sampling actual pixel
values (not eyeballed) and verified against WCAG 2.1 AA before being written down here.
No colour in this document was chosen freehand.

## 1. Colour extraction — how we got here

The logo file was sampled at ~48,000 grid points (excluding near-white background) and
clustered by frequency. Result: the logo is genuinely **two-tone** — one deep navy and
one bright blue, on white. There is no third brand hue; any light-cyan pixels detected
were JPEG edge artefacts, not a real colour, confirmed by visual inspection.

| Sampled | Hex | Frequency rank |
|---|---|---|
| Bright blue | `#0078FC` | dominant accent colour |
| Deep navy | `#002484` | dominant dark colour |

## 2. The working palette

Two adjustments were made to the raw sampled values, both for accessibility, not taste:

- `#002484` is used directly as **Navy** — it already passes AA comfortably everywhere.
- `#0078FC` is kept as **Brand Blue** for *large, non-text, decorative* use (it matches
  the logo exactly), but a **darkened accessible variant, `#0062D6` ("Accent Blue")**,
  is used for *any* text, link, or button-label context, because the raw logo blue
  measures **4.12:1 on white — it fails WCAG AA for normal text (needs 4.5:1)**. This is
  precisely the kind of contrast bug the audit flagged on the current site (the WhatsApp
  CTA fails contrast at 1.98:1) — the new palette is built so that mistake is
  structurally impossible: designers/devs reach for `--accent-blue` for anything with
  text, and `--brand-blue` only for icon fills, gradients, borders, and graphics ≥3px thick.

```
/* Design tokens — CSS custom properties */
--color-navy:          #002484;   /* logo navy, exact */
--color-navy-deep:      #0A2472;  /* very small tonal step, for gradients only */
--color-brand-blue:     #0078FC;  /* logo blue, exact — decorative/graphic use ONLY */
--color-accent-blue:    #0062D6;  /* accessible variant — ALL text/button/link use */
--color-ink:            #0B1220;  /* near-black, body text on white where max contrast needed */
--color-slate:          #47547A;  /* muted body text on white — 7.45:1, passes AAA */
--color-canvas:         #FFFFFF;  /* pure white */
--color-canvas-tint:    #F5F8FD;  /* very light navy-tinted grey, card/section backgrounds */
--color-border:         #DCE3F0;  /* hairline borders on light panels */
--color-success:        #1E7A4C;  /* form success states */
--color-error:          #C0392B;  /* form error states */
```

Verified contrast ratios (WCAG 2.1):

| Pair | Ratio | AA normal text (4.5:1) | AA large/UI (3:1) |
|---|---|---|---|
| Navy on white | 13.92:1 | PASS | PASS |
| Slate on white | 7.45:1 | PASS | PASS |
| **Brand Blue on white (text)** | 4.12:1 | **FAIL — do not use for text** | PASS |
| Accent Blue on white (text) | 5.65:1 | PASS | PASS |
| White on Navy | 13.92:1 | PASS | PASS |
| White on Brand Blue (button label) | 4.12:1 | **FAIL — do not use** | PASS |
| White on Accent Blue (button label) | 5.65:1 | PASS | PASS |
| Ink on canvas-tint | 17.59:1 | PASS | PASS |

**Rule, stated once so it never needs restating per component:** if a colour sits behind
or as text, it must be `--color-navy`, `--color-accent-blue`, `--color-ink`, or
`--color-slate`. `--color-brand-blue` is reserved for shapes, icon glyphs with no
overlaid text, gradients, dividers, and decorative backgrounds ≥3px in any dimension.

## 3. The 60/30/10 rule — applied per panel type

Client requirement: every page and every individual panel uses 60/30/10. Two panel
"modes" exist site-wide; every section on every page is one or the other. This table is
the single reference — component specs elsewhere in `docs/build/` point back here rather
than re-deriving ratios.

| Panel mode | 60% (dominant) | 30% (secondary) | 10% (accent) | Used for |
|---|---|---|---|---|
| **Light panel** (default) | `--color-canvas` / `--color-canvas-tint` background | `--color-navy` — headings, nav labels, icon strokes, dark UI chrome | `--color-accent-blue` — CTA buttons, links, active nav state, highlighted numbers | Most page body content, service/industry cards, forms |
| **Dark panel** | `--color-navy` (or `--color-navy-deep` gradient) background | `--color-canvas` (white) — headline text, card backgrounds at low opacity, body copy | `--color-brand-blue` — button fills, icon highlights, section dividers, decorative shapes | Hero, footer, CTA bands, stats bands |

Practical check for every new section built: name which mode it is, then confirm the
three proportions before shipping — a section that's "60% navy text on a canvas
background" but has no accent colour anywhere is a bug, not a valid light panel.

## 4. Typography

The current site uses Barlow Condensed (display) + Barlow (body) via Google Fonts — this
pairing is kept because it's already brand-recognisable from the logo's own lettering
style (bold condensed sans) and loads efficiently (single Google Fonts request, already
measured in the audit as the site's only external resource).

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display / H1 / Hero headline | Barlow Condensed | 800–900 | Uppercase, tight tracking — matches logo wordmark |
| H2–H4 | Barlow Condensed | 600–700 | |
| Body copy | Barlow | 400–500 | Sentence case, `--color-slate` on light panels |
| UI labels / buttons / nav | Barlow | 600, uppercase, letter-spacing 0.04em | |

Load via `<link rel="preconnect">` + a single `@font-face`/Google Fonts request per the
performance requirement in [`09-SEO-PERFORMANCE-CHECKLIST.md`](09-SEO-PERFORMANCE-CHECKLIST.md)
— trim to the exact weights listed above, not the 9 weights currently loaded.

## 5. Iconography — no emoji, anywhere

**Hard rule:** zero emoji characters in source, copy, icons, or UI at any point in the
build. The audit found the current site uses emoji (🛡️ 🔧 ⚡ 🎨 ✨ 🪚) as its entire icon
system — this is being fully replaced.

### Icon library decision: **Lucide** (primary), **Phosphor Icons** (fallback for gaps)

| Criterion | Lucide | Why it wins for this project |
|---|---|---|
| License | ISC (permissive, free, commercial-safe) | No licensing cost or attribution burden |
| Style | Single-weight outline stroke, consistent 24×24 grid | Reads as precise/technical — fits a trades & FM company better than filled/rounded icon sets |
| React integration | `lucide-react` — tree-shakable, one import per icon | Matches the React frontend decision in [`05-ARCHITECTURE-AND-STACK.md`](05-ARCHITECTURE-AND-STACK.md) |
| Coverage | ~1,500 icons incl. wrench, plug, flame, shield, hard-hat equivalents, building, truck, recycle, utensils, concierge-bell | Covers Hard/Soft Services and Industries nearly completely |
| Accessibility | Pure SVG, `aria-hidden` by default with a labelled-icon pattern documented below | No repeat of the current site's un-hidden emoji reading aloud as "shield emoji" to screen readers |

**Gap-fill rule:** any concept Lucide doesn't cover cleanly (e.g. a very specific aviation
or concierge glyph) is sourced from **Phosphor Icons** (also MIT-licensed, same
single-stroke family, same 24×24 grid) rather than mixing in a visually different icon
set. Two libraries maximum, both outline-style, never mixed with a filled/emoji/photo
icon on the same page.

### Icon-to-concept map (Hard/Soft Services, Industries)

| Section item | Icon (Lucide name, or Phosphor if marked) |
|---|---|
| Electricals | `zap` |
| Plumbing | `wrench` |
| Reactive Maintenance | `hammer` |
| Fire & Safety | `flame` |
| Facilities Management | `building-2` |
| Security Services | `shield-check` |
| Commercial Cleaning | `sparkles` → *reconsider: `sparkles` can read as decorative rather than a cleaning tool; prefer* `spray-can` |
| Catering | `utensils` |
| Aviation Services | `plane` |
| Concierge | `concierge-bell` |
| Waste & Recycling | `recycle` |
| Government & Public Sector | `landmark` |
| Corporate | `briefcase` |
| Healthcare | `cross` (medical cross, not religious — confirm rendering) or Phosphor `first-aid-kit` |
| Oil & Gas | `flame-kindling` or Phosphor `oil-can` |
| Retail | `shopping-bag` |
| Manufacturing | `factory` |
| Education & Learning | `graduation-cap` |
| Data Centres | `server` |
| Venues | `theater` (Phosphor) or `landmark` variant |
| Phone CTA | `phone` |
| Email CTA | `mail` |
| WhatsApp CTA | official WhatsApp glyph (brand mark, not a generic chat bubble — trademark use, keep as-is; it's the one exception to "no third-party icon set" because it identifies a specific product) |

### Accessibility pattern (mandatory, every icon)

```jsx
// Decorative icon paired with visible text — icon is hidden from AT
<Zap aria-hidden="true" focusable="false" />
<span>Electricals</span>

// Icon-only control (e.g. a button with no visible label) — icon gets the label
<button aria-label="Call Atlas South">
  <Phone aria-hidden="true" focusable="false" />
</button>
```

This directly resolves the audit's finding that emoji icons have no `aria-hidden` and get
read literally by screen readers.

## 6. Where this feeds into the rest of the build

- Hero and Footer specs ([`03-HERO-SECTION-SPEC.md`](03-HERO-SECTION-SPEC.md),
  [`04-FOOTER-SPEC.md`](04-FOOTER-SPEC.md)) both apply the dark-panel 60/30/10 recipe.
- Animation colour cues (focus rings, hover states) in
  [`02-ANIMATION-SYSTEM.md`](02-ANIMATION-SYSTEM.md) use `--color-accent-blue`, never raw
  `--color-brand-blue`, to stay accessible on interactive states.
- Design tokens above should be implemented as an actual `tokens.css` /
  `tailwind.config` theme extension, not re-typed as hex values in components — see the
  shared-styles requirement in [`05-ARCHITECTURE-AND-STACK.md`](05-ARCHITECTURE-AND-STACK.md).
