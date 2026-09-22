# 🎨 AALM VASTRALAY — DESIGN SYSTEM & TOKENS
# Location: .ai/DESIGN_SYSTEM.md

## 1. Color Palette (Indian Festive & Ethnic Luxury)

| Token | Light Mode Value | Dark Mode Value | Usage |
|---|---|---|---|
| `--brand` | `#7a1f2b` (Deep Maroon Silk) | `#f08ba0` (Soft Rose Gold) | Main brand headers, badges, primary buttons |
| `--accent` | `#c9a227` (Royal Amber Gold) | `#fef08a` (Bright Luminous Gold) | Festive highlights, ratings, active filters, icons |
| `--bg` | `#fffbf5` (Warm Cream Raw Silk) | `#12100f` (Jet Black Luxury Velvet) | Page background |
| `--surface` | `#ffffff` (Pure White Card) | `#1c1917` (Deep Stone Card) | Product cards, modals, side drawers |
| `--surface-2` | `#fbf5eb` (Subtle Ivory) | `#262320` (Elevated Surface) | Secondary rows, trust badges |
| `--border` | `#ebd9c4` (Warm Gold Dust) | `#38332e` (Muted Bronze) | Card borders, inputs, dividers |
| `--text` | `#291811` (Rich Dark Coffee) | `#f5efe6` (Crisp Light Silk) | High-contrast readable body text |
| `--text-muted` | `#6b5c52` (Warm Earth) | `#a89f91` (Neutral Sand) | Secondary subtitles, timestamps, SKUs |

## 2. Typography
- **Headings & Display:** `font-display` -> Georgia, "Times New Roman", Garamond, serif.
- **Body & Controls:** `font-sans` -> system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.

## 3. Responsive Breakpoints
- **Mobile (`320px - 639px`):** Single / 2-column compact grid, bottom navigation, full-width touch drawers.
- **Tablet (`640px - 1023px`):** 3-column product grid, top announcement marquee.
- **Desktop (`1024px+`):** 4 to 6-column product grid, sticky filter sidebar, full hero banner slider.

## 4. Accessibility & UI Rules
- Minimum tap target size: `44x44px` on touch screens.
- All interactive buttons have visible focus rings (`focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`).
- Dark mode contrast ratio: minimum `4.5:1` for standard text and `3:1` for large headings (WCAG AA).
- All icons from **Lucide React** (`h-4 w-4` or `h-5 w-5`), never raw emojis as functional buttons.
