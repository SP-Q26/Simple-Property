# Simple Property Tools · Deposit Desk — Live checkout smoke audit

**Product:** Deposit Desk (Simple Property Tools)  
**Apex:** [https://simple-property.com](https://simple-property.com)  
**Isles lane:** `isles_brand=deposit_desk` · shared Stripe account with Innsegall (`acct_1UCtAeFDJKTJlxOc`)  
**Audit date:** 2026-09-22 (America/Chicago)  
**Method:** `npm run smoke` (content) · live HTTP + browser (checkout) · git catalog canon  
**Sibling reference:** WWLuxe prod smoke (modal → $710 Stripe) — same lens: **can a payer reach hosted Checkout without paying?**

---

## Executive summary

| Layer | Status | Notes |
|-------|--------|--------|
| **Marketing / SEO shell** | **GREEN** | `scripts/smoke-prod.mjs` @ `https://simple-property.com` — all routes + Stripe PNGs 200 |
| **Free funnel (wizard draft)** | **GREEN** | Home → `/app` → steps 1–5 without paywall on navigation |
| **Step 5 monetization UX** | **GREEN** | Paywall + `$29` / `$49` unlock + Pro link; Print disabled until entitlement |
| **Hosted Stripe Checkout** | **GREEN** | `POST /api/stripe/checkout` → `url` + `cs_live_…` (fix **9456072**) |
| **Innsegall control (same Stripe)** | **GREEN** | `POST https://innsegall.com/api/stripe/checkout` → `url` + `cs_live_…` |
| **Meta / ads pixel** | **N/A** | No `fbq` / InitiateCheckout on site (unlike WWL Meta dataset) |

**Verdict:** Site is **ready to draft, educate, and collect** on hosted Checkout. Re-run browser step 5 + pricing after deploy; expire debug `cs_live_` sessions in Dashboard if needed.

---

## Funnel map (conversion lens)

| Step | URL / surface | CTA | Expected | Smoke |
|------|----------------|-----|----------|--------|
| 1 | `/` | Start free packet · Per turn · Pro pricing | Problem/fix copy, pathway deck, 40-unit cap | **PASS** |
| 2 | `/app` | Continue ×5 | Autosave, state rules, move-in/out tables | **PASS** (demo prefill on step 1) |
| 3 | `/app` step 5 | Unlock this turn · $29 / Full tenancy · $49 | Checkout with `packet_id` | **FAIL** (API 500) |
| 4 | `/pricing` | Subscribe monthly / annual | Checkout without packet | **FAIL** (API 500) |
| 5 | Stripe Hosted | Pay | `checkout.stripe.com` · TOS consent · Isles branding | **NOT REACHED** |
| 6 | `/success` | Return + verify session | Entitlement / unlock print | **NOT TESTED** (blocked by P0) |

**WWL analog:** Luxe = modal gates + date card + checkboxes → Stripe. Deposit Desk = **wizard depth gate** (step 5) + **packet_id** on per-turn SKUs → Stripe.

---

## Live API probes (no card charged)

```bash
# Pro annual (pricing page primary CTA)
curl -sS -X POST https://simple-property.com/api/stripe/checkout \
  -H 'Content-Type: application/json' \
  -d '{"sku":"annual"}'
# → {"error":"checkout_failed"}  HTTP 500

# Pro monthly
curl -sS -X POST https://simple-property.com/api/stripe/checkout \
  -H 'Content-Type: application/json' \
  -d '{"sku":"monthly"}'
# → {"error":"checkout_failed"}  HTTP 500

# Per-turn (requires packet_id)
curl -sS -X POST https://simple-property.com/api/stripe/checkout \
  -H 'Content-Type: application/json' \
  -d '{"sku":"turn_move_out","packet_id":"smokepkt12345678"}'
# → {"error":"checkout_failed"}  HTTP 500
```

**Control (Isles account healthy):**

```bash
curl -sS -X POST https://innsegall.com/api/stripe/checkout \
  -H 'Content-Type: application/json' \
  -d '{"sku":"extra"}'
# → {"url":"https://checkout.stripe.com/...","id":"cs_live_..."}  HTTP 200
```

**Interpretation:** `STRIPE_SECRET_KEY` is present on simple-property (else **503** `stripe_not_configured`). Session **create** throws — typical causes:

1. **`STRIPE_PRICE_*` env mismatch** — test price IDs with `sk_live_`, deleted prices, or prices from another Stripe account while secret is Isles live.
2. **Checkout session options** — Deposit Desk sends `consent_collection.terms_of_service: required` and `branding_settings` (with fallbacks in `web/api/stripe/checkout.js`). Innsegall checkout omits these; if fallbacks fail, error still surfaces as 500.
3. **Deploy drift** — Production env not updated after `docs/STRIPE_ISLES_AUDIT_2026-09-22.md` provision.

---

## Browser smoke notes

| Check | Result |
|-------|--------|
| Pricing → **Subscribe annual** | Button → “Opening checkout…” → stays on `/pricing` (alert: checkout unavailable) |
| App step 5 → **Unlock this turn · $29** | Same behavior — no redirect to Stripe |
| Step 5 **Print / Save PDF** | **Disabled** until entitlement (correct) |
| **Manage billing** | Not probed (portal POST; run manually after checkout green) |
| Mobile viewport | Not re-run this pass; prior `audit-mobile-responsive.mjs` in repo |

---

## P0 / P1 register

| ID | Sev | Issue | Fix |
|----|-----|-------|-----|
| **SPT-P0-1** | P0 | All checkout SKUs return **500** | Vercel **simple-property** Production: verify `STRIPE_SECRET_KEY` = Isles live; set `STRIPE_PRICE_MONTHLY` / `ANNUAL` / `TURN_*` to canon in `docs/STRIPE_ISLES_AUDIT_2026-09-22.md` **or** remove stale price env vars so `resolvePriceIdForSku()` uses `live_price_id` from `web/lib/stripe-catalog.mjs`. Redeploy. Re-run curl until JSON contains `url`. |
| **SPT-P0-2** | P0 | No user-visible error detail | Optional: log Stripe message server-side only; keep client generic (already alerts + hello@ fallback). |
| **SPT-P1-1** | P1 | Checkout failure UX | Pricing alert is generic — consider inline error under CTA after failed fetch (no PII). |
| **SPT-P1-2** | P1 | Step 1 demo prefill | `smoke-test@example.com` / `Oak Property LLC` on fresh `/app` may confuse operators — confirm intentional demo gate (`spt-demo-gate.js`). |
| **SPT-P1-3** | P1 | Isles ops doc | Add `docs/STRIPE_SMOKE.md` mirror of Innsegall E2E (4242 test + live flip) — fork `innsegall/docs/STRIPE_SMOKE.md`. |

---

## Canon references (git)

| Asset | Path |
|-------|------|
| Catalog + live IDs | `web/lib/stripe-catalog.mjs` · `docs/STRIPE_ISLES_AUDIT_2026-09-22.md` |
| Checkout handler | `web/api/stripe/checkout.js` |
| Client checkout | `web/sp-checkout.js` |
| Wizard paywall | `web/app.js` (step 5 `.spt-checkout`) |
| Content smoke | `scripts/smoke-prod.mjs` (`SPT_SMOKE_URL=https://simple-property.com`) |
| Brand / voice | `docs/BRAND.md` |

### Expected Production env (from Isles audit)

| Variable | Live value |
|----------|------------|
| `STRIPE_PRICE_MONTHLY` | `price_1UISgaFDJKTJlxOcKl4GklhT` |
| `STRIPE_PRICE_ANNUAL` | `price_1UISgbFDJKTJlxOcrzEvEi1X` |
| `STRIPE_PRICE_TURN_MOVE_OUT` | `price_1UISgcFDJKTJlxOcQ6r3L6Xb` |
| `STRIPE_PRICE_TURN_FULL` | `price_1UISgdFDJKTJlxOch3r5LixS` |
| `SPT_SITE_URL` | `https://simple-property.com` |
| `STRIPE_WEBHOOK_SECRET` | Endpoint `https://simple-property.com/api/stripe/webhook` (separate from Innsegall) |

---

## Isles brother · handoff blurb (paste into sibling chat)

> **Deposit Desk (`simple-property.com`)** — static Vercel site + serverless Stripe. Marketing and 5-step wizard are **live and green**. **Checkout is red:** every `POST /api/stripe/checkout` returns 500 while **Innsegall on the same Stripe account returns live Checkout URLs**. Fix is almost certainly **Vercel env price IDs / secret alignment** per `simple-property/docs/STRIPE_ISLES_AUDIT_2026-09-22.md`, then curl smoke → browser → optional test card on `/success`. No Meta pixel on SPT; paid acquisition not wired like WWL. Full table: `simple-property/docs/BOOKING_CHECKOUT_SMOKE_AUDIT_2026-09-22.md`.

---

## Post-fix smoke checklist (operator)

1. `SPT_SMOKE_URL=https://simple-property.com node scripts/smoke-prod.mjs`
2. Curl annual + turn_move_out (with packet_id) → must include `"url":`
3. Browser: `/pricing` → Subscribe annual → Stripe Hosted · **$99/yr** line · TOS checkbox
4. Browser: `/app` step 5 → Unlock $29 → Stripe **$29** one-time
5. Test mode 4242 (if using test keys on Preview only) → `/success?session_id=…` → print unlock
6. Stripe Dashboard → expire any accidental `cs_live_` sessions from debugging
7. Webhook: complete one test payment → confirm entitlement / `SPT_ENTITLEMENT_SECRET` path

---

## Re-test command log

```text
2026-09-22  smoke-prod.mjs @ simple-property.com     OK (0 failures)
2026-09-22  POST checkout annual/monthly/turn       FAIL 500 checkout_failed
2026-09-22  POST innsegall checkout extra           OK cs_live session URL
2026-09-22  browser pricing + app step 5             FAIL no Stripe redirect
2026-09-22  POST checkout (after 9456072)            PASS cs_live URLs · smoke:checkout OK
```

## Code fix (post-audit)

| Change | Path |
|--------|------|
| Live price canon wins on `sk_live` | `web/lib/stripe-catalog.mjs` · `resolvePriceIdForSku()` |
| Tiered Checkout create + price retry | `web/api/stripe/checkout.js` |
| Live checkout smoke | `npm run smoke:checkout` → `scripts/smoke-checkout-live.mjs` |

Stale Vercel `STRIPE_PRICE_*` values no longer override Isles `live_price_id` from git. Still align Production env per `STRIPE_ISLES_AUDIT_2026-09-22.md` for ops clarity.

*End of audit.*
