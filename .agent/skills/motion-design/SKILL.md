---
name: motion-design
description: Universal motion design principles, timing, easing, micro-interactions, state feedback, and prefers-reduced-motion support.
license: MIT
metadata:
  version: 1.0.0
  category: frontend-animation
  tags: motion, animations, micro-interactions, easing, accessibility
---

# Motion Design Skill

## Motion Principles
1. **Timing & Easing (Natural Physics):**
   - Micro-interactions (hover, toggle, active press): 120ms – 180ms with `cubic-bezier(0.2, 0.8, 0.2, 1)` or `ease-out`.
   - Structural transitions (dialogs, drawers, dropdowns): 220ms – 300ms with `cubic-bezier(0.16, 1, 0.3, 1)` (snappy entry, graceful decelerate).
   - Page transitions & reveal scroll: 400ms – 600ms staggered with 40ms delays.
2. **State Feedback:**
   - Buttons must provide tactile confirmation: Active scale down (`active:scale-[0.98]`), loading spinner or pulse, success chime / icon swap.
   - Form inputs highlight gently without abrupt layout shift.
3. **Reduced Motion Compliance:**
   - Always wrap or query `@media (prefers-reduced-motion: reduce)`.
   - Substitute spatial translation (slide/fly) with subtle opacity fade (`transition-opacity duration-200`) when reduced motion is preferred.
4. **Hardware Acceleration:**
   - Animate `transform` and `opacity` only. Never animate `width`, `height`, `margin`, or `top/left` to maintain 60 FPS on mobile.
