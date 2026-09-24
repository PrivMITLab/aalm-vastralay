# 👑 AALM VASTRALAY — BRAND IDENTITY & 53-ICON SYSTEM SPECIFICATION

> **Version:** 2.0.0  
> **Status:** Active & Verified Production Standard  
> **Architecture Decision:** [ADR 014: Luxury Ethnic Brand Identity & Multi-Platform Asset System](../.ai/DECISIONS.md#adr-014-luxury-ethnic-brand-identity--multi-platform-asset-system)  
> **Master Vector Source:** [`public/logo-source.svg`](../public/logo-source.svg) (1024×1024 master canvas)

---

## 1. Executive Summary & Brand Identity

Aalm Vastralay (आलम वस्त्रालय) presents a distinguished luxury ethnic & bridal wear identity grounded in Indian artisanal heritage. Designed with royal imperial proportions, our monogram emblem incorporates a circular gold zari medallion encircling the timeless lettermark **"AV"**.

### Brand Color Palette & Hex Codes

| Token Name | Hex Code | RGB | Usage Description |
| :--- | :--- | :--- | :--- |
| **Imperial Gold** | `#D4AF37` | `212, 175, 55` | Primary metallic accent, zari filigree borders, luxury accents |
| **Light Gold** | `#E6CA65` | `230, 202, 101` | Inner medallion borders, subtle highlights |
| **Royal Purple** | `#4A148C` | `74, 20, 140` | Primary brand background, royal bridal regal backdrop |
| **Heritage Maroon** | `#800020` | `128, 0, 32` | Secondary traditional bridal shade, festive highlights |
| **Ivory Silk** | `#FAF9F6` | `250, 249, 246` | Light theme background, clean presentation |
| **Charcoal Night** | `#1A1A1A` | `26, 26, 26` | Dark mode surface, high-contrast monochrome silhouettes |

---

## 2. Complete Logo Suite (20 SVG Variants + 6 High-Res PNGs)

Located in [`public/logos/`](../public/logos/):

| Logo Type | Dimensions | Full Color (Royal Purple + Gold) | White (Dark BGs) | Black (Monochrome / Print) | Grayscale (Invoices / Packaging) | High-Res PNG |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Horizontal** | 800×200 | `primary.svg` | `primary-white.svg` | `primary-black.svg` | `primary-gray.svg` | `primary.png`, `primary@2x.png` |
| **Secondary Stacked** | 400×500 | `secondary.svg` | `secondary-white.svg` | `secondary-black.svg` | `secondary-gray.svg` | `secondary.png` |
| **Icon-Only Monogram** | 512×512 | `icon-only.svg` | `icon-only-white.svg` | `icon-only-black.svg` | `icon-only-gray.svg` | `icon-only.png` |
| **Wordmark Only** | 800×150 | `wordmark.svg` | `wordmark-white.svg` | `wordmark-black.svg` | `wordmark-gray.svg` | `wordmark.png` |
| **Lettermark ("AV")** | 512×512 | `lettermark.svg` | `lettermark-white.svg` | `lettermark-black.svg` | `lettermark-gray.svg` | `lettermark.png` |

---

## 3. Watermark Suite (Product Protection & Catalog)

Located in [`public/watermarks/`](../public/watermarks/):

| Variant | Dimensions | Opacity | Application | File Path |
| :--- | :--- | :--- | :--- | :--- |
| **Full Horizontal** | 500×150 | 15% (`#D4AF37`) | High-res product catalog detail overlays | `public/watermarks/full.svg` |
| **Icon Only** | 200×200 | 20% (`#D4AF37`) | Subtle corner watermark on product zoom thumbnails | `public/watermarks/icon.svg` |
| **Diagonal Tiled** | 1000×1000 | 8% (`#D4AF37`) | 45-degree full-frame protection against unauthorized image scraping | `public/watermarks/tiled.svg` |

---

## 4. Multi-Platform 53-Icon Catalog

All files located in [`public/`](../public/):

### A. Favicons (Browser Tabs & Bookmarks)
- `favicon.ico` — Multi-size Windows & legacy browser container (16x16, 32x32, 48x48)
- `favicon-16x16.png` — Standard browser tab favicon (Retina standard)
- `favicon-32x32.png` — Standard browser tab favicon (Retina high-DPI)
- `favicon-96x96.png` — Desktop Google Chrome bookmark / shortcut icon
- `favicon-dark.svg` — Scalable SVG icon optimized with luminous gold for Dark Mode themes
- `logo.svg` — Root fallback vector favicon and brand mark

### B. Apple Touch Icons (iOS Home Screen & Safari)
- `apple-touch-icon.png` — 180×180 default iOS Home Screen icon
- `apple-touch-icon-180x180.png` — 180×180 iPhone Retina display icon
- `apple-touch-icon-167x167.png` — 167×167 iPad Pro Home Screen icon
- `apple-touch-icon-152x152.png` — 152×152 iPad & iPad Air Home Screen icon
- `apple-touch-icon-76x76.png` — 76×76 iPad legacy icon
- `apple-touch-icon-precomposed.png` — 180×180 fallback preventing iOS glossy sheen override
- `safari-pinned-tab.svg` — 100% black monochrome vector silhouette for Safari pinned tab / touch bar

### C. Android & Progressive Web App (PWA) Icons
- `android-chrome-72x72.png` — LDPI Android launcher icon
- `android-chrome-96x96.png` — MDPI Android launcher icon
- `android-chrome-128x128.png` — HDPI Android launcher icon
- `android-chrome-144x144.png` — XHDPI Android launcher icon
- `android-chrome-152x152.png` — XXHDPI Android splash icon
- `android-chrome-192x192.png` — Standard Android PWA installation icon
- `android-chrome-384x384.png` — Ultra high-DPI Android screen icon
- `android-chrome-512x512.png` — Google Play Store & PWA splash screen icon

### D. Android Adaptive / Maskable Icons (80% Safe Zone)
- `maskable-192x192.png` — 192×192 adaptive icon with 10% outer padding for circular/squircle cropping
- `maskable-512x512.png` — 512×512 adaptive icon guaranteeing 0% clipping on Samsung, Pixel, and Xiaomi launchers

### E. Windows Metro / Desktop Tiles & Browserconfig
- `mstile-70x70.png` — Small Windows tile (70×70)
- `mstile-144x144.png` — Legacy Windows 8 IE10 tile (144×144)
- `mstile-150x150.png` — Medium Windows square tile (150×150)
- `mstile-310x150.png` — Wide Windows rectangle banner tile (310×150)
- `mstile-310x310.png` — Large Windows square tile (310×310)
- `browserconfig.xml` — Windows tile schema configuration with `#4A148C` brand tile theme

### F. Social Media & OpenGraph Previews
- `og-image.png` — 1200×630 OpenGraph image for WhatsApp, Facebook, iMessage, Slack
- `twitter-image.png` — 1200×600 Twitter summary_large_image card
- `og-image-square.png` — 1200×1200 1:1 square preview for Instagram, Pinterest, and direct chat links
- `linkedin-image.png` — 1200×627 optimized preview for LinkedIn posts and company updates

### G. Transactional Email & UI Elements
- `email-logo.png` — 400×100 high-res logo for SendGrid/Resend order receipts & dispatch emails
- `loading-spinner.svg` — Pure CSS animated gold monogram loader for lazy components

---

## 5. Metadata Integration & Backward Compatibility

The system maintains 100% backward compatibility:
1. **Dynamic App Router Handlers:** [`src/app/icon.tsx`](../src/app/icon.tsx), [`src/app/apple-icon.tsx`](../src/app/apple-icon.tsx), and [`src/app/opengraph-image.tsx`](../src/app/opengraph-image.tsx) continue to render dynamically for dynamic URL overrides.
2. **Static Fallback Handlers:** [`public/manifest.json`](../public/manifest.json) and [`public/browserconfig.xml`](../public/browserconfig.xml) serve static crawlers, PWA installers, and desktop browsers.
3. **Existing Brand Assets:** Original [`public/brand/`](../public/brand/) files (`logo-full.svg`, `logo-full-light.svg`, `logo-mark.svg`, `watermark.svg`, `poster.png`) remain untouched and operational.
4. **Header Component:** Zero disruption to [`src/components/header/HeaderNav.tsx`](../src/components/header/HeaderNav.tsx).
