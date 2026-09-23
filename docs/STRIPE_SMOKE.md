# Stripe smoke · Deposit Desk E2E

Adapted from Innsegall `STRIPE_SMOKE.md` · Isles catalog in `docs/STRIPE_ISLES_AUDIT_2026-09-22.md`.

**Test mode** until live keys are verified · card `4242 4242 4242 4242`.

## Before pay

| Check | Command |
|-------|---------|
| Repo audit | `npm run audit` |
| Live home | `SPT_SMOKE_URL=https://simple-property.com npm run smoke:prod` |
| Checkout API | `npm run smoke:checkout` |
| Catalog script | `npm run verify-stripe` (needs `STRIPE_SECRET_KEY`) |

## Pro subscription

1. Open `/pricing` or `/?buy=annual`
2. **Subscribe annual** → Stripe Checkout
3. Return to `/success?session_id=cs_…`
4. `/app` print unlock after entitlement refresh

## Per-turn unlock

1. Complete wizard to step 5 on `/app`
2. Unlock move-out or full tenancy SKU at export

## Live flip

1. Vercel Production: `STRIPE_SECRET_KEY` (live) · price IDs match `web/lib/stripe-catalog.mjs` or remove stale `STRIPE_PRICE_*` env overrides
2. Redeploy
3. Re-run `npm run smoke:checkout` until JSON includes `url`

## Failure UX

Pricing shows inline checkout error under cards; support fallback `hello@simple-property.com`.
