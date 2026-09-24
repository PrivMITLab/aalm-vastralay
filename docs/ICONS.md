# 🎨 AALM VASTRALAY — ICON & BRAND ASSET SYSTEM

## Overview
Aalm Vastralay uses an enterprise-grade icon and branding asset pipeline adhering to Next.js App Router dynamic asset generation and PWA standards.

## Dynamic Next.js Metadata Icons
- **Favicon:** `src/app/icon.tsx` dynamically renders brand emblem (32x32 SVG/PNG).
- **Apple Touch Icon:** `src/app/apple-icon.tsx` renders 180x180 high-DPI iOS home screen icon.
- **OpenGraph Social Preview:** `src/app/opengraph-image.tsx` renders rich 1200x630 social card for WhatsApp, Facebook, LinkedIn.
- **Twitter Card:** `src/app/twitter-image.tsx` renders 1200x630 summary_large_image preview.

## Icon Standards
- All UI icons utilize **Lucide React** with unified stroke width (`stroke-width="1.75"` or `2`).
- Zero emoji used as UI icon buttons (per Section 1 Rule 22).
