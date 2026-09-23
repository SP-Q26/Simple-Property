# Layout & spacing audit · Deposit Desk · 2026-09-22

**Scope:** Home, `/app`, `/blog`, `/pricing`, `/feedback` · CSS v26 · iPhone 390×844 (Safari-class).

**Automated gates (local):**

| Script | Result |
|--------|--------|
| `npm run audit:ios` | OK · safe-area, tap-min, v26 sitewide |
| `npm run audit:mobile` | OK · stacks @640, wizard wrap |
| `npm run audit:visual` | OK · spacing scale, locale bubbles |

---

## What passes

- **Page shell:** `.page` uses clamp + `safe-area-inset` horizontal padding; footer gets extra bottom safe padding on mobile.
- **Touch:** Buttons, bubbles, and pills target `--tap-min` (2.75rem); inputs 16px on mobile (no iOS zoom).
- **Wizard:** Step labels wrap; nav stacks full-width; `#wizard-panel` scroll-margin for keyboard/print.
- **Pricing:** Cards stack → 2-col → 4-col; finder grid stacks on narrow viewports.
- **Blog clusters:** State sections use consistent `guides-hub` / `blog-cluster--state` rhythm.
- **Marketing:** Hero actions stack on mobile; deposit receipt scrolls horizontally when needed.

---

## P0 · locale bar on mobile (390px)

**Measured on live `/blog` (simple-property.com):**

| Metric | Value | Note |
|--------|------:|------|
| Site header height | ~129px | Brand + nav wrap |
| Locale bar total height | **~339px** | Sticky · eats half the viewport |
| Bubble plate height | ~220px | `min-height: 8.5rem` + 19 pills |
| **Overlapping bubble pairs** | **27** | e.g. DC+MD, IA+IL, east-coast cluster |

**Cause:** Pseudo-map percent positions pack 19 tappable pills into a short plate; 44px min-height bubbles overlap visually and for hit-testing (still clickable but cramped and ugly).

**Mitigation (CSS v27):** Below 640px, hide the bubble plate; show the **All states** pill grid (no `<details>` chrome). Desktop keeps the bubble map.

---

## P1 · sticky chrome & density

1. **Locale bar `z-index: 40` + sticky** on long `/blog` index: useful for jumps, heavy on first screen. Consider `position: static` on blog only after map fix, or collapse bar until scroll (future).
2. **Home carries full locale bar** before hero — same height cost on landing ads. Pill-only mobile reduces this.
3. **Duplicate state entry points on mobile:** bubbles + “All states” + SR list (hidden) — SR list fine; visible duplicate removed by mobile pill-only mode.

---

## P2 · token drift & copy layout

| Item | Location | Note |
|------|----------|------|
| Inline `style=` margins | `feedback.html`, `pricing.html`, `success.html`, `app.html` | Works but bypasses `--space-*`; migrate to utilities when touching those files |
| `.coverage-spotlight` CTAs | `index.html` | Adjacent buttons need flex gap (v27) |
| FAQ on home | Still says “six states” in one accordion | Copy drift vs 18+DC wizard — content not spacing |
| Blog index length | Many clusters | Spacing between clusters OK; vertical scroll is content volume |

---

## P3 · desktop / tablet

- Bubble map at ≥640px: acceptable density; minor east-coast overlap may remain at narrow tablet — monitor 720px.
- **Mac ~29% traffic:** `.page` max width and section padding read well; no horizontal scroll on pricing tables (overflow-x on tier table only).

---

## Re-check after v27

```bash
npm run audit:ios && npm run audit:mobile
# Manual: iPhone /blog — locale bar ≲ 120px before first H1
```
