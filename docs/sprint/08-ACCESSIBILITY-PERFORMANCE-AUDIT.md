# Sprint 8: Accessibility & Performance Audit

**Objective:** Achieve WCAG 2.1 Level AA accessibility compliance and Lighthouse green scores across all public pages before launch.

**Target Timeline:** 3-4 days

---

## Phase 1: Baseline Measurements

### Lighthouse Audit (5 Key Page Types)

| Page | Type | URL | Performance | Accessibility | Best Practices | SEO |
|------|------|-----|-------------|----------------|-----------------|-----|
| Home | Homepage | `http://localhost:9000` | TBD | TBD | TBD | TBD |
| Service Detail | Service | `http://localhost:9000/hard-services/plumbing` | TBD | TBD | TBD | TBD |
| Industry Detail | Industry | `http://localhost:9000/industries/corporate` | TBD | TBD | TBD | TBD |
| Area Detail | Area | `http://localhost:9000/areas/central-london` | TBD | TBD | TBD | TBD |
| Company | Company | `http://localhost:9000/company` | TBD | TBD | TBD | TBD |

### Core Web Vitals Baseline
- **LCP (Largest Contentful Paint):** < 2.5s (Target: Green)
- **FID (First Input Delay):** < 100ms (Target: Green)
- **CLS (Cumulative Layout Shift):** < 0.1 (Target: Green)

### Procedure
1. Open DevTools → Lighthouse tab
2. Run audit with Mobile throttling
3. Record all 4 scores
4. Take screenshot of audit results
5. Identify top 3 issues per category

---

## Phase 2: Accessibility Audit

### WCAG 2.1 Level AA Checklist

#### Automated Scanning (Axe DevTools)
- [ ] Install Axe DevTools browser extension
- [ ] Scan home page for violations
- [ ] Scan service/industry/area pages
- [ ] Scan admin pages (if applicable)
- [ ] Document all "Critical" and "Serious" issues
- [ ] Verify "Best Practices" are followed

#### Manual Testing

**Keyboard Navigation**
- [ ] Can all interactive elements be reached via Tab key?
- [ ] Is tab order logical and predictable?
- [ ] Can forms be submitted via keyboard only?
- [ ] Are skip links present and functional?

**Color Contrast**
- [ ] Text on backgrounds meet 4.5:1 (normal text)
- [ ] UI components meet 3:1 (graphics)
- [ ] Hover states have sufficient contrast
- [ ] Focus indicators are visible (3:1 minimum)

**Screen Reader Compatibility**
- [ ] All headings are semantic (`<h1>`, `<h2>`, etc.)
- [ ] Images have alt text (or `alt=""` if decorative)
- [ ] Form labels are associated with inputs
- [ ] ARIA roles are used correctly (no redundancy)
- [ ] List items use `<ul>`/`<ol>`/`<li>` elements
- [ ] Navigation landmarks present

**Forms Accessibility**
- [ ] Form fields have associated labels
- [ ] Error messages are associated with fields
- [ ] Required fields are marked (and explained to screen readers)
- [ ] Placeholder text is not used as label substitute

#### Issues to Fix (Priority Order)
1. **Critical Issues** (blocks access) - Fix immediately
2. **Serious Issues** (major impact) - Fix before launch
3. **Moderate Issues** (noticeable) - Fix or document waiver
4. **Minor Issues** (edge cases) - Consider in Phase 4

---

## Phase 3: Performance Optimization

### Bundle Analysis
- [ ] Check `/dist/` build output size
- [ ] Verify lazy routes are not loading upfront
- [ ] Audit `node_modules` for bloat (unused dependencies)
- [ ] Check Gzip compression on all assets

### Image Optimization
- [ ] Verify Cloudinary integration (responsive images)
- [ ] Check lazy-loading on off-screen images
- [ ] Audit SVG files for optimization
- [ ] Verify WebP fallbacks for modern formats

### Code Splitting Review
- [ ] Service pages (11) load independently ✓ (done in Phase 3)
- [ ] Industry pages (4) load independently ✓ (done in Phase 3)
- [ ] Area pages (6) load independently ✓ (done in Phase 3)
- [ ] Company pages lazy-load ✓ (done in Phase 4)
- [ ] Admin pages not loaded on public site ✓

