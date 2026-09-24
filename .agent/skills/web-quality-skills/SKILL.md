---
name: web-quality-skills
description: Web quality and Core Web Vitals optimization guidelines targeting Lighthouse 90+ across Performance, Accessibility, Best Practices, and SEO.
license: MIT
metadata:
  version: 1.0.0
  category: performance-quality
  tags: lighthouse, cwv, lcp, inp, cls, web-quality
---

# Web Quality & Core Web Vitals Optimization

## Metrics & Targets
1. **Largest Contentful Paint (LCP < 2.5s):**
   - Preload or prioritize above-the-fold hero images (`priority` flag on first 4 products).
   - Deliver optimized WebP format with size boundaries using media resolver.
2. **Interaction to Next Paint (INP < 200ms):**
   - Defer non-critical client operations using React 19 transitions and lightweight native DOM hooks.
   - Eliminate long tasks and excessive re-renders during state mutations.
3. **Cumulative Layout Shift (CLS < 0.1):**
   - Reserve explicit aspect ratio / dimensions on all images and dynamic banners.
   - Never inject layout elements dynamically above viewport content.
4. **Accessibility (Target 100):**
   - Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`).
   - High color contrast ratio for text and iconography.
   - Full keyboard navigability on interactive modals and drawers.
