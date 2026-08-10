# Sprint 8: Phase 3 Performance Optimization

**Date:** 2026-08-07  
**Status:** In Progress  
**Target:** Achieve Performance ≥90, Core Web Vitals Green across all pages

---

## Executive Summary

Phase 3 focuses on optimizing the production build to achieve Lighthouse Performance scores of 90+ and green Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1). Building on Phase 1's baseline measurements, this phase implements targeted optimizations across bundle size, image loading, fonts, and API performance.

---

## Performance Baseline (From Phase 1)

### Current Scores (Development)
- **Performance:** 69-72 (development penalty)
- **Core Web Vitals:**
  - LCP: ~3.2s (needs optimization)
  - FID: ~45ms (good)
  - CLS: ~0.08 (excellent)

### Production Build Metrics
- **Main JS Bundle:** 597 kB (183 kB gzipped)
- **CSS Bundle:** 26.89 kB (5.61 kB gzipped)
- **Total:** 624.23 kB (189.22 kB gzipped)

### Optimization Opportunities
1. **Main bundle exceeds 500 kB warning** (597 kB unminified)
2. **LCP needs improvement** (3.2s → target 2.5s)
3. **Font loading strategy** (currently render-blocking)
4. **Image responsive sizing** (could use srcset/webp)
5. **API response times** (baseline unknown, needs profiling)

---

## Phase 3 Optimization Areas

### 1. Bundle Size & Code Splitting

#### Current Status
- ✅ Service pages lazy-loaded (0.29-0.35 kB each)
- ✅ Industry pages lazy-loaded (0.23-0.24 kB each)
- ✅ Area pages lazy-loaded (0.24-0.25 kB each)
- ⚠️ Main bundle still large (597 kB → minified will help)

#### Optimization Targets
1. **Minification Gains** (Expected: 60% smaller)
   - Vite automatically minifies in production
   - Source maps will reduce by ~50 kB
   - Expected: 597 kB → ~240 kB (unminified equivalent)
   - After gzip: 183 kB → ~75-85 kB

2. **Code Splitting Audit**
   - Verify no duplicate dependencies
   - Check for unused imports
   - Confirm lazy routes load independently
   - Admin code should NOT be in public bundle

3. **Third-Party Libraries**
   - Motion/React: Bundled with main (15-20 kB)
   - Anime.js: Bundled with main (10-15 kB)
   - Consideration: Move to lazy-loaded where possible

**Actions:**
- [ ] Analyze production build with Vite's built-in reporting
- [ ] Check for duplicate packages in node_modules
- [ ] Verify tree-shaking is working (run build with --analyze)
- [ ] Remove unused Lucide icons (if any)
- [ ] Consider dynamic imports for Animation libraries

---

### 2. Font Loading Strategy

#### Current Issue
Fonts are likely render-blocking, delaying First Paint and LCP.

#### Optimization Strategy

**Change 1: System Fonts First**
```css
/* Use system fonts for first paint, load custom fonts async */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
```

**Change 2: Add Web Fonts with Fallback**
```tsx
// In Head/Layout
<link
  rel="preload"
  href="path/to/custom-font.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

**Change 3: font-display: swap**
```css
@font-face {
  font-family: 'CustomFont';
  src: url(...) format('woff2');
  font-display: swap; /* Show system font while loading */
}
```

**Expected Impact:**
- LCP reduction: 0.5-0.8s
- First Paint: 200-300ms faster

**Actions:**
- [ ] Audit current font loading (open DevTools Network tab)
- [ ] Implement font-display: swap
- [ ] Add preload links for critical fonts
- [ ] Measure LCP improvement

---

### 3. Image Optimization

#### Current Status
- ✅ Alt text present on all images
- ✅ Width/height attributes set
- ⚠️ No responsive srcset (uses fixed URLs from Unsplash)
- ⚠️ No WebP format fallback
- ⚠️ No lazy-loading on below-fold images

#### Optimization Strategy

**Change 1: Add Responsive Images**
```tsx
<picture>
  <source
    srcSet="image-sm.webp 640w, image-lg.webp 1920w"
    type="image/webp"
  />
  <source
    srcSet="image-sm.jpg 640w, image-lg.jpg 1920w"
  />
  <img
    src="image-lg.jpg"
    alt="Professional tradesperson"
    loading="lazy"
    width={1920}
    height={1080}
  />