### JavaScript Optimization
- [ ] Main bundle excludes admin code paths
- [ ] Animation libraries (anime.js, motion/react) conditionally loaded
- [ ] React DevTools stripped from production
- [ ] Source maps minified or excluded

### CSS Optimization
- [ ] Tailwind CSS is purged (only used classes)
- [ ] No duplicate styles in bundle
- [ ] Critical CSS above the fold
- [ ] Font loading is optimized

### API Performance
- [ ] Content API responses < 200ms
- [ ] Analytics events fire asynchronously
- [ ] No blocking API calls on page load

---

## Phase 4: SEO Verification

### On-Page SEO

**Meta Tags**
- [ ] Every page has unique `<title>` (50-60 chars)
- [ ] Every page has unique `<meta description>` (150-160 chars)
- [ ] Canonical tags present on all pages
- [ ] `<meta viewport>` set for responsive
- [ ] Open Graph tags on key pages (home, service samples)

**Structured Data (JSON-LD)**
- [ ] Organization schema on home page ✓ (verified in Phase 3)
- [ ] LocalBusiness schema on contact pages ✓ (verified in Phase 4)
- [ ] Service schema on service pages ✓ (verified in Phase 3)
- [ ] BreadcrumbList on service/industry/area pages

**Technical SEO**
- [ ] robots.txt exists and is correct
- [ ] sitemap.xml generated and complete
- [ ] No duplicate content across pages
- [ ] No 404 errors in crawl
- [ ] No redirect chains

**Mobile & Performance**
- [ ] Mobile-friendly test passes (Google)
- [ ] Viewport is configured correctly
- [ ] Touch targets are 48x48px minimum
- [ ] Text is readable without zooming

### Off-Page SEO
- [ ] Google Search Console integration ready (Phase 9)
- [ ] Google Analytics 4 configured (Phase 3 done)
- [ ] Schema markup validates at schema.org

---

## Target Metrics

### Lighthouse Scores (All Pages)
- **Performance:** ≥ 90
- **Accessibility:** ≥ 95
- **Best Practices:** ≥ 90
- **SEO:** ≥ 90

### Core Web Vitals (All Pages)
- **LCP:** < 2.5s (Green)
- **FID:** < 100ms (Green)
- **CLS:** < 0.1 (Green)

### Accessibility Compliance
- **WCAG 2.1 Level AA:** 100% conformance
- **Axe Violations:** 0 critical, 0 serious
- **Keyboard Navigation:** Fully functional
- **Screen Reader:** All content accessible

### PageSpeed Insights
- **Mobile:** ≥ 90
- **Desktop:** ≥ 95

---

## Issue Tracking Template

For each issue found, document:

```markdown
### [Category] - [Component/Page]

**Severity:** Critical | Serious | Moderate | Minor

**Issue:** [Brief description]

**WCAG Criterion:** [e.g., 1.4.3 Contrast (Minimum), 2.1.1 Keyboard]

**Current State:** [Screenshot or code snippet]

**Recommended Fix:** [Specific action]

**Files to Change:** [List affected files]

**Acceptance Criteria:** [How to verify it's fixed]
```

---

## Rollout Plan

### If major accessibility issues found (>10 critical)
- [ ] Create `hotfix/accessibility` branch
- [ ] Fix critical issues immediately
- [ ] Defer moderate/minor to Phase 9
- [ ] Re-test all 5 page types before merge

### If performance issues found (Lighthouse <85)
- [ ] Profile with Chrome DevTools Performance tab
- [ ] Identify slowest operations
- [ ] Optimize in order: largest impact first
- [ ] Re-test after each optimization

### If SEO issues found
- [ ] Generate sitemap.xml
- [ ] Verify robots.txt
- [ ] Update structured data
- [ ] Submit to Search Console (Phase 9)

---

## Sign-Off

**Auditor:** [Claude Code]
**Date:** [Sprint 8]
**Status:** In Progress

**Approval Required Before Phase 9:**
- [ ] All 5 page types audit ≥90 score
- [ ] Zero critical accessibility violations
- [ ] Core Web Vitals all Green
- [ ] Mobile PageSpeed ≥90
