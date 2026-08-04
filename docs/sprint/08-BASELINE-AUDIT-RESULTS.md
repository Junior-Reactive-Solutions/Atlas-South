# Sprint 8: Phase 1 Baseline Measurements

**Date:** 2026-08-04  
**Environment:** Development (localhost:9000)  
**Browser:** Chrome (latest)  
**Throttling:** Mobile 4G, Desktop normal

---

## Audit Summary

### Pages Audited (5 Key Page Types)

| # | Page | Type | URL | Status |
|---|------|------|-----|--------|
| 1 | Home | Homepage | `http://localhost:9000` | ⏳ Pending |
| 2 | Plumbing | Service | `http://localhost:9000/hard-services/plumbing` | ⏳ Pending |
| 3 | Corporate | Industry | `http://localhost:9000/industries/corporate` | ⏳ Pending |
| 4 | Central London | Area | `http://localhost:9000/areas/central-london` | ⏳ Pending |
| 5 | About | Company | `http://localhost:9000/company` | ⏳ Pending |

---

## Baseline Measurement Procedures

### How to Run Lighthouse Audits

#### Mobile (Mobile 4G throttling)
1. Open DevTools (F12)
2. Go to **Lighthouse** tab
3. **Device:** Mobile
4. **Throttling:** Slow 4G
5. **Clear storage:** Yes
6. Click **Analyze page load**
7. Wait 2-3 minutes
8. Screenshot results
9. Record all 4 scores

#### Desktop (Unthrottled)
1. Repeat steps 1-3
2. **Device:** Desktop
3. **Throttling:** No throttling
4. Steps 5-8 same

---

## Phase 1 Results (To Be Filled)

### Page 1: Home (Homepage)

#### Mobile (Slow 4G)
- **Performance:** TBD
- **Accessibility:** TBD
- **Best Practices:** TBD
- **SEO:** TBD
- **LCP:** TBD
- **FID:** TBD
- **CLS:** TBD

**Top 3 Performance Issues:**
1. TBD
2. TBD
3. TBD

**Top 3 Accessibility Issues:**
1. TBD
2. TBD
3. TBD

#### Desktop (Unthrottled)
- **Performance:** TBD
- **Accessibility:** TBD
- **Best Practices:** TBD
- **SEO:** TBD

---

### Page 2: Plumbing (Service Detail)

#### Mobile
- **Performance:** TBD
- **Accessibility:** TBD
- **Best Practices:** TBD
- **SEO:** TBD

#### Desktop
- **Performance:** TBD
- **Accessibility:** TBD
- **Best Practices:** TBD
- **SEO:** TBD

---

### Page 3: Corporate (Industry Detail)

#### Mobile
- **Performance:** TBD
- **Accessibility:** TBD
- **Best Practices:** TBD
- **SEO:** TBD

#### Desktop
- **Performance:** TBD
- **Accessibility:** TBD
- **Best Practices:** TBD
- **SEO:** TBD

---

### Page 4: Central London (Area Detail)

#### Mobile
- **Performance:** TBD
- **Accessibility:** TBD
- **Best Practices:** TBD
- **SEO:** TBD

#### Desktop
- **Performance:** TBD
- **Accessibility:** TBD
- **Best Practices:** TBD
- **SEO:** TBD

---

### Page 5: About (Company Page)

#### Mobile
- **Performance:** TBD
- **Accessibility:** TBD
- **Best Practices:** TBD
- **SEO:** TBD

#### Desktop
- **Performance:** TBD
- **Accessibility:** TBD
- **Best Practices:** TBD
- **SEO:** TBD

---

## Development Environment Notes

### Current Stack (Relevant to Performance)

**Frontend:**
- React 18 + Vite (dev server)
- Tailwind CSS (tree-shaking enabled)
- Motion/React (lazy loaded on pages that use animations)
- Anime.js v4 (lazy loaded for complex animations)
- Lucide React icons (tree-shaken to 50 icons)
- Code splitting: lazy routes for service/industry/area pages ✓

**API:**
- Node.js + Express (localhost:9001)
- Prisma with PostgreSQL (Neon serverless)
- Content caching: GET /api/content/:slug responses
- Analytics: async page-view + event tracking

### Known Dev Environment Issues
- Vite HMR cache may affect first load timing
- No minification/compression (production mode needed for accurate metrics)
- Source maps included (removes ~50KB from bundle)
- Database cold starts on first query

### What to Ignore in Dev
- Absolute performance numbers (dev server is unoptimized)
- Server response times (localhost not representative)
- JavaScript execution time (no minification)

### What Matters in Dev
- **Accessibility issues** (same in prod/dev)
- **Structural problems** (missing alt text, semantic HTML)
- **Severe performance patterns** (N+1 queries, render-blocking scripts)
- **Layout instability** (CLS is same dev/prod)
- **Contrast/color issues** (same in both)

---

## Accessibility Quick Checklist (Manual)

Before running Lighthouse, manually check these:

- [ ] Can tab through home page without mouse?
- [ ] Can access all buttons and links with keyboard?
- [ ] Do buttons have visible focus indicators (not just outline)?
- [ ] Are form labels associated with inputs?
- [ ] Do images have alt text (or marked as decorative)?
- [ ] Are headings semantic (h1, h2, not just styled divs)?
- [ ] Do colors have sufficient contrast (eyeball test with Lighthouse)?
- [ ] Are interactive elements at least 44x44px (touch targets)?

---

## Next Steps

1. **Verify icons are rendering** (all pages should show expected icons)
2. **Manual accessibility spot-check** (keyboard navigation, focus indicators)
3. **Run Lighthouse on all 5 pages** (record 8 scores: mobile + desktop × 4 metrics)
4. **Document top 3 issues per page per metric** (for Phase 2 prioritization)
5. **Screenshot results** (for before/after comparison in Phase 3-4)

---

## Baseline Complete When

- [ ] All 5 pages audited (mobile + desktop)
- [ ] All 40 scores recorded (5 pages × 2 devices × 4 metrics)
- [ ] Top issues documented for each page
- [ ] Screenshots captured
- [ ] This file updated with results

**Estimated Time:** 1-2 hours (Lighthouse runs ~2-3 min per page)
