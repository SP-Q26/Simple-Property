# Brand · Simple Property Tools

**Status:** locked · Midwest mom-and-pop · see `CANON.md` · Stripe images `STRIPE_PRODUCT_IMAGES.md`.

## Who it’s for

**Mom-and-pop operators** — usually **1–3 people** running a handful of doors (Pro cap **40 units**), not a property management company.

## Lockup

| Element | Value |
|---------|--------|
| Umbrella | **Simple Property Tools** |
| Product | **Deposit Desk** |
| Header tag | **Itemize it. Date it. Beat the clock. · Founded in Chicago · 18 states + DC** |
| Footer | **Simple Property Tools · not legal advice** |
| Mark | `/favicon.svg` only (no mascot) |

Retired: **Homestead** farmhouse mark and “plain dealing” tagline.

## Voice (SEO + conversion)

**Lead problem → fix.** One sharp problem line (deadline, proof, seasonality, scale), then one fix line naming **Deposit Desk** and the outcome (dated packet, print, surrender math). Use classes **`.ps-problem`** and **`.ps-fix`** on landing, pricing, app intro, launch stack, logs, success, and feedback. Do not prefix copy with **Pain:** / **Solution:** on the hero.

- **Pain themes:** missed statutory return window · disputed withhold without move-in proof · spreadsheet/surrender chaos · per-turn seasonality · portfolio outrunning memory.
- **Solution themes:** five-step wizard · surrender-driven 30/45-day math · line-item export · per-turn or Pro pricing · not a PM suite.
- Short sentences. “Packet,” “receipt,” “deadline,” “keep a copy.”
- **Manage billing** on simple-property.com (never “Customer Portal” in customer copy).
- Not legal advice · documentation software only.

## Visual

- **Chicago RE quant palette:** cream `#f4f0e6` · bark ink `#3d3429` · sage success · **gold accent** `#c9a227`
- **Quant blue wash:** fact strip, form panels, pricing cards, deadline box (gold left rail) · **Solution:** lines use quant blue
- **Typography:** **Lora** + **Inter** · **`simple-property.css?v=21`**
- **Atmosphere:** Chicago **greystone** · slim **castle door** · stronger **weather** · `web/brand/atmosphere.html`
- **Stripe product tiles:** icon-only 512×512 · door metaphors per SKU

## Checkout (hosted)

- **Product images:** `https://simple-property.com/stripe/*.png` via `npm run sync:stripe-images`
- **Session branding:** `checkoutBrandingSettings()` · quant light background · SP icon PNG
- **Legal:** `/terms` · `/privacy` · consent on checkout session

## Audit

```bash
npm run audit   # includes audit-branding-copy.mjs, audit-brand-shell.mjs, audit-svg-assets.mjs
```
