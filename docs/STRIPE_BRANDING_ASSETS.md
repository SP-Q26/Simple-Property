# Stripe manual upload · Simple Property Tools

Use **https://simple-property.com** URLs (live after deploy). Stripe **product images** must be **PNG** (512×512). **Branding** icon/logo accepts **PNG or JPG**; SVG sources below are for export or design tools.

## Legal URLs (Dashboard → Settings → Public details · Checkout → Legal policies)

| Page | URL |
|------|-----|
| Privacy policy | https://simple-property.com/privacy |
| Terms of service | https://simple-property.com/terms |
| Legal hub | https://simple-property.com/legal |
| Support email | hello@simple-property.com |

## Brand mark (Checkout branding · account icon)

| Asset | SVG (source) | PNG (Checkout / products) |
|-------|----------------|---------------------------|
| Site favicon / SP house | https://simple-property.com/favicon.svg | rasterize to 512×512 PNG for Dashboard |
| OG card | https://simple-property.com/og/spt-card.svg | optional marketing |

**Checkout session branding (code):** `checkoutBrandingSettings()` uses  
https://simple-property.com/stripe/pro-monthly.png as session icon today.

## Product images (one per SKU · PNG on site)

- Design in git: **512px line icons** (2–2.5px stroke, round caps) · cream field `#faf7f0` · ink `#3d3429` · sage `#4a6741` · gold `#c9a227` · quant blue `#2c5282`.
- Luxury multifamily pattern (Greystar / Bozzuto / Related-style sites): thin outline icons, one metaphor per tile, no micro-type at 512px; door = unit lifecycle, not clip-art houses.

| SKU | Idea | SVG source |
|-----|------|------------|
| Pro monthly | Cascade of doors (many units) + monthly rhythm bar | https://simple-property.com/stripe/pro-monthly.svg |
| Pro annual | Same cascade inside a year ring | https://simple-property.com/stripe/pro-annual.svg |
| Turn move-out | One door swung open + itemized sheet + deadline arc | https://simple-property.com/stripe/turn-move-out.svg |
| Turn full | Move-in door → move-out door (full tenancy) | https://simple-property.com/stripe/turn-full.svg |

| SKU | PNG for Stripe Product.images[] |
|-----|----------------------------------|
| Pro monthly | https://simple-property.com/stripe/pro-monthly.png |
| Pro annual | https://simple-property.com/stripe/pro-annual.png |
| Turn move-out | https://simple-property.com/stripe/turn-move-out.png |
| Turn full | https://simple-property.com/stripe/turn-full.png |

**OG card** (`og/spt-card.svg`): ASCII-only subtitle (no special punctuation that breaks XML parsers). Door cascade on the right. Run `node scripts/audit-svg-assets.mjs` after edits.

Regenerate PNGs from SVG: `npm run export:stripe-images` then deploy, then `npm run sync:stripe-images` (test and live). Full canon: **`docs/STRIPE_PRODUCT_IMAGES.md`**.

## Deposit Desk Checkout colors (match site)

| Role | Hex |
|------|-----|
| Background | `#eef2f6` |
| Pay button | `#3b5a78` |
| Gold accent | `#c9a227` |
| Display name | Simple Property Tools |

Innsegall checkout on the same Stripe account should use **Innsegall** session branding on innsegall.com, not these values.
