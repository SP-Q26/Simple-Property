# Simple Property · door-notebook mark (artist render)

**Source (git):** `docs/brand/spt-logo-mark-v1.jpg` (1000×1000)

**Regenerate web assets:**

```bash
npm run import:brand-logo   # PNG sizes + favicon.svg + .ico / apple-touch
npm run sync:seo            # OG 1200×630 PNGs + social meta cache bump
```

**Deployed paths:**

| Asset | URL |
|-------|-----|
| Favicon SVG | `/favicon.svg` |
| Favicon ICO | `/favicon.ico` |
| Apple touch | `/apple-touch-icon.png` |
| Mark PNG (512) | `/brand/spt-logo-mark-512.png` |
| OG share | `/og/spt-share-door.png?v=…` (see `OG_CACHE_VERSION` in `scripts/lib/social-share.mjs`) |

Header/footer `brand-mark` and JSON-LD `logo` use `/favicon.svg`. Bump `OG_CACHE_VERSION` when OG art changes so Facebook/LinkedIn refresh previews.
