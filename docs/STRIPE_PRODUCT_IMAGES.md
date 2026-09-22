# Stripe product images · Deposit Desk

Stripe **Product** objects show an image in hosted Checkout and the Dashboard. Deposit Desk uses **stable URLs on simple-property.com** (same pattern as Innsegall `web/stripe/*.png`).

## Assets

| File | SKU |
|------|-----|
| `web/stripe/pro-monthly.svg` | `monthly` |
| `web/stripe/pro-annual.svg` | `annual` |
| `web/stripe/turn-move-out.svg` | `turn_move_out` |
| `web/stripe/turn-full.svg` | `turn_full` |
| `web/stripe/*.png` | 512×512 raster · committed · served statically |

Catalog: `checkout_image`, `stripe_description`, `stripeProductImageUrl()` in `web/lib/stripe-catalog.mjs`.

## Workflow

1. Edit SVG if needed.
2. `npm run export:stripe-images`
3. Deploy so `https://simple-property.com/stripe/*.png` returns **200**.
4. Push copy + images to Stripe:

```bash
STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-products
```

Stripe does not render SVG on products; the old shared `og/spt-card.svg` URL often shows blank in Checkout.
