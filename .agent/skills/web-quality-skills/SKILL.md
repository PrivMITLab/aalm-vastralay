---
name: web-quality-skills
description: Web quality and Core Web Vitals optimization guidelines targeting Lighthouse 90+ across Performance, Accessibility, Best Practices, and SEO. Verified against Aalm Vastralay production implementation.
license: MIT
metadata:
  version: 2.0.0
  category: performance-quality
  tags: lighthouse, cwv, lcp, inp, cls, web-quality, a11y, seo, pwa
---

# Web Quality & Core Web Vitals Optimization

## Metrics & Targets
1. **Largest Contentful Paint (LCP < 2.5s):**
   - Preload first hero carousel slide with `priority` flag + `fetchPriority="high"`.
   - Deliver optimized WebP via `wsrv.nl` (`quality=70&output=webp`).
   - Slides 2-5: lazy-loaded with async decoding.
2. **Interaction to Next Paint (INP < 200ms):**
   - Defer non-critical operations using React 19 transitions.
   - Eliminate long tasks; use `useFormLock()` to prevent double-submit re-renders.
3. **Cumulative Layout Shift (CLS < 0.1 = 0):**
   - Reserve explicit `aspect-[16/10] sm:aspect-[21/9]` on hero carousel and `min-h` constraints.
   - Never inject layout elements above viewport after paint.
4. **Accessibility (Target 100):**
   - Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`.
   - WCAG 2.1 AA minimum contrast (4.5:1); AA+ on product titles and prices.
   - 44×44px minimum touch targets on all interactive elements.
   - Full keyboard navigability on modals, drawers, carousels, and accordions.
   - `aria-live="polite"` on carousel for screen reader announcements.
   - `prefers-reduced-motion`: static fallback for all animations.

## SEO & PWA Requirements
- Every page: `<title>`, `<meta description>`, OpenGraph tags, and canonical URL.
- Sitemap filtered to active in-stock products with `stock > 0`.
- Service Worker: dual-cache strategy (cache-first static, network-first dynamic).
- `manifest.json` + `manifest.ts` for PWA install support.
- JSON-LD structured data on product and homepage (escaped with `\u003c` guard).

## Image Optimization Pipeline
- Local uploads → Backblaze B2 → Cloudflare Worker proxy → 1-year immutable cache.
- External images → `wsrv.nl` WebP compression (quality=70) → 7-day Cache-Control.
- Magic byte validation before upload: JPEG, PNG, WebP, AVIF, GIF, SVG.
- `<SmartImage>` resilient 5-tier fallback chain: B2 → wsrv → direct → placeholder.

## Indian Mobile Network Performance
- First Contentful Paint < 1.5s on 4G (Jio/Airtel average 15-20 Mbps).
- All critical CSS inlined; no render-blocking stylesheets.
- Next.js App Router static generation (ISR) on product listings with 300s revalidate.

