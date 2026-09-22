# Stripe Isles audit · Deposit Desk · 2026-09-22

**Account:** The Isles Collective · `acct_1UCtAeFDJKTJlxOc`  
**Shared with:** Innsegall (same Dashboard · different `isles_brand` / lane metadata)

## Live catalog (after provision)

| Brand | Live products | Notes |
|-------|---------------|--------|
| **Innsegall** | 3 | `prod_VEoWuOFwUVENSz` Extra · `prod_VEoXxxCbhp5UBE` Clan · `prod_VEoX9hJDYQTlck` MSP |
| **Deposit Desk** | **4** | `isles_brand=deposit_desk` · lanes below |

### Deposit Desk live IDs

| SKU | Product | Price | lookup_key | Amount |
|-----|---------|-------|------------|--------|
| `monthly` | `prod_VJ4quXggKOi2IH` | `price_1UISgaFDJKTJlxOcKl4GklhT` | `spt_deposit_monthly` | $22/mo |
| `annual` | `prod_VJ4qakw2M82ks6` | `price_1UISgbFDJKTJlxOcrzEvEi1X` | `spt_deposit_annual` | $99/yr |
| `turn_move_out` | `prod_VJ4qJEUYugqYml` | `price_1UISgcFDJKTJlxOcQ6r3L6Xb` | `spt_turn_move_out` | $29 once |
| `turn_full` | `prod_VJ4q8T0mIlJpM7` | `price_1UISgdFDJKTJlxOch3r5LixS` | `spt_turn_full` | $49 once |

Git mirror: `web/lib/stripe-catalog.mjs` (`live_product_id` / `live_price_id` / `checkout_image` / `stripe_description`).

**Product images:** per-SKU PNG at `https://simple-property.com/stripe/*.png` (not SVG). After deploy: `STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-images`. See `docs/STRIPE_PRODUCT_IMAGES.md`.

Innsegall live metadata pattern (Deposit Desk mirrors this):

| Key | Innsegall example | Deposit Desk |
|-----|-------------------|--------------|
| `isles_portfolio` | `the_isles` | `the_isles` |
| `isles_brand` | `innsegall` | `deposit_desk` |
| `isles_lane` | `innsegall_extra` / … | `spt_pro_monthly` / `spt_pro_annual` / `spt_turn_*` |
| Product SKU | `innsegall_sku` | `spt_sku` + `spt_plan` + `isles_product=deposit_desk` |
| Price `lookup_key` | `innsegall_*` | `spt_deposit_*` · `spt_turn_*` |

Checkout branding (Dashboard once): primary `#f4c95d` · background `#0b1d2e` (Isles fjord + gold). Deposit Desk **site** uses quant light; Stripe Checkout can stay Isles-wide.

## How to split one Stripe account

1. **Never mix brands on one Product** — one product per lane (`isles_lane` is the idempotency key in `provision-stripe-deposit-desk.mjs`).
2. **Filter webhooks by metadata** — each site endpoint only grants entitlements when `isles_brand` / `isles_product` match that app.
3. **Separate webhook signing secrets** — `simple-property.com` vs `innsegall.com` endpoints on the same account.
4. **Env per Vercel project** — same `STRIPE_SECRET_KEY`, different `STRIPE_PRICE_*` and `STRIPE_WEBHOOK_SECRET`.
5. **Reporting** — Dashboard → Products search `metadata['isles_brand']:deposit_desk` vs `innsegall`.

## Provision (operator · idempotent)

```bash
cd simple-property
export STRIPE_SECRET_KEY=sk_live_…   # or sk_test_… for test Dashboard
node scripts/provision-stripe-deposit-desk.mjs              # dry-run
node scripts/provision-stripe-deposit-desk.mjs --apply --set-lookup-keys
npm run verify-stripe   # after exporting STRIPE_PRICE_* in env
```

Live catalog already exists; re-run is no-op unless test mode products are needed.

## Vercel Production

| Variable | Value |
|----------|--------|
| `STRIPE_PRICE_MONTHLY` | `price_1UISgaFDJKTJlxOcKl4GklhT` |
| `STRIPE_PRICE_ANNUAL` | `price_1UISgbFDJKTJlxOcrzEvEi1X` |
| `STRIPE_PRICE_TURN_MOVE_OUT` | `price_1UISgcFDJKTJlxOcQ6r3L6Xb` |
| `STRIPE_PRICE_TURN_FULL` | `price_1UISgdFDJKTJlxOch3r5LixS` |
| `STRIPE_SECRET_KEY` | Isles live secret |
| `STRIPE_WEBHOOK_SECRET` | Apex `https://simple-property.com/api/stripe/webhook` |
| `SPT_ENTITLEMENT_SECRET` | `openssl rand -hex 32` |
| `SPT_SITE_URL` | `https://simple-property.com` |

## Test mode

Stripe MCP session used **live mode only**. For `sk_test_` products, run `provision-stripe-deposit-desk.mjs --apply` with a test key locally (creates parallel test IDs; do not paste test IDs into Production env).
