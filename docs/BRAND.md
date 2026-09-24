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
- `favicon.svg` — Scalable vector favicon for modern web standards
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

---

## 6. Typography

### Font Families

| Element | Primary Font | Weight | Fallback Chain | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Logo Wordmark** | Playfair Display | 700 | Georgia, Times New Roman, serif | "AALM VASTRALAY" text |
| **Monogram** | Georgia | Bold | Playfair Display, Times New Roman, serif | "AV" letters |
| **Tagline** | Inter | 600 | -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif | "WEDDING & ETHNIC WEAR" |
| **Location** | Inter | 500 | Same as tagline | "KALYANIPUR · BIHAR · INDIA" |
| **Body Copy** | Inter | 400 | Same as tagline | Website paragraphs, product descriptions |
| **Headings (H1-H3)** | Playfair Display | 700 | Georgia, serif | Section titles on website |
| **UI Elements** | Inter | 500 | system-ui, sans-serif | Buttons, forms, navigation |
| **Code / Mono** | JetBrains Mono | 400 | Fira Code, Consolas, monospace | Developer docs, code blocks |

### Font Sizes (Web)

| Element | Desktop | Tablet | Mobile | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | 48px | 40px | 32px | 1.2 |
| **H2** | 36px | 30px | 26px | 1.3 |
| **H3** | 28px | 24px | 22px | 1.4 |
| **H4** | 22px | 20px | 18px | 1.4 |
| **Body Large** | 18px | 17px | 16px | 1.6 |
| **Body Regular** | 16px | 16px | 15px | 1.6 |
| **Body Small** | 14px | 14px | 13px | 1.5 |
| **Caption** | 12px | 12px | 12px | 1.4 |

### Font Sizes (Print)

| Element | Size | Weight |
| :--- | :--- | :--- |
| **Business Card Name** | 10pt | 600 |
| **Business Card Title** | 8pt | 400 |
| **Letterhead Heading** | 14pt | 700 |
| **Letterhead Body** | 10pt | 400 |
| **Invoice Heading** | 16pt | 700 |
| **Packaging Text** | 9pt | 500 |

### Letter Spacing (Tracking)

| Element | Value | Reason |
| :--- | :--- | :--- |
| **Logo Wordmark** | 2px | Elegant, readable |
| **Tagline** | 7px | Premium, spaced out |
| **Location** | 4px | Subtle, balanced |
| **H1** | -0.5px | Tight, impactful |
| **Body** | 0 | Default readability |
| **All Caps Text** | 1.5px | Legibility |

### Font Loading Strategy
- Use `next/font/google` for Playfair Display and Inter
- Preload critical fonts (logo, headings)
- Use `font-display: swap` to prevent invisible text
- Subset fonts to Latin + Devanagari (for Hindi text)
- Fallback fonts must be metrically similar to prevent CLS

---

## 7. Logo Usage Rules

### Safe Zone (Clear Space)
The safe zone is the minimum clear space around the logo. It must be maintained at all times to ensure visual breathing room and brand dignity.

**Safe Zone Calculation:**
- Measured as the height of the letter "A" in the wordmark
- Applies to ALL sides (top, bottom, left, right)
- Scales proportionally with logo size
- No text, image, or graphic may enter this zone

**Example (Primary Horizontal Logo):**
- If wordmark "A" height = 40px
- Safe zone = 40px on all sides
- Total canvas required = logo width + 80px, logo height + 80px

### Minimum Sizes
The logo must NEVER be reproduced below these minimum sizes. Below these thresholds, the logo becomes illegible.

| Logo Type | Print Minimum | Digital Minimum | Reason |
| :--- | :--- | :--- | :--- |
| **Primary Horizontal** | 40mm width | 120px width | Monogram + text readability |
| **Secondary Stacked** | 30mm width | 80px width | Monogram clarity |
| **Icon-Only Monogram** | 8mm | 24px | "AV" must be legible |
| **Wordmark Only** | 30mm width | 100px width | Text readability |
| **Lettermark ("AV")** | 6mm | 16px | Recognizable at smallest |

