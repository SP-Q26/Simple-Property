# Per-turn checkout · recommendation (2026-09-22)

**Short answer:** Do **not** build a custom card form or bespoke payment stack. Extend what you already have: **Stripe Checkout** in **`mode: payment`**, same `/api/stripe/checkout.js` pattern as Pro, with **packet-scoped entitlement** — not a second product UI.

---

## Why not “custom checkout”

| Approach | Verdict |
|----------|---------|
| Custom HTML card fields + Stripe Elements | PCI scope, more bugs, no Apple Pay for free |
| PayPal / second processor | Split webhooks and support |
| **Stripe Checkout one-time** | Same success URL, same webhook, tenant trust |
| Invoice + manual unlock | Kills per-turn conversion |

“Custom” here should mean **your entitlement model** (unlock **this `packet.id`**), not custom payment UI.

---

## Phase A (ship first) · landlord pays one turn

1. **Catalog** — add to `stripe-catalog.mjs`:
   - `turn_move_out` · $2900 · `mode: payment`
   - `turn_full` · $4900 · `mode: payment`  
   (Optional: `turn_move_in` · $2900; lead with **move-out** + **full tenancy**.)

2. **Checkout API** — POST body: `{ sku, packet_id, turn_type }`.  
   - If `mode === payment`: **omit** `subscription_data`.  
   - `metadata`: `spt_sku`, `spt_packet_id`, `spt_payer: landlord`.

3. **Webhook** — on `checkout.session.completed` with `mode === payment`: write **turn unlock** record (KV or Stripe metadata + signed client token):
   - Key: `packet_id`  
   - Value: `{ paid_at, sku, session_id }`  
   - Issue entitlement with `plan: "turn"`, `packet_id`, long-lived or no expiry until used once for print.

4. **App** — step 5 buttons:
   - **Unlock this packet · $29** (primary for non-subscribers)  
   - **Pro subscription** (secondary link)  
   - `canExportPro()` → subscription **OR** valid turn unlock for `draft.id`.

5. **Success** — `/success?session_id=…&plan=turn_move_out&packet_id=…` → existing entitlement fetch extended for one-time sessions.

**Env:** `STRIPE_PRICE_TURN_MOVE_OUT`, `STRIPE_PRICE_TURN_FULL` (or `price_data` fallback like today).

---

## Phase B · tenant pay link

Reuse same Checkout session with `customer_email` prefilled and `metadata.spt_payer: tenant`. Email via Resend: “Pay documentation fee for [address].” Landlord gets webhook when paid.

---

## Pricing page order (when Phase A live)

**Free → Per turn (working checkout) → Pro.** Demote featured styling on Pro until per-turn works.

---

## What to skip for v1

- Coupons on per-turn (Pro promos only is fine)  
- Multiple currencies  
- WI / forwarding-address SKU  
- Linking turn fee to Stripe Connect tenant payout  

---

## SEO (parallel track)

Pain-intent posts + home meta shift — see `scripts/generate-pain-seo-posts.mjs` and `npm run generate-pain-seo`.

---

## Decision locked (recommended)

| Question | Pick |
|----------|------|
| Custom payment UI? | **No** — Stripe Checkout |
| SKUs v1 | **`turn_move_out` $29** + **`turn_full` $49** |
| Default payer | **Landlord** checkout on step 5 |
| Keep Pro? | **Yes** — breakeven ~3 events/year |

When you say go on Phase A, implement catalog + checkout branch + turn store + `canExportPro()` in one PR.
