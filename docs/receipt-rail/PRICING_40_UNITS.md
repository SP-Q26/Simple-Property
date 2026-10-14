# Pricing · 40-unit ceiling · tools suite

**Canon:** Simple Property Tools is a **suite** (Receipt Rail hub + Deposit Desk). **40 units** is the intentional ceiling for self-serve — mom-and-pop through a **small family crew** (~$1.5M+ gross rent band at typical Midwest mixes, not legal/financial advice).

## Audience bands

| Band | Units (typical) | Who | Suite job |
|------|-----------------|-----|-----------|
| **Mom-and-pop** | 1–4 | Side income, first duplex | One flawless turnover packet |
| **Family crew** | 5–15 | Siblings/parents, one city | Compare move-in/out every door |
| **Small operator** | 16–40 | PM lite, no AppFolio | Vault + seats + ops modules (P3) |

Above 40 doors → **hello@simple-property.com** (white-glove / custom). Same as today’s Pro overflow messaging.

## Recommended tiers (hub + Deposit Desk bundled)

| Tier | Price | Cap | What ships |
|------|-------|-----|------------|
| **Free** | $0 | 1 property · **2 units** · 1 finalized receipt/mo | Watermarked PDF · Deposit Desk draft |
| **Keeper** | **$29/mo** | **10 units** · unlimited core receipts | Move-in/out · compare (P2) · **includes today’s Deposit Desk Pro** for those units |
| **Portfolio** | **$79/mo** | **40 units** · **3 seats** | Keeper + ops modules (P3) · shared Vault |
| **À la carte** | $29 move-out · $49 full tenancy | Per packet | **Keep live SKUs** until hub Stripe split; map to `move_out_condition` + exhibit |

**Why not $19/$15 in prod yet:** Live turn unlock is **$29/$49** and already anchored in SEO and wizard copy. Hub à la carte **merges** to those prices at Stripe catalog cutover — do not undercut in UI until then.

## Add-ons (unchanged)

STR +$15/mo · Loss/inventory +$12/mo · Extra seat +$9/mo · White-glove $299 · Concierge move-out $149.

## Enforcement

- **Unit count** on property/org (not door count hidden across orgs).
- Deposit Desk step 1 `prop-units` and Pro gate already use `PRO_UNITS_MAX = 40` in code.
- Hub Keeper/Portfolio caps enforced at **finalize** and **export** (server, P1).

## Messaging line

> **Up to 40 units** — from mom-and-pop to the small business still running its own turns, not a REIT.
