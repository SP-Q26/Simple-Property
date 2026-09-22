# Stripe Isles catalog · Deposit Desk + Innsegall

**One Stripe account (Isles)** · shared Checkout branding (fjord + gold). Not legal advice.

## Dashboard branding (once)

Settings → Branding:

| Field | Value |
|-------|--------|
| Primary | `#f4c95d` (beam gold) |
| Background | `#0b1d2e` (fjord deep) |
| Icon | Deposit Desk mark or Isles shared mark |

Matches `innsegall/web/innsegall.css` and `simple-property/web/simple-property.css` v11.

---

## Products (live provisioned 2026-09-22)

Live price IDs are in `web/lib/stripe-catalog.mjs` and `docs/STRIPE_ISLES_AUDIT_2026-09-22.md`. Create **test** parallels with `sk_test_` + `provision-stripe-deposit-desk.mjs --apply`.

**Isles cross-brand** (same account as Innsegall): set `isles_portfolio=the_isles`, `isles_brand=deposit_desk`, `isles_lane=spt_*` on each product. Innsegall uses `isles_brand=innsegall` · never mix SKUs on one product. Audit: `docs/STRIPE_ISLES_AUDIT_2026-09-22.md` · provision: `node scripts/provision-stripe-deposit-desk.mjs --apply --set-lookup-keys`.

| Env var | SKU | Mode | Amount | lookup_key (suggested) |
|---------|-----|------|--------|-------------------------|
| `STRIPE_PRICE_MONTHLY` | `monthly` | subscription monthly | **$22.00** | `spt_deposit_monthly` |
| `STRIPE_PRICE_ANNUAL` | `annual` | subscription yearly | **$99.00** | `spt_deposit_annual` |
| `STRIPE_PRICE_TURN_MOVE_OUT` | `turn_move_out` | one-time | **$29.00** | `spt_turn_move_out` |
| `STRIPE_PRICE_TURN_FULL` | `turn_full` | one-time | **$49.00** | `spt_turn_full` |

**Catalog source:** `web/lib/stripe-catalog.mjs`  
**Verify:** `STRIPE_SECRET_KEY=<test secret> npm run verify-stripe`

If env price IDs are unset, Checkout uses inline `price_data` (fine for test; set IDs before live).

---

## Webhook (Deposit Desk site)

**URL:** `https://simple-property.com/api/stripe/webhook`  
(or Vercel preview URL during test)

**Events:**

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`

**Vercel env (Production):**

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Same Isles account as Innsegall when operator chooses unified billing |
| `STRIPE_WEBHOOK_SECRET` | **Separate** endpoint secret per site URL |
| `STRIPE_PRICE_*` | Four price IDs above |
| `SPT_ENTITLEMENT_SECRET` | HMAC for `/api/entitlement` |
| `KV_REST_*` | Turn unlock + subscription index |

Innsegall webhook stays on `innsegall.com/api/stripe/webhook` with its own signing secret.

---

## Per-turn flow

1. Wizard step 5 → **Unlock this turn · $29** (metadata `spt_packet_id`).
2. Checkout `mode: payment` → success → signed turn entitlement in browser.
3. Print/PDF enabled for **that packet id** only.
4. Pro subscription still unlocks all packets (≤40 units).

---

## Live flip order

1. Test mode: one $29 turn + one $99 annual on preview URL.
2. Create **live** prices (new IDs, not test IDs).
3. Update Vercel Production env for **simple-property.com**.
4. `npm run smoke:prod` · manual Checkout smoke.

See Innsegall: `innsegall/docs/STRIPE_LIVE_FLIP.md` (parallel process, same account optional).