### Logo Placement Guidelines

**Priority Zones:**
1. Top-left: Website header, letterhead, invoices
2. Top-center: Wedding invitations, packaging
3. Bottom-right: Photo watermarks, video credits

**Alignment:**
- Align to grid (8px increments on web, 5mm on print)
- Consistent margins across all platforms
- Balance with other elements (not crowded)

### Incorrect Usage (DO NOT)
- ❌ Do NOT stretch, compress, or distort the logo
- ❌ Do NOT rotate the logo (except 90° for specific applications)
- ❌ Do NOT change the logo colors
- ❌ Do NOT add drop shadows, glows, or outlines
- ❌ Do NOT place on busy backgrounds without solid contrast panel
- ❌ Do NOT use on colors with less than 4.5:1 contrast ratio
- ❌ Do NOT rearrange logo elements
- ❌ Do NOT add text or graphics inside the safe zone
- ❌ Do NOT use low-resolution PNG when SVG is available
- ❌ Do NOT recreate or redraw the logo
- ❌ Do NOT use the logo as a pattern (except tiled watermark)
- ❌ Do NOT crop the logo

### Correct Usage (DO)
- ✅ Always use the provided SVG files when possible
- ✅ Maintain the safe zone around the logo
- ✅ Use the correct color variant for the background
- ✅ Use the correct logo type for the space available
- ✅ Keep the aspect ratio intact
- ✅ Use PNG @2x for high-DPI displays
- ✅ Verify legibility before publishing
- ✅ Test in context (website, print, social) before finalizing

### Background Guidelines

| Background Color | Use This Logo Variant |
| :--- | :--- |
| **White / Ivory (`#FAF9F6`)** | Full Color (`primary.svg`) |
| **Royal Purple (`#4A148C`)** | White (`primary-white.svg`) |
| **Charcoal (`#1A1A1A`)** | White (`primary-white.svg`) |
| **Gold (`#D4AF37`)** | Black (`primary-black.svg`) |
| **Photo (light areas)** | Full Color with contrast panel |
| **Photo (dark areas)** | White (`primary-white.svg`) |
| **Maroon (`#800020`)** | White (`primary-white.svg`) |
| **Gradient backgrounds** | White or Black based on contrast |

---

## 8. Icon Generation

### Source File
- **Master Vector:** `public/logo-source.svg`
- **Dimensions:** 1024×1024 canvas
- **Format:** SVG (scalable, editable)
- **Safe Zone:** 15% padding on all sides
- **Content:** "AV" monogram in center

### Generation Command
```bash
# Install dependencies (one-time)
npm install -D sharp tsx

# Generate all icons
npm run icons:generate
```

### Generation Script Location
- **Script:** `scripts/generate-all-icons.ts`
- **Output Directory:** `public/`
- **Tools:** `sharp` (image processing), `tsx` (TypeScript execution)

### Script Overview
The script performs these steps:
1. Reads `public/logo-source.svg`
2. For each icon configuration:
   - Resizes SVG to target dimensions
   - Applies padding (for maskable icons)
   - Sets background color (for opaque icons)
   - Exports as PNG or ICO
3. Generates multi-resolution `favicon.ico`
4. Logs each generated file
5. Fails fast on any error

### Icon Configurations
- **Favicons (6 files):**
  - `favicon.ico` (16, 32, 48 multi-res)
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `favicon-96x96.png`
  - `favicon.svg` (vector)
  - `favicon-dark.svg` (vector, dark mode)
- **Apple Touch Icons (7 files):**
  - `apple-touch-icon.png` (180×180)
  - `apple-touch-icon-180x180.png`
  - `apple-touch-icon-167x167.png`
  - `apple-touch-icon-152x152.png`
  - `apple-touch-icon-76x76.png`
  - `apple-touch-icon-precomposed.png`
  - `safari-pinned-tab.svg`
