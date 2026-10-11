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
| `web/lottie/spt-door-arrival-lottie.json` | `node scripts/generate-spt-door-arrival-lottie.mjs` |
| `web/lottie/spt-door-arrival-fallback.svg` | Reduced motion |

## Sister brand (Innsegall)

Scout glass **fading to** sword shimmer is **Innsegall** site entrance motion (not Simple Property, not SP Quant). Ship under `innsegall/` when built; WWL timing only is shared.
