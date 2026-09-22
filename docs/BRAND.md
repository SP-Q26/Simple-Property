# Brand · Simple Property Tools

**Status:** locked · Midwest mom-and-pop · see `CANON.md` · Stripe images `STRIPE_PRODUCT_IMAGES.md`.

## Who it’s for

**Mom-and-pop operators** — usually **1–3 people** running a handful of doors (Pro cap **40 units**), not a property management company.

## Lockup

| Element | Value |
|---------|--------|
| Umbrella | **Simple Property Tools** |
| Product | **Deposit Desk** |
| Header tag | **Itemize it. Date it. Keep the clock. · IL · IN · OH · MI · IA · MO** |
| Footer | **Simple Property Tools · not legal advice** |
| Mark | `/favicon.svg` only (no mascot) |

Retired: **Homestead** farmhouse mark and “plain dealing” tagline.

## Voice (SEO + conversion)

- Lead with **statutory deadlines**, **surrender date**, **itemization**, **vs spreadsheet** (IL + Chicago RLTO where relevant; six-state Midwest scope on product).
- **Per-turn unlocks** for occasional turnover; **Pro subscription** when you run many doors year-round.
- Short sentences. “Packet,” “receipt,” “deadline,” “keep a copy.”
- **Manage billing** on simple-property.com (never “Customer Portal” in customer copy).
- Not legal advice · documentation software only.

## Visual

- **Chicago RE quant palette:** cream `#f4f0e6` · bark ink `#3d3429` · sage success · **gold accent** `#c9a227`
- **Quant blue wash:** fact strip, form panels, pricing cards, deadline box (gold left rail)
- **Typography:** **Lora** + **Inter** · **`simple-property.css?v=18`**
- **Atmosphere:** Chicago **greystone** (limestone lintel, brick pilasters, stoop) · **steel door** + SP monogram · layered weather · `web/brand/atmosphere.html`
- **Stripe product tiles:** icon-only 512×512 · door cascade (Pro) · swing (move-out) · IN→OUT (full tenancy)

## Checkout (hosted)

- **Product images:** `https://simple-property.com/stripe/*.png` via `npm run sync:stripe-images`
- **Session branding:** `checkoutBrandingSettings()` · quant light background · SP icon PNG
- **Legal:** `/terms` · `/privacy` · consent on checkout session

## Audit

```bash
npm run audit   # includes audit-branding-copy.mjs, audit-brand-shell.mjs, audit-svg-assets.mjs
```
