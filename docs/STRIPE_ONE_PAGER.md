# Stripe one-pager · Deposit Desk

**Apex:** `https://simple-property.com` · **Stripe account:** Isles (optional shared with Innsegall) · Not legal advice.

## Source of truth (git)

| What | Path |
|------|------|
| **Price amounts, SKUs, metadata, lookup keys** | `web/lib/stripe-catalog.mjs` |
| **Pro unit cap (40)** | `web/lib/pro-limits.mjs` |
| **Checkout API** | `web/api/stripe/checkout.js` |
| **Webhook** | `web/api/stripe/webhook.js` |
| **Customer portal** | `web/api/stripe/portal.js` |
| **Entitlement HMAC + restore** | `web/lib/entitlement.mjs`, `web/lib/entitlement-verify.mjs`, `web/lib/stripe-entitlement.mjs` |
| **Browser checkout client** | `web/sp-checkout.js` |
| **Browser entitlement restore** | `web/sp-entitlement.js` |
| **KV index (turn + sub)** | `web/lib/kv-client.mjs` |
| **Dashboard setup narrative** | `docs/STRIPE_ISLES_CATALOG.md` |
| **Pricing canon (free vs Pro)** | `docs/PRICING_CANON.md` |
| **Per-turn strategy** | `docs/PER_TURN_PRICING.md`, `docs/PRICING_DIVE_PER_TURN.md` |
| **Env template** | `web/.env.example` |
| **Vercel env table** | `docs/VERCEL_SETUP.md` §3 |
| **Verify prices vs Dashboard** | `npm run verify-stripe` → `scripts/verify-stripe-catalog.mjs` |
| **Pricing audit** | `npm run audit:pricing` → `scripts/audit-pricing.mjs` |

## Products to create (Stripe Dashboard)

Metadata on every price: `isles_product=deposit_desk`, `spt_sku`, `spt_plan`, and `spt_units_max=40` on Pro only.

| Env var | SKU | Mode | Price | lookup_key |
|---------|-----|------|-------|------------|
| `STRIPE_PRICE_MONTHLY` | `monthly` | subscription · month | **$22.00** | `spt_deposit_monthly` |
| `STRIPE_PRICE_ANNUAL` | `annual` | subscription · year | **$99.00** | `spt_deposit_annual` |
| `STRIPE_PRICE_TURN_MOVE_OUT` | `turn_move_out` | one-time | **$29.00** | `spt_turn_move_out` |
| `STRIPE_PRICE_TURN_FULL` | `turn_full` | one-time | **$49.00** | `spt_turn_full` |

**Aliases in code:** `turn_move_in` and `turn` → checkout as **`turn_move_out`** ($29).

If `STRIPE_PRICE_*` unset, Checkout uses inline **`price_data`** from catalog (OK for test; set live IDs before flip).

## Webhooks

| Environment | URL |
|-------------|-----|
| Production | `https://simple-property.com/api/stripe/webhook` |
| Preview | `https://<preview-host>.vercel.app/api/stripe/webhook` |

**Events:** `checkout.session.completed` · `customer.subscription.updated` · `customer.subscription.deleted` · `invoice.paid`

**Secret:** `STRIPE_WEBHOOK_SECRET` · **one signing secret per endpoint URL** (Innsegall keeps its own on `innsegall.com`).

## Vercel env (operator checklist)

| Variable | Production |
|----------|------------|
| `STRIPE_SECRET_KEY` | `sk_live_…` when live |
| `STRIPE_WEBHOOK_SECRET` | Apex webhook signing secret |
| `STRIPE_PRICE_MONTHLY` / `ANNUAL` / `TURN_MOVE_OUT` / `TURN_FULL` | Live `price_…` IDs |
| `SPT_ENTITLEMENT_SECRET` | Random 32+ bytes (unique vs preview) |
| `SPT_SITE_URL` | `https://simple-property.com` |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Upstash (Pro/turn restore) |
| `RESEND_API_KEY` + `SPT_EMAIL_FROM` | Optional until email live |

## Flow

1. **Pro:** `/pricing` or app → Checkout subscription → webhook → signed entitlement · print/PDF all packets ≤40 units.
2. **Per-turn:** Wizard step 5 → `sp-checkout.js` POST `/api/stripe/checkout` with `sku` + **`spt_packet_id`** → one-time payment → print/PDF for that packet id only.

## Branding (Dashboard once)

Primary `#f4c95d` · Background `#0b1d2e` · matches `web/simple-property.css`.

## Live flip order

1. Test $29 turn + $99 annual on preview.
2. Create **live** prices (new IDs).
3. Vercel Production env + apex webhook.
4. `npm run smoke:prod` (optionally `SPT_SMOKE_URL=https://simple-property.com` once DNS is green).

Parallel Innsegall process: `innsegall/docs/STRIPE_LIVE_FLIP.md`.
