# Door arrival Lottie (Simple Property)

**Brand fit:** greystone entry · Deposit Desk · warm parchment palette.

**Motion model:** [Whispering Woods Luxe arrival](https://github.com/SP-Q26/ww) (WWL gold standard) — through-motion on load: doors open on a gold seam while the plate **scales toward the viewer** and **fades out**, revealing the static greystone door atmosphere and page.

## Timing (WWL canon)

| Beat | ms | Behavior |
|------|-----|----------|
| Hold | 420 | Plate stable before through-ramp |
| Floor | 780 | Minimum perceived arrival |
| Wall | 1600 | Hard cap; overlay removed |

## Session

Once per browser session (`spt_door_arrival_seen`). Tests: `data-spt-door-arrival="off"` on `<html>`.

## Assets

| File | Role |
|------|------|
| `web/lottie/spt-door-arrival-lottie.json` | `npm run generate:door-lottie` |
| `web/lottie/spt-door-arrival-fallback.svg` | Reduced motion |
| `web/vendor/dotlottie-player.mjs` | Self-hosted player (no unpkg on load) |
| `scripts/lib/door-arrival-canon.mjs` | HOLD / FLOOR / WALL ms + Lottie `op` |

**Pages:** `index.html` + `app.html` preload JSON and load `spt-door-arrival-*.css/js` · bump via `npm run sync:door-arrival`.

**Runtime:** scroll lock on `<html class="spt-door-arrival-lock">` during overlay · `loop="false"` on player · finish respects **780ms floor** even if `complete` fires early.

## Sister brand (Innsegall)

Scout glass **fading to** sword shimmer is **Innsegall** site entrance motion (not Simple Property, not SP Quant). Ship under `innsegall/` when built; WWL timing only is shared.
