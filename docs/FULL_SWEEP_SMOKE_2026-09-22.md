# Simple Property Tools · full sweep smoke · 2026-09-22

**Apex:** `https://simple-property.com`  
**Command canon:** `SPT_SMOKE_URL=https://simple-property.com npm run smoke:full`  
**Isles Stripe:** `acct_1UCtAeFDJKTJlxOc` · `isles_brand=deposit_desk`

---

## Executive scorecard

| Lane | Gate | Result |
|------|------|--------|
| **Repo P0 (audit-spt-web)** | Files, wizard, APIs present | **PASS** |
| **Swarm metrics** | 13 lanes ≥ 95 | **PASS** (all 100) |
| **Prod content smoke** | `smoke-prod.mjs` | **PASS** |
| **Extended HTTP** | app, discovery, sitemap, API shapes | **PASS** |
| **Live checkout API** | `smoke-checkout-live.mjs` (annual, monthly, turn) | **PASS** → `cs_live_…` + `checkout.stripe.com` |
| **Mobile / visual / em-dash** | Responsive + brand tokens | **PASS** |
| **Links + legal + branding** | Inside `audit` chain | **PASS** |
| **Git hygiene** | `audit:git` | **PASS** (3 warns: SSH in sandbox, dirty tree, nested in SPQ) |
| **Browser Hosted Checkout UI** | `?buy=annual` in Cursor browser | **AMBER** — session created; Stripe showed line item then **“We couldn’t load checkout”** (often automation / third-party cookie; verify in Safari/Chrome) |
| **Magic-link restore** | `POST /api/auth/magic-link` | **AMBER** — `503 email_not_configured` (Resend/env not on Production) |

**Ship read:** **Green for marketing, wizard, SEO, and checkout session creation.** **Amber** on operator email restore and **human-browser** Stripe render confirmation.

---

## Commands run (this sweep)

```bash
cd simple-property
SPT_SMOKE_URL=https://simple-property.com npm run smoke:full   # audit + prod + extended + checkout
npm run audit:swarm
npm run audit:mobile
npm run audit:visual
npm run audit:em-dash
npm run audit:git
node scripts/audit-links.mjs
```

### `smoke:full` breakdown

1. **`audit-spt-web.mjs`** — proud-ship P0, brand shell, Google tools, blog SEO swarm, discovery, pricing, swarm, links, customer lane, legal, SVG, branding copy.
2. **`smoke-prod.mjs`** — `/`, `/feedback`, `/pricing`, `/logs`, sample blog, `/terms`, `/privacy`, `/legal`, hosted `/stripe/*.png`.
3. **`smoke-prod-extended.mjs`** — `/app`, `/launch-stack`, `/success`, `/blog`, `/llms.txt`, `/robots.txt`, gospel + ai-bus JSON, `sitemap.xml`, GET checkout 405, feedback honeypot 200.
4. **`smoke-checkout-live.mjs`** — POST checkout annual · monthly · turn_move_out (with `packet_id`).

---

## Funnel smoke (WWL lens)

| Step | Surface | Result |
|------|---------|--------|
| Home hero + pathway deck | `/` | **PASS** (content smoke) |
| Free wizard | `/app` steps 1–5 | **PASS** (extended + manual prior pass) |
| Pricing CTAs | `/pricing` | **PASS** API; browser auto-buy → Stripe URL |
| Per-turn unlock | step 5 `$29` | **PASS** API (`turn_move_out` + packet_id) |
| Hosted Checkout | Stripe | **API PASS** · **UI verify in real browser** |
| Success / entitlement | `/success` | Page 200 · `sptRefreshEntitlement` present · not E2E-paid this sweep |

---

## API probe log (no card)

| Endpoint | Method | Expected | Observed |
|----------|--------|----------|----------|
| `/api/stripe/checkout` | GET | 405 | **405** |
| `/api/stripe/checkout` | POST `annual` | 200 + `url` | **200** `cs_live_…` |
| `/api/stripe/checkout` | POST `monthly` | 200 + `url` | **200** |
| `/api/stripe/checkout` | POST `turn_move_out` + packet | 200 + `url` | **200** |
| `/api/feedback` | POST honeypot | 200 silent | **200** |
| `/api/entitlement` | GET bad session | 4xx | **400** `missing_session_customer_or_magic` |
| `/api/stripe/portal` | POST no customer | 4xx | **400** `missing_customer_id` |
| `/api/auth/magic-link` | POST email | 200 or configured | **503** `email_not_configured` |

---

## P0 / P1 follow-ups

| ID | Sev | Item | Action |
|----|-----|------|--------|
| SPT-S1 | P1 | Magic-link / restore on new device | Set Resend (or provider) + env on Vercel Production per `api/auth/magic-link.js` |
| SPT-S2 | P1 | Stripe UI in automation | Operator: open `/pricing` → Subscribe annual in **Safari/Chrome**; confirm pay form loads (not only API `url`) |
| SPT-S3 | P2 | Open checkout sessions | Smoke created multiple `cs_live_…` — expire stale sessions in Stripe Dashboard |
| SPT-S4 | P2 | Git warns | Commit `smoke-prod-extended.mjs` + `package.json` smoke:full from `simple-property` root; not SPQ parent |

---

## Isles handoff (one paragraph)

Deposit Desk prod sweep: **all automated gates green** including **live checkout session URLs** for Pro and per-turn SKUs on the shared Isles account. Wizard and SEO cluster are intact. **Configure email** for magic-link restore before promising “new device” on pricing. Confirm Hosted Checkout renders in a normal browser (automation may show Stripe’s generic load error). Canon env: `docs/STRIPE_ISLES_AUDIT_2026-09-22.md`. Prior checkout-500 incident: **resolved** as of this sweep (API 200).

---

## Related docs

- Checkout-focused audit (earlier same day): `BOOKING_CHECKOUT_SMOKE_AUDIT_2026-09-22.md`
- Operator E2E after env green: add `STRIPE_SMOKE.md` (fork Innsegall pattern) — **not written yet**

*Generated from automated sweep · 2026-09-22 evening CT.*
