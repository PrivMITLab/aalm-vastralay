---
name: agentic-seo
description: Comprehensive technical SEO, Schema.org JSON-LD structured data, metadata optimization, Core Web Vitals, and AI Search (GEO/AEO) optimization.
license: MIT
metadata:
  version: 1.0.0
  category: marketing-seo
  tags: seo, schema, json-ld, sitemap, robots, core-web-vitals, aeo, geo
---

# Agentic SEO & Search Intelligence

## Core Requirements
1. **Metadata Architecture:**
   - Every page exports dynamic `generateMetadata`: Title (50-60 chars, e.g. "Royal Bridal Lehenga – Aalm Vastralay"), Description (150-160 chars), OpenGraph, and Twitter cards.
   - Set `metadataBase` to avoid domain resolution warnings.
2. **Structured Data (Schema.org JSON-LD):**
   - **Product Schema:** `name`, `image`, `description`, `sku`, `offers` (price, `priceCurrency: 'INR'`, `availability: 'https://schema.org/InStock'`), `aggregateRating` (ratingValue, reviewCount).
   - **BreadcrumbList Schema:** Ordered list of category parents and item slugs.
   - **Organization Schema:** Name, logo, contactPoint, telephone, address in Bihar, India.
3. **Crawlability & Search Engine Visibility:**
   - `robots.ts` allows indexation of public routes, blocks private `/admin/` and `/seller/` portals, and points to `sitemap.xml`.
   - `sitemap.ts` dynamically generates entries for all active products, categories, stores, and static pages with `lastModified` and `changeFrequency`.
4. **AI Engine Optimization (AEO / GEO):**
   - Maintain `public/llms.txt` summarizing brand catalog, pricing transparency, and store policies for AI search agents (Perplexity, ChatGPT, Claude, Gemini).
