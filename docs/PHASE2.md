# Build phase 2 · Simple Property Tools

Shipped while branching for preview deploy.

## Product

- [x] **Stripe Customer Portal** — `POST /api/stripe/portal` + buttons on pricing, success, app
- [x] **Webhook hardening** — subscription + renewal structured logs
- [x] **Entitlement** includes `stripe_customer` for portal
- [x] **Move-in photos** — per room, localStorage, print layout
- [x] **Saved packets** — up to 20 in browser, load from app bar
- [x] **Deadline reminders** — reminder dates on step 5 + **.ics** calendar download (no email server yet)

## Content / ops

- [x] Blog: vs inspection apps · vs spreadsheet
- [x] `scripts/verify-stripe-catalog.mjs`
- [x] Audit script extended (portal, ics, billing JS)

## Still phase 3

Moved to **`docs/PHASE3.md`** (KV entitlements, magic link, email reminders).

## Verify

```bash
cd web && npm run audit
# optional: export STRIPE_SECRET_KEY && node ../scripts/verify-stripe-catalog.mjs
```
