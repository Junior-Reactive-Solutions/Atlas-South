# Animation System — anime.js v4

Client requirement: every animation site-wide (buttons, nav, cards, page/scroll
transitions) comes from anime.js, and every instance of the same element type animates
identically no matter which page it's on. This document is the single reference for how
anime.js is wired into React and the exact motion spec per component type — component
code should import these values/patterns rather than hand-rolling new timings.

## 1. Package & API (verified against the official v4 docs, 2026-07-30)

```bash
npm install animejs
```

```js
import { animate, createScope, createTimeline, stagger, onScroll } from 'animejs';
```

v4's core primitives, confirmed from the official documentation:

- `animate(targets, params)` — the core tween function (replaces v3's `anime()` call).
- `createTimeline()` — sequenced animations/timers with position control.
- `stagger(value, options)` — distributes timing across multiple targets (grids,
  ranges, from-center, etc.).
- `onScroll` / scroll observer — threshold-based, scroll-position-triggered playback.
- Easing: named eases (`'inOut(3)'`, `'out(4)'` etc.), cubic-bezier, `spring({ bounce })`,
  linear, steps.

### Official React integration pattern (quoted from `animejs.com/documentation/getting-started/using-with-react`)

```jsx
import { animate, createScope, spring, createDraggable } from 'animejs';
import { useEffect, useRef, useState } from 'react';

function Component() {
  const root = useRef(null);
  const scope = useRef(null);

  useEffect(() => {
    scope.current = createScope({ root }).add(self => {
      animate('.logo', {
        scale: [
          { to: 1.25, ease: 'inOut(3)', duration: 200 },
          { to: 1, ease: spring({ bounce: .7 }) },
        ],
        loop: true,
        loopDelay: 250,
      });

      // Register named, replayable animations on the scope
      self.add('rotateLogo', (i) => {
        animate('.logo', { rotate: i * 360, ease: 'out(4)', duration: 1500 });
      });
    });

    return () => scope.current.revert(); // mandatory cleanup
  }, []);

  return <div ref={root}>{/* ... */}</div>;
}
```

**This scope + cleanup pattern is mandatory for every component that animates.**
`createScope({ root }).add(...)` scopes all selectors to that component's DOM subtree
(so `.card` in one component never accidentally animates a `.card` in another), and the
`return () => scope.current.revert()` teardown is what prevents animation leaks and
duplicate listeners on route changes in the React SPA — skipping it is a memory-leak bug,
not a style choice.

## 2. Shared motion tokens

Defined once, imported everywhere a component animates — this is what makes "every page,
no matter how far from the homepage, has the same standard of animation" actually true
rather than aspirational.

```js
// src/lib/motion-tokens.js
export const DURATION = {
  instant: 120,   // micro-interactions: icon colour flip, checkbox toggle
  fast: 220,       // button/link hover, nav underline
  base: 320,       // card hover-lift, dropdown open/close
  slow: 480,       // scroll-reveal entrance, page-section fade-in
  hero: 700,       // hero entrance sequence only
};

export const EASE = {
  standard: 'out(3)',        // default for entrances and hovers
  emphasis: 'inOut(3)',      // state changes (open/close, expand/collapse)
  spring: { bounce: 0.35 },  // CTA button press feedback only — used sparingly
};

export const STAGGER_GAP = 60; // ms between staggered children (cards, nav items, footer columns)
```

## 3. Component-by-component animation catalogue

Every row below is the **only** approved animation for that element type. A component
implementation should reference this table, not invent a new curve.

| Element | Trigger | Animation | Params |
|---|---|---|---|
| **Header nav link** | hover/focus | underline grows left→right | `scaleX` 0→1, `DURATION.fast`, `EASE.standard`, `transform-origin: left` |
| **Header nav dropdown** (Company/Hard/Soft/Industries) | click/hover | fade + slide down 8px | opacity 0→1, translateY -8→0, `DURATION.base`, `EASE.standard` |
| **Mobile nav drawer** | hamburger tap | slide in from right + backdrop fade | translateX 100%→0, `DURATION.base`, `EASE.emphasis`; items inside `stagger(STAGGER_GAP)` fade-up |
| **Primary CTA button** | hover | subtle scale + shadow lift | scale 1→1.03, `DURATION.fast`, `EASE.standard` |
| **Primary CTA button** | active/press | spring squash | scale →0.97→1, `EASE.spring` |
| **Secondary/outline button** | hover | background fill wipe | background-position or clip-path 0→100%, `DURATION.fast` |
| **Service/Industry card** | scroll into view | fade + rise | opacity 0→1, translateY 24→0, `DURATION.slow`, `EASE.standard`, triggered via `onScroll` with a ~20% threshold |
| **Card grid** (services, industries, footer columns) | scroll into view | `stagger(STAGGER_GAP)` applied across siblings so cards cascade rather than pop together | same params as single card, staggered |
| **Card** | hover | lift + border accent | translateY 0→-4, border-color transitions to `--color-accent-blue`, `DURATION.fast` |
| **Hero headline** | page load | word/line stagger fade-up | translateY 16→0, opacity 0→1, `stagger(80)` per line, `DURATION.hero`, plays once on mount — see [`03-HERO-SECTION-SPEC.md`](03-HERO-SECTION-SPEC.md) for the full choreography |
| **Hero CTA** | page load | fades in after headline (timeline-sequenced, not simultaneous) | `createTimeline()` position offset `-=200` after headline |
| **Stat counters** (700+ clients, 12k+ jobs) | scroll into view, once | number count-up | animate a numeric value 0→target via `animate({ innerHTML: [0, target], round: 1 })`, `DURATION.slow` |
| **Accordion / FAQ item** | click | height expand/collapse | height auto via measured px, `DURATION.base`, `EASE.emphasis` |
| **Form field** | focus | label float + border accent colour | translateY + colour transition, `DURATION.instant` |
| **Form submit** | click → pending → success | button label crossfade to spinner, then to a checkmark icon on success | `DURATION.fast` per state swap |
| **Toast/inline alert** (form success/error) | appear | slide down + fade from top of form | translateY -12→0, opacity 0→1, `DURATION.fast` |
| **Page route transition** | route change (React Router) | outgoing page fades/slides out, incoming fades/slides in | opacity + translateY 8px, `DURATION.base`, sequenced via timeline so there's no flash of unstyled content |
| **Footer columns** | scroll into view | same card-grid stagger pattern as service cards, for consistency | reuses the service-card token set exactly |
| **Modal / dialog** (e.g. image lightbox on case studies) | open/close | scale + fade from trigger origin | scale 0.95→1, opacity 0→1, `DURATION.base` |
| **Admin dashboard data widgets** | data load | same fade+rise as public cards | reuses public card tokens — admin UI is not a separate animation system |

## 4. Reduced motion

`prefers-reduced-motion: reduce` must disable all non-essential motion (everything above
except opacity fades, which are kept at a much shorter duration for state legibility).
Implement once as a wrapper:

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration = prefersReducedMotion ? 1 : DURATION.base;
```

This is a WCAG 2.1 requirement (2.3.3 Animation from Interactions) and directly continues
the accessibility remediation already committed to in the audit.

## 5. Implementation note — a shared hook, not per-component boilerplate

To guarantee uniformity (client's explicit requirement) rather than trusting every
component author to copy the scope/cleanup pattern correctly, wrap it once:

```js
// src/hooks/useAnimationScope.js
import { useEffect, useRef } from 'react';
import { createScope } from 'animejs';

export function useAnimationScope(setup) {
  const root = useRef(null);
  const scope = useRef(null);
  useEffect(() => {
    scope.current = createScope({ root }).add(setup);
    return () => scope.current.revert();
  }, []);
  return root;
}
```

Every animated component uses `useAnimationScope` rather than reimplementing
`createScope`/`useEffect`/cleanup — this is what makes "same standard of animation for
each element, no matter how far from the homepage" enforceable in code review rather than
just a design intention.