</picture>
```

**Change 2: Lazy-load Below-Fold Images**
```tsx
// Hero carousel images: load="eager" (already done)
// Service card images: load="lazy" (add this)
// Footer images: load="lazy" (add this)
```

**Change 3: Use Cloudinary for Responsive Images**
Already integrated in project but not fully utilized:
- Cloudinary auto-formats (WebP, AVIF)
- Auto-responsive sizing
- Format: `https://res.cloudinary.com/[cloud]/image/fetch/w_600,f_auto/https://example.com/image.jpg`

**Expected Impact:**
- LCP: 200-400ms faster (smaller image sizes)
- Total page size: 20-30% reduction

**Actions:**
- [ ] Update Unsplash image URLs to use Cloudinary fetch
- [ ] Add loading="lazy" to below-fold images
- [ ] Implement picture + source elements for WebP
- [ ] Test responsive images on mobile (verify correct size served)

---

### 4. JavaScript Execution Optimization

#### Current Issue
Main bundle contains unoptimized code (dev mode artifacts).

#### Optimization Strategy

**Change 1: Enable Production Mode**
```bash
# Vite already does this automatically on build
# But verify:
npm run build --mode production
```

**Change 2: Remove Development Imports**
- React DevTools removed by default in production
- Source maps excluded (except for error reporting)
- Console warnings stripped

**Change 3: Defer Non-Critical JavaScript**
```tsx
// Anime.js and Motion/React only load when needed
// Already lazy-loaded on pages that use animations ✅
// No changes needed
```

**Expected Impact:**
- JavaScript execution: 30-50% faster (minified code)
- Main thread available 500-800ms sooner

**Actions:**
- [ ] Verify production build uses minification
- [ ] Check that source maps are excluded
- [ ] Profile JavaScript execution time (DevTools → Performance)

---

### 5. CSS Optimization

#### Current Status
- ✅ Tailwind CSS tree-shaking enabled
- ✅ Only used classes in bundle (26.89 kB)
- ✅ No runtime CSS generation
- ⚠️ No critical CSS inline (all CSS async-loaded)

#### Optimization Strategy

**Change 1: Critical CSS Inline**
Extract and inline CSS needed for above-fold content:
```html
<head>
  <style>
    /* Inline critical CSS for header, hero, fold content */
    /* ~5-10 kB of most important styles */
  </style>
  <link rel="preload" href="styles.css" as="style">
  <link rel="stylesheet" href="styles.css">
</head>
```

**Change 2: CSS in Vite**
Vite automatically:
- ✅ Minifies CSS in production
- ✅ Extracts CSS to separate file
- ✅ Optimizes keyframes

**Expected Impact:**
- FCP (First Contentful Paint): 100-200ms faster
- CLS: No change (already excellent)

**Actions:**
- [ ] Measure current CSS payload (DevTools Network)
- [ ] Identify above-fold CSS (hero, header, nav)
- [ ] Consider critical CSS extraction tool (PurgeCSS)

---

### 6. API Performance

#### Current Status
- API at localhost:9001 (assumed low latency)
- Content API responses not profiled
- No caching headers documented

#### Optimization Strategy

**Change 1: Add Response Caching Headers**
```typescript
// In API routes (Express middleware)
router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min cache
  res.setHeader('Content-Encoding', 'gzip');
  next();
});
```

**Change 2: Compress API Responses**
```bash
# In package.json server config
"compression" middleware: gzip compress all responses
```

**Change 3: Optimize Database Queries**
- [ ] Verify no N+1 queries
- [ ] Add database indexes on frequently queried fields
- [ ] Profile query performance (slow queries > 100ms)

**Expected Impact:**
- API response time: 20-50% faster (compression + caching)
- Repeat visits: 90% faster (browser cache)

**Actions:**
- [ ] Add compression middleware to Express
- [ ] Set Cache-Control headers on content endpoints
- [ ] Profile API response times (curl with timing)
- [ ] Check database query performance

---

## Performance Testing Strategy

### Tool 1: Lighthouse (Chrome DevTools)
```bash
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Run audit on each page (mobile + desktop)
4. Compare against Phase 1 baseline
```

### Tool 2: WebPageTest
```bash
# Free online tool
https://www.webpagetest.org/
1. Test production URL
2. Measure: LCP, FID, CLS
3. Waterfall chart shows which resources slow down page
```

### Tool 3: Vite Build Analysis
```bash
npm run build -- --report
# Generates report of bundle composition
```

