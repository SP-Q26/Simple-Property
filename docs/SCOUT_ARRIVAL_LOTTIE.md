# Scout arrival Lottie (Simple Property)

WWL-style **through-motion** on marketing load: **scout glass** (lens + handle) and **sword** with a gold **shimmer** sweep while the plate **scales toward the viewer** and **fades out**, revealing the greystone door atmosphere and page content.

Ported from the SP door-arrival pattern (not used on spquant index long-term).

## Timing (Luxe canon)

| Beat | ms | Behavior |
|------|-----|----------|
| Hold | 420 | Plate stable before through-ramp |
| Floor | 780 | Minimum perceived arrival |
| Wall | 1600 | Hard cap; overlay removed |

CSS on `.spt-scout-arrival` runs ~1.18s after `animation-delay: 420ms`. Lottie is 48f @ 30fps (1.6s).

## Session

Plays **once per browser session** (`sessionStorage` key `spt_scout_arrival_seen`). Set `data-spt-scout-arrival="off"` on `<html>` to disable (tests).

## Assets

| File | Role |
|------|------|
| `web/lottie/spt-scout-arrival-lottie.json` | Bodymovin · regen: `node scripts/generate-spt-scout-arrival-lottie.mjs` |
| `web/lottie/spt-scout-arrival-fallback.svg` | Reduced motion / player fail |

## Code

| Piece | Path |
|-------|------|
| Boot | `web/spt-scout-arrival-lottie.js` |
| Motion CSS | `web/spt-scout-arrival.css` |
| Wired on | `index.html`, `app.html` (head + early script) |

## Audit

`node scripts/audit-scout-arrival-lottie.mjs` (included in `audit:swarm`).
