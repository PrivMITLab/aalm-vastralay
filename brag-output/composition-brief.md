# Hyperframes Composition Brief: Aalm Vastralay

## Objective
Create a short launch-style brag video for Aalm Vastralay.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 18.0 seconds

## Source Material
- Project root: `e:/daily/aalm-vastralay-marketplace-development (1)`
- Primary files read: `README.md`, `src/app/page.tsx`, `src/components/`, `src/lib/`
- Product name: Aalm Vastralay
- Tagline / strongest claim: "From the sacred looms of Varanasi to your doorstep in 3 taps — 100% authentic handloom, ₹0 platform commissions."
- Key UI or visual moment to recreate: Handloom Saree showcase card with verified GI Silk Mark badge, and 1-Click WhatsApp Direct Order confirmation modal.
- Copy that must appear verbatim:
  - "Stop buying factory-printed ethnic wear."
  - "Pure Katan Silk Banarasi Saree"
  - "100% Authentic Handloom · Varanasi Master Weavers"
  - "1-Click WhatsApp Direct Order"
  - "AALM VASTRALAY"

## Creative Direction
- Tone preset: polished
- Creative direction: Royal Indian luxury heritage meets high-performance sub-50ms engineering
- Interpretation: Elegant and deliberate pacing, gold and deep crimson accents, authentic zari ornamentation, with snappy, tactile UI interactions and crystal-clear typography.
- Angle: Contrast mass-produced polyester synthetic textiles with genuine, artisan-woven Banarasi silk straight from master weavers.
- Hook: "Stop buying factory-printed ethnic wear." (0-3s)
- Outro / punchline: "Pure Weaves. Sacred Heritage. Aalm Vastralay."
- Avoid:
  - Generic SaaS language ("supercharge", "streamline your workflow")
  - Abstract filler visuals (no meaningless 3D blobs)
  - Cheap synthetic color schemes (stick to royal maroon `#14080e`, gold `#d4af37`, and silk cream `#fdfbf7`)

## Visual Identity
- Background: `#14080e` (Royal Midnight Maroon)
- Card Surfaces: `#1f0e15` with `#d4af37` (Antique Gold) borders
- Accent: `#d4af37` (Gold), `#25d366` (WhatsApp Emerald)
- Text: `#ffffff` (Pure Silk White), `#f5e6c8` (Ivory Gold), `#a1a1aa` (Subdued Silver)
- Display font: `Cinzel, 'Playfair Display', Georgia, serif`
- Body font: `Inter, -apple-system, system-ui, sans-serif`
- Visual references from the project: Handloom GI tags, silk saree texture backgrounds, WhatsApp order buttons, and royal crest badges.

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. The Provocation (Hook) — 3.0s — "Stop buying factory-printed ethnic wear." Shimmering gold typography.
2. The Artisan Showcase — 5.5s — Pure Katan Silk Banarasi Saree card with Silk Mark seal and artisan details.
3. 1-Click WhatsApp Checkout — 5.5s — Real user interaction: cursor click on "Order via WhatsApp" with instant confirmation modal.
4. Grand Finale & Call to Action — 4.0s — Royal golden crest, sub-50ms performance badges, and site URL.

## Audio
- Audio role: Warm, regal corporate bed with modern rhythmic groove
- Audio arc: Evocative opening pad swelling into an upbeat modern rhythm, supporting interactive UI taps, and resolving on a grand gold chime
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`
- Music treatment: Fade in over 1s, steady presence during UI beats, smooth 1.5s fade out at end
- Music cue guidance: Use Hyperframes beat detection to align scene cuts and card reveals
- Audio-reactive treatment: Subtle gold border glow and crest shimmer pulsing softly with bass/beat energy
- Audio-coupled moments:
  - 0.0s: Ambient intro swell
  - 3.0s: Card slide-in whoosh
  - 8.5s: Tactile click on WhatsApp order button
  - 14.0s: Settle and gold crest chime
- SFX selection guidance: Natural UI clicks, subtle silk/card slides, resonant chime
- Exact SFX choice: Selected by Hyperframes from `.agents/skills/brag/assets/sfx/`
- Audio files: Copied into `brag-output/composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes conventions:
- Self-contained HTML/CSS/JS in `brag-output/composition/index.html`
- Accurate `data-*` timeline and scene durations
- WCAG contrast compliant
- Zero console or render errors on `npx hyperframes check`