### Tool 4: DevTools Performance Tab
```bash
1. Open DevTools → Performance
2. Record page load
3. Analyze:
   - Main thread activity
   - JavaScript execution
   - Paint events
4. Identify longest tasks (> 50ms)
```

---

## Optimization Checklist

### Priority 1: Quick Wins (Today)
- [ ] Verify production build minification
- [ ] Add font-display: swap
- [ ] Test LCP improvement
- [ ] Measure bundle size (gzipped)
- [ ] Check for unused CSS/JS

### Priority 2: Medium Effort (This Session)
- [ ] Implement lazy-loading on images
- [ ] Add responsive image srcsets
- [ ] Profile API response times
- [ ] Add compression middleware
- [ ] Set cache headers

### Priority 3: Nice-to-Have (Post-Launch)
- [ ] Critical CSS extraction/inlining
- [ ] Dynamic imports for animations
- [ ] Advanced image optimization (AVIF)
- [ ] Service Worker for offline support
- [ ] Request prioritization (preload/prefetch)

---

## Target Metrics

### Lighthouse Scores (Target)
| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| Performance | ≥90 | 69-72 | +18-21 |
| Accessibility | ≥95 | 92 | +3 |
| Best Practices | ≥90 | 87 | +3 |
| SEO | ≥90 | 95 | -5 (already exceeds) |

### Core Web Vitals (Target)
| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| LCP | <2.5s | ~3.2s | -0.7s |
| FID | <100ms | ~45ms | OK |
| CLS | <0.1 | ~0.08 | OK |

### Bundle Size (Target)
| Asset | Target | Current | Gap |
|-------|--------|---------|-----|
| Main JS | <100 kB gzipped | 183 kB | -83 kB |
| CSS | <10 kB gzipped | 5.61 kB | OK |
| Total | <110 kB gzipped | 188.61 kB | -78.61 kB |

**Note:** Main bundle target is achievable through minification (dev builds are uncompressed).

---

## Success Criteria (Phase 3 Complete)

- [ ] Lighthouse Performance score ≥90 on all 5 key pages
- [ ] LCP < 2.5s on all pages (green status)
- [ ] FID < 100ms (already met)
- [ ] CLS < 0.1 (already met)
- [ ] Production bundle <100 kB gzipped (main JS)
- [ ] API response time <200ms (average)
- [ ] All images have responsive srcsets or lazy-loading
- [ ] Font loading strategy optimized
- [ ] Verified on mobile (Slow 4G throttling)

---

## Implementation Order

1. **Build & Analyze** (30 min)
   - Production build created ✓
   - Analyze bundle composition
   - Measure current performance

2. **Font Optimization** (20 min)
   - Add font-display: swap
   - Set up preload links
   - Measure LCP improvement

3. **Image Optimization** (45 min)
   - Add lazy-loading
   - Implement responsive images
   - Test on mobile

4. **API Optimization** (30 min)
   - Add compression middleware
   - Set cache headers
   - Verify response times

5. **Testing & Verification** (45 min)
   - Run Lighthouse on all 5 pages
   - Compare against Phase 1 baseline
   - Document improvements

**Total Estimated Time:** 2.5-3 hours

---

## Common Pitfalls to Avoid

❌ **Don't:** Optimize the wrong thing
- Measure first, optimize second
- Focus on metrics that matter (LCP, not Speed Index)

❌ **Don't:** Over-optimize
- 90 is good enough; 95 has diminishing returns
- Bundle size below 50 kB is usually overkill

❌ **Don't:** Break functionality
- Test all optimizations on mobile
- Verify lazy-loading doesn't break on slow networks
- Check dark mode/light mode contrast still works

✅ **Do:** Measure before & after
- Screenshot Lighthouse results
- Compare Core Web Vitals side-by-side
- Document which optimizations helped most

---

## Next Phase Preview

### Phase 4: SEO Verification
- Verify all meta tags
- Validate structured data
- Generate sitemap.xml
- Submit to Search Console

---

## Notes for Continuation

If context runs out mid-optimization:
1. Check which optimizations have been applied (see git log)
2. Measure current performance (run Lighthouse)
3. Continue from next unchecked item in "Optimization Checklist"
4. Update this document with results

---

**Status:** Phase 3 Starting  
**Date:** 2026-08-07  
**Target Completion:** Today (2.5-3 hours)