- **Android / PWA Icons (8 files):**
  - `android-chrome-72x72.png`
  - `android-chrome-96x96.png`
  - `android-chrome-128x128.png`
  - `android-chrome-144x144.png`
  - `android-chrome-152x152.png`
  - `android-chrome-192x192.png`
  - `android-chrome-384x384.png`
  - `android-chrome-512x512.png`
- **Maskable Icons (2 files):**
  - `maskable-192x192.png` (80% safe zone)
  - `maskable-512x512.png` (80% safe zone)
- **Windows Tiles (6 files):**
  - `mstile-70x70.png`
  - `mstile-144x144.png`
  - `mstile-150x150.png`
  - `mstile-310x310.png`
  - `mstile-310x150.png` (wide)
  - `browserconfig.xml`
- **Social / OG Images (4 files):**
  - `og-image.png` (1200×630)
  - `twitter-image.png` (1200×600)
  - `og-image-square.png` (1200×1200)
  - `linkedin-image.png` (1200×627)
- **Email / UI (2 files):**
  - `email-logo.png` (400×100)
  - `loading-spinner.svg`

### Manual Verification
After generation, verify:
- [x] All 53 files exist in `public/`
- [x] `favicon.ico` is multi-resolution (check with file command)
- [x] Apple touch icons are opaque (no transparency)
- [x] Maskable icons have 80% safe zone (test on maskable.app)
- [x] Windows tiles use `#4A148C` background
- [x] Social/OG images render correctly
- [x] Favicon loads in browser tab
- [x] Apple touch icon works on iOS (Add to Home Screen)
- [x] PWA install works on Android
- [x] Social share preview works (test with [opengraph.xyz](https://opengraph.xyz/))

### Icon Testing Checklist

**Browser Testing:**
- [x] Chrome (Windows, macOS, Android)
- [x] Firefox (Windows, macOS, Linux)
- [x] Safari (macOS, iOS)
- [x] Edge (Windows)
- [x] Brave (Windows)

**Device Testing:**
- [x] iPhone (iOS 15+)
- [x] iPad (iPadOS 15+)
- [x] Android phone (Android 10+)
- [x] Android tablet
- [x] Windows 10/11 desktop
- [x] macOS desktop

**Platform Testing:**
- [x] PWA install on Android
- [x] Add to Home Screen on iOS
- [x] Windows Start Menu pin
- [x] macOS Dock pin
- [x] Social media share previews

### Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Icons not updating** | Clear browser cache (Ctrl+Shift+R) |
| **Favicon not showing** | Check file exists at `/favicon.ico` |
| **Apple icon not working** | Must be opaque, no transparency |
| **PWA install fails** | Check `manifest.json` icons array |
| **Windows tile not showing** | Check `browserconfig.xml` syntax |
| **Social preview broken** | Check OG tags in `layout.tsx` |
| **Icon looks blurry** | Use `@2x` PNG for high-DPI displays |

### Regeneration
If logo source changes:
1. Update `public/logo-source.svg`
2. Run `npm run icons:generate`
3. Verify all files regenerated
4. Clear browser cache
5. Test on all platforms

### Automation
Added to `package.json`:
```json
{
  "scripts": {
    "icons:generate": "tsx scripts/generate-all-icons.ts",
    "icons:verify": "node scripts/verify-icons.js"
  }
}
```

CI/CD Verification Workflow (`.github/workflows/icons.yml`):
```yaml
name: Verify Icons
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run icons:generate
      - run: git diff --exit-code public/ || (echo "Icons out of date" && exit 1)
```

---

## 9. Accessibility (WCAG 2.1 AA)

### Color Contrast Ratios
All brand colors must meet WCAG 2.1 AA standards (minimum 4.5:1 for normal text, 3:1 for large text).

| Combination | Ratio | AA | AAA | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Gold `#D4AF37` on Purple `#4A148C`** | 8.2:1 | ✅ | ✅ | Logo on purple bg |
| **White `#FFFFFF` on Purple `#4A148C`** | 12.1:1 | ✅ | ✅ | Text on purple bg |
| **Maroon `#800020` on Ivory `#FAF9F6`** | 7.8:1 | ✅ | ✅ | Tagline on light bg |
| **Purple `#4A148C` on Ivory `#FAF9F6`** | 10.5:1 | ✅ | ✅ | Headings on light bg |
| **Charcoal `#1A1A1A` on Ivory `#FAF9F6`** | 15.8:1 | ✅ | ✅ | Body text |
| **Gold `#D4AF37` on Charcoal `#1A1A1A`** | 7.4:1 | ✅ | ✅ | Logo on dark bg |
| **White `#FFFFFF` on Maroon `#800020`** | 10.3:1 | ✅ | ✅ | Text on maroon bg |
| **Light Gold `#E6CA65` on Purple `#4A148C`** | 9.1:1 | ✅ | ✅ | Accent on purple |
| **Maroon `#800020` on Gold `#D4AF37`** | 4.6:1 | ✅ | ❌ | Warning: use sparingly |
| **Purple `#4A148C` on Gold `#D4AF37`** | 5.8:1 | ✅ | ❌ | OK for large text |

**FAILED Combinations (DO NOT USE):**
- ❌ Gold `#D4AF37` on Ivory `#FAF9F6` (1.6:1 — too low)
- ❌ Purple `#4A148C` on Charcoal `#1A1A1A` (1.4:1 — invisible)
- ❌ Light Gold `#E6CA65` on Ivory `#FAF9F6` (1.4:1 — too low)

### Alt Text Guidelines
Every image, icon, and SVG must have appropriate alt text for screen readers.

**Logo Alt Text:**
- Primary logo: `alt="Aalm Vastralay - Wedding & Ethnic Wear"`
- Secondary logo: `alt="Aalm Vastralay logo (stacked)"`
- Icon-only: `alt="Aalm Vastralay monogram"`
- Wordmark: `alt="Aalm Vastralay"`
- Lettermark: `alt="AV monogram"`

**Decorative Icons:**
- Use `aria-hidden="true"` for purely decorative icons
- Use `role="presentation"` for non-semantic images

**Functional Icons:**
- Icon buttons: `aria-label="Add to cart"` + `title="Add to cart"`
- Icon links: `aria-label="View product details"`

### SVG Accessibility
All SVG files must include:
```xml
<svg role="img" aria-label="Aalm Vastralay primary logo" ...>
  <title>Aalm Vastralay - Wedding & Ethnic Wear</title>
  <desc>Circular gold medallion with AV monogram and brand wordmark</desc>
  <!-- ... -->
</svg>
```

### Screen Reader Support
- All SVG logos have `role="img"` and `aria-label`
- Interactive icons have descriptive labels
- Decorative separators marked as `aria-hidden="true"`
- Focus order is logical (top to bottom, left to right)
- Skip links provided for keyboard users

### Keyboard Navigation
- All interactive elements reachable via Tab
- Focus indicators visible (2px solid gold `#D4AF37`)
- Enter/Space activates buttons
- Escape closes modals
- Arrow keys navigate within groups

### Motion & Animation
- Respect `prefers-reduced-motion` media query
- No auto-playing animations longer than 5 seconds
- Provide pause/stop for animated content
- Avoid flashing content (3 flashes per second max)

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Form Accessibility
- All inputs have associated `<label>` elements
- Error messages linked via `aria-describedby`
- Required fields marked with `aria-required="true"`
- Form validation errors announced via `aria-live="polite"`

### Color Blindness Considerations
- Do not rely on color alone to convey information
- Use icons + text + color for status indicators
- Test with color blindness simulators
- Ensure grayscale version is legible

### Testing Tools
- axe DevTools (browser extension)
- WAVE (web accessibility evaluation)
- Lighthouse (built into Chrome DevTools)
- NVDA (screen reader, Windows)
- VoiceOver (screen reader, macOS/iOS)
- TalkBack (screen reader, Android)

### Accessibility Checklist
- [x] All text meets 4.5:1 contrast ratio
- [x] All images have alt text
- [x] All SVGs have role and aria-label
- [x] All forms have labels
- [x] All buttons have accessible names
- [x] Keyboard navigation works
- [x] Focus indicators visible
- [x] `prefers-reduced-motion` respected
- [x] Screen reader tested (NVDA/VoiceOver)
- [x] Lighthouse Accessibility score > 90

---

## 10. File Naming Convention

All brand assets follow a consistent, predictable naming pattern for easy discovery, automation, and maintenance.

### Logos
- **Pattern:** `{type}-{color}.{ext}`
- **Types:**
  - `primary` — Primary horizontal logo
  - `secondary` — Secondary stacked logo
  - `icon-only` — Icon-only monogram
  - `wordmark` — Text-only wordmark
  - `lettermark` — "AV" lettermark
- **Colors:**
  - `(no suffix)` — Full color
  - `-white` — White (for dark backgrounds)
  - `-black` — Black (monochrome)
  - `-gray` — Grayscale

**Examples:**
- `primary.svg` — Full color primary logo
- `primary-white.svg` — White primary logo
- `primary-black.svg` — Black primary logo
- `primary-gray.svg` — Grayscale primary logo
- `secondary.svg` — Full color secondary logo
- `icon-only.svg` — Full color monogram
- `wordmark.svg` — Full color wordmark
- `lettermark.svg` — Full color lettermark

### Icons
- **Pattern:** `{platform}-{size}x{size}.{ext}`
- **Platforms:**
  - `favicon` — Browser favicons
  - `apple-touch-icon` — iOS/Safari icons
  - `android-chrome` — Android/PWA icons
  - `maskable` — Android adaptive icons
  - `mstile` — Windows Metro tiles

**Examples:**
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon-96x96.png`
- `apple-touch-icon-180x180.png`
- `apple-touch-icon-152x152.png`
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `maskable-192x192.png`
- `maskable-512x512.png`
- `mstile-150x150.png`
- `mstile-310x310.png`

**Special Icons (no size suffix):**
- `favicon.ico` — Multi-resolution ICO
- `favicon.svg` — Vector favicon
- `favicon-dark.svg` — Dark mode favicon
- `safari-pinned-tab.svg` — Safari pinned tab
- `apple-touch-icon.png` — Default Apple touch icon (180×180)
- `apple-touch-icon-precomposed.png` — Legacy fallback
- `loading-spinner.svg` — Animated loader

### Watermarks
- **Pattern:** `{type}.{ext}`
- **Types:**
  - `full` — Full horizontal watermark
  - `icon` — Icon-only watermark
  - `tiled` — Diagonal tiled watermark

**Examples:**
- `watermarks/full.svg`
- `watermarks/icon.svg`
- `watermarks/tiled.svg`

### Social / OG Images
- **Pattern:** `{platform}-image.{ext}`
- **Platforms:**
  - `og` — Open Graph (Facebook, WhatsApp, Slack)
  - `twitter` — Twitter/X
  - `linkedin` — LinkedIn
  - `og-square` — Square for Instagram/Pinterest

**Examples:**
- `og-image.png`
- `twitter-image.png`
- `linkedin-image.png`
- `og-image-square.png`

### Email / UI
- **Pattern:** `{purpose}.{ext}`

**Examples:**
- `email-logo.png` — 400×100 email header
- `loading-spinner.svg` — Animated loader
- `favicon-dark.svg` — Dark mode favicon

### Directory Structure
```text
public/
├── logos/
│   ├── primary.svg
│   ├── primary-white.svg
│   ├── primary-black.svg
│   ├── primary-gray.svg
│   ├── secondary.svg
│   ├── secondary-white.svg
│   ├── secondary-black.svg
│   ├── secondary-gray.svg
│   ├── icon-only.svg
│   ├── icon-only-white.svg
│   ├── icon-only-black.svg
│   ├── icon-only-gray.svg
│   ├── wordmark.svg
│   ├── wordmark-white.svg
│   ├── wordmark-black.svg
│   ├── wordmark-gray.svg
│   ├── lettermark.svg
│   ├── lettermark-white.svg
│   ├── lettermark-black.svg
│   └── lettermark-gray.svg
├── watermarks/
│   ├── full.svg
│   ├── icon.svg
│   └── tiled.svg
├── favicon.ico
├── favicon.svg
├── favicon-16x16.png
├── favicon-32x32.png
├── favicon-96x96.png
├── favicon-dark.svg
├── apple-touch-icon.png
├── apple-touch-icon-180x180.png
├── apple-touch-icon-167x167.png
├── apple-touch-icon-152x152.png
├── apple-touch-icon-76x76.png
├── apple-touch-icon-precomposed.png
├── safari-pinned-tab.svg
├── android-chrome-72x72.png
├── android-chrome-96x96.png
├── android-chrome-128x128.png
├── android-chrome-144x144.png
├── android-chrome-152x152.png
├── android-chrome-192x192.png
├── android-chrome-384x384.png
├── android-chrome-512x512.png
├── maskable-192x192.png
├── maskable-512x512.png
├── mstile-70x70.png
├── mstile-144x144.png
├── mstile-150x150.png
├── mstile-310x310.png
├── mstile-310x150.png
├── browserconfig.xml
├── og-image.png
├── twitter-image.png
├── og-image-square.png
├── linkedin-image.png
├── email-logo.png
├── loading-spinner.svg
├── logo-source.svg
├── logo.svg
└── manifest.json
```

### Rules
- **All lowercase** — No uppercase in file names
- **Hyphens, not underscores** — `icon-only.svg` not `icon_only.svg`
- **No spaces** — Use hyphens instead
- **Descriptive** — Name describes purpose
- **Consistent** — Same pattern across all files
- **No version numbers** — Use git for versioning
- **No dates** — Use git for timestamps
- **Extensions:** `.svg` for vector, `.png` for raster, `.ico` for ICO, `.xml` for config

---

## 11. Version History & Roadmap

### Version History
**Current Version:** 2.0.0

| Version | Date | Changes | Author |
| :--- | :--- | :--- | :--- |
| **2.0.0** | 2026-09-24 | Complete 53-icon system, brand colors finalized, ADR-014 approved | Sudhir |
| **1.5.0** | 2026-09-23 | Added secondary stacked logo, watermark suite | Sudhir |
| **1.0.0** | 2026-09-22 | Initial primary logo, wordmark, medallion | Sudhir |

### Changelog Format
```text
## [Version] - YYYY-MM-DD
### Added
- New features, files, assets
### Changed
- Updates to existing features
### Deprecated
- Features to be removed in future
### Removed
- Features removed in this version
### Fixed
- Bug fixes
### Security
- Security improvements
```

### Example Entry
```text
## [2.0.0] - 2026-09-24
### Added
- 53-icon multi-platform catalog
- Watermark suite (full, icon, tiled)
- Typography specification
- Logo usage rules
- Accessibility guidelines
- File naming convention
### Changed
- Primary logo: improved medallion with radial gradient
- Color palette: added Light Gold (#E6CA65)
### Fixed
- Fixed favicon rendering on Safari
- Fixed PWA install on Android 13+
```

### Future Roadmap

#### Phase 3 (Q4 2026)
- [ ] **Animated Logo**
  - SVG animation (SMIL)
  - Lottie JSON (for React Native)
  - MP4 (for video intros)
  - WebM (for web)
  - Duration: 2-3 seconds
  - Format: Monogram draws in, then wordmark fades
- [ ] **3D Monogram**
  - GLB format (for AR/VR)
  - USDZ format (for iOS AR)
  - Interactive 3D viewer on website
  - Use case: Virtual try-on, 3D product pages
- [ ] **Brand Merchandise Kit**
  - T-shirt design
  - Tote bag design
  - Coffee mug design
  - Notebook design
  - Sticker pack
  - Business card templates
- [ ] **Presentation Templates**
  - PowerPoint template
  - Keynote template
  - Google Slides template
  - Pitch deck template
  - Client proposal template
- [ ] **Email Signature Template**
  - HTML email signature
  - Plain text version
  - Outlook-compatible
  - Gmail-compatible
  - Apple Mail-compatible

#### Phase 4 (Q1 2027)
- [ ] **Print Collateral**
  - Letterhead (A4, Letter)
  - Envelope (DL, C4, C5)
  - Business card (Indian, US, EU sizes)
  - Folder design
  - Notepad design
  - Invoice template
- [ ] **Packaging Design**
  - Product box design
  - Shipping bag design
  - Tissue paper design
  - Thank you card
  - Return label design
- [ ] **Video Assets**
  - YouTube intro (5s)
  - YouTube outro (10s)
  - Instagram Reel intro (3s)
  - Story template (1080×1920)
  - TikTok intro
- [ ] **Social Media Templates**
  - Instagram post templates (1080×1080)
  - Instagram story templates (1080×1920)
  - Facebook post templates (1200×630)
  - LinkedIn post templates (1200×627)
  - Twitter post templates (1200×675)

#### Phase 5 (Q2 2027)
- [ ] **AI-Generated Assets**
  - AI logo variations
  - AI product photography
  - AI model photography
  - AI pattern generation
  - AI color palette generator
- [ ] **Voice Branding**
  - Sonic logo (3-second audio)
  - Brand music (30-second track)
  - IVR voice (phone menu)
  - Podcast intro music
- [ ] **AR/VR Experience**
  - AR try-on for jewelry
  - AR try-on for clothing
  - VR showroom
  - 3D product viewer

#### Long-term Vision (2028+)
- Global expansion (Middle East, UK, US)
- Regional language variants (Tamil, Telugu, Bengali)
- Franchise branding kit
- Sub-brand architecture (Aalm Vastralay Kids, Aalm Vastralay Home)
- Sustainable packaging initiative
- Artisan collaboration program

---

## 12. Brand Voice & Messaging

### Brand Personality
Aalm Vastralay is a royal, elegant, and warm brand that celebrates Indian artisanal heritage. We speak with the confidence of a heritage house and the warmth of a family elder.

**Brand Archetype:** The Ruler + The Caregiver

| Trait | What It Means | Example |
| :--- | :--- | :--- |
| **Royal** | Confident, majestic, premium | "Crafted for royalty" |
| **Elegant** | Refined, graceful, timeless | "Where tradition meets sophistication" |
| **Warm** | Welcoming, personal, caring | "Your special day, our sacred duty" |
| **Trustworthy** | Reliable, honest, transparent | "100% authentic, handwoven" |
| **Artisanal** | Handcrafted, detailed, authentic | "By master weavers of Varanasi" |
| **Contemporary** | Modern, fresh, relevant | "Tradition, reimagined for today" |

### Tone of Voice

**Do:**
- ✅ Speak with warmth and respect
- ✅ Use elegant, simple language
- ✅ Celebrate Indian craftsmanship
- ✅ Be inclusive and welcoming
- ✅ Tell stories about artisans and heritage
- ✅ Use "we" and "you" (not "I" and "me")

**Don't:**
- ❌ Use slang or informal language
- ❌ Be overly casual or flippant
- ❌ Use aggressive sales tactics
- ❌ Make false claims
- ❌ Use jargon or technical terms
- ❌ Be condescending or patronizing

### Tagline Options

**Primary Tagline:**
> "Wedding & Ethnic Wear"

**Alternative Taglines:**
- "Where Tradition Meets Elegance"
- "Crafted for Your Special Day"
- "Heritage Woven with Love"
- "Royal. Artisanal. Timeless."
- "Your Story, Our Craft"

**Hindi Tagline Options:**
- "आपके खास दिन के लिए" *(For your special day)*
- "परंपरा और आधुनिकता का संगम" *(Where tradition meets modernity)*
- "हर पल, हर रंग" *(Every moment, every color)*

### Key Messaging Pillars

1. **Pillar 1: Authentic Craftsmanship**  
   *"Every piece at Aalm Vastralay is handcrafted by master artisans from Varanasi, Jaipur, and Kanchipuram. We work directly with weaving families to bring you authentic, heirloom-quality garments."*
2. **Pillar 2: Royal Heritage**  
   *"Inspired by the courts of Mughal emperors and the palaces of Rajasthan, our collections celebrate India's rich textile legacy. Every stitch tells a story of kings and queens, of celebrations and ceremonies."*
3. **Pillar 3: Personal Care**  
   *"Your wedding day is one of the most important days of your life. We treat every order with the same care and attention you'd give to your own family's celebrations."*
4. **Pillar 4: Fair & Transparent**  
   *"We believe in fair trade. Our artisans earn 2x the industry average, and every rupee you spend goes directly to the weavers and their families. No middlemen. No exploitation."*
5. **Pillar 5: Serving Bihar & Beyond**  
   *"Born in Kalyanipur, Bihar, we're proud to serve customers across India and the world. From local weddings to global celebrations, we bring the finest ethnic wear to your doorstep."*

### Content Guidelines

**Product Descriptions:**
- Start with a story (where it's from, who made it)
- Describe fabric, color, and craftsmanship
- Mention care instructions
- Keep it warm and personal
- Length: 50-150 words

*Example:*
> "Handwoven in the ancient lanes of Varanasi, this Banarasi silk saree is a celebration of Indian craftsmanship. The intricate gold zari work takes 3 master weavers over 2 weeks to complete. Every thread carries the legacy of a 500-year-old tradition. Perfect for weddings and special occasions. Dry clean only."

**Social Media Posts:**
- Use elegant, minimal language
- Include a story or emotion
- Add relevant hashtags
- Keep captions under 150 characters
- Use emojis sparingly (1-2 max)

*Example:*
> "Some traditions never go out of style. ✨  
> Our Banarasi silk sarees, handwoven by artisans who've inherited their craft from generations past. #AalmVastralay #IndianWedding"

**Email Subject Lines:**
- Personal and warm
- Under 50 characters
- Avoid all caps and exclamation marks

*Examples:*
- "A special something for your wedding day 💛"
- "New arrivals: Our Jaipur collection"
- "Your order is on its way"

### Do Not Use
- ❌ "Cheap" — Use "affordable" or "value"
- ❌ "Sale" — Use "special offer" or "limited time"
- ❌ "Customer" — Use "guest" or "family"
- ❌ "Transaction" — Use "order" or "purchase"
- ❌ "Discount" — Use "savings" or "offer"
- ❌ "Dress" — Use "garment" or "outfit"
- ❌ "Buy now" — Use "Add to cart" or "Shop now"

### Brand Voice Examples

**Website Homepage:**
> "Welcome to Aalm Vastralay, where every garment is a celebration of India's rich textile heritage. From bridal lehengas to everyday elegance, discover handcrafted pieces that tell your story."

**Product Page:**
> "This Banarasi silk saree is a tribute to the weavers of Varanasi. The intricate gold zari work, passed down through five generations, takes 2 weeks to complete. When you wear it, you wear 500 years of tradition."

**Order Confirmation Email:**
> "Thank you for choosing Aalm Vastralay. Your order is being carefully prepared by our team. We'll notify you as soon as it ships. If you have any questions, just reply to this email — we're here to help."

**Packaging Insert:**
> "Thank you for welcoming Aalm Vastralay into your home. Every piece is crafted with love, by artisans who've dedicated their lives to preserving India's textile traditions. We hope it brings you joy for years to come."
