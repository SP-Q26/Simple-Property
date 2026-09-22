# Stripe product images

Stripe **Product** objects show an image in hosted Checkout and the Dashboard. Deposit Desk uses **stable URLs on simple-property.com** so test and live products can share the same art; redeploy + sync refreshes what Stripe displays.

## Assets

| File | SKU |
|------|-----|
| `web/stripe/pro-monthly.svg` | `monthly` |
| `web/stripe/pro-annual.svg` | `annual` |
| `web/stripe/turn-move-out.svg` | `turn_move_out` |
| `web/stripe/turn-full.svg` | `turn_full` |
| `web/stripe/*.png` | 512×512 raster · committed · served at `https://simple-property.com/stripe/*.png` |
| `docs/stripe/upload-for-stripe/*.png` | Same bytes · optional drag into Dashboard by hand |

Design in git: **512×512 tiles, icon-only** (no tiny labels). Concept notes: `docs/STRIPE_BRANDING_ASSETS.md`.

Canonical paths and product IDs: `web/lib/stripe-catalog.mjs` (`checkout_image` + `stripeProductImageUrl()`).

## Workflow

1. Edit SVG if needed.
2. `npm run export:stripe-images` (rasterize + refresh `docs/stripe/upload-for-stripe/`).
3. Deploy site so `https://simple-property.com/stripe/*.png` returns **200** (`npm run smoke:prod` checks HEAD on each PNG).
4. Point Stripe at the URLs — **not** MCP upload, plain Products API:

```bash
STRIPE_SECRET_KEY=sk_test_… npm run sync:stripe-images
STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-images
```

`sync-stripe-product-images.mjs` POSTs `images[0]=https://simple-property.com/stripe/pro-monthly.png` (etc.) to each product ID from the catalog.

Optional full copy refresh (name, description, image, product URL):

```bash
STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-products
```

## Checkout branding (separate from product images)

Session look (colors, display name, session icon) lives in `checkoutBrandingSettings()` in `web/lib/stripe-catalog.mjs` and `branding_settings` in `web/api/stripe/checkout.js`. Isles metadata on sessions is for filtering, not the Product `images[]` field.

Legal URLs for Dashboard / consent: `docs/STRIPE_BRANDING_ASSETS.md`.

## Notes

- Stripe requires **HTTPS** and a fetchable image (PNG/JPEG). SVG is not used on the Product object.
- Live products are **not** auto-copied from test; run sync with `sk_live_…` before live smokes.
- After SVG edits: **export → deploy → sync test and live** (products are not auto-copied between modes).
- Audit: `node scripts/audit-svg-assets.mjs` (included in `npm run audit`).
