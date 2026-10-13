# Full send · Stripe + platform smokes (production)

Run from **repo root** with workspace = **`Simple-Property`** (branch **`main`**). Target: **`https://simple-property.com`**.

## One command

```bash
cd ~/SPQ/simple-property
export STRIPE_SECRET_KEY='sk_live_…'   # required for Dashboard diff; from Stripe Dashboard (Vercel integration secrets are not pullable)
npm run full-send
```

`full-send` runs, in order:

1. `audit:resend` — code + live health (`resend`, `kv`, `ready`)
2. `audit:stripe-live` — Stripe Dashboard vs `web/lib/stripe-catalog.mjs` (names, descriptions, images, prices, metadata)
3. `smoke:health` — `/api/health/services`
4. `smoke:reminders` — subscribe + gates (no mail sent to real inboxes in smoke path)
5. `smoke:feedback` — `/feedback` + agent form + `POST /api/feedback`
6. `smoke:checkout` — creates **live** Checkout sessions (expire stale `cs_live_…` in Dashboard after)
7. `audit` — proud-ship P0 + full sub-audit chain (blogs, copy, forms, SEO, …)
8. `smoke:prod` · `smoke:extended` · `smoke:states-blogs` · `smoke:magic-link`

Override base URL: `SPT_SMOKE_URL=https://… npm run full-send`

## If `audit:stripe-live` fails

| Drift | Fix |
|-------|-----|
| Description / name | `STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-products` then re-run audit |
| Images only | `npm run export:stripe-images` · deploy · `npm run sync:stripe-images` |
| Catalog amounts / IDs | Edit `web/lib/stripe-catalog.mjs` + `docs/STRIPE_ISLES_AUDIT_2026-09-22.md` · never hand-edit Dashboard without git |

## Stripe MCP (Cursor)

With **Stripe** plugin connected, ask the agent to retrieve each `live_product_id` from catalog and compare to git — same checks as `audit:stripe-live`. MCP does not replace Vercel env or git canon.

## Not in scope

- **SPQ** / **weweb-export** — see `docs/LANE_ISOLATION.md`
- Charging a real card (smokes only open Checkout URLs)

## Related

- `docs/STRIPE_SMOKE.md` · `docs/VERCEL_SETUP.md` · `docs/STRIPE_ISLES_CATALOG.md`
