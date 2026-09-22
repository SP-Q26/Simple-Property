# Build phase 3 · Simple Property Tools

Cross-device Pro, durable subscription state, email deadline reminders.

## Shipped

- [x] **KV subscription store** — webhook upserts `ent:cus:*` + `ent:email:*` (Upstash via `KV_REST_*`)
- [x] **Entitlement refresh** — `GET /api/entitlement?customer_id=` · Stripe fallback if KV empty
- [x] **Magic link restore** — `POST /api/auth/magic-link` · `?magic=&sig=` on `/app`
- [x] **Webhook raw body** — Stripe signature verify fixed (`bodyParser: false`)
- [x] **Email reminders** — `POST /api/reminders/subscribe` (step 5) · cron `GET /api/cron/deadline-reminders`
- [x] **Client** — `sp-entitlement.js` bootstrap · pricing restore form · `sp-magic.js`

## Vercel setup

1. **Upstash Redis** (Marketplace) on the project → `KV_REST_API_URL` / `KV_REST_API_TOKEN`
2. **Resend** — `RESEND_API_KEY`, verify `SPT_EMAIL_FROM` domain
3. **Stripe webhook** — `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` → `/api/stripe/webhook`
4. **Cron** — `vercel.json` runs daily 14:00 UTC; set `SPT_CRON_SECRET` or use Vercel `CRON_SECRET`

## Still later

- Full login / packet sync to server (not localStorage-only)
- SMS reminders
- Multi-state rules engine

## Verify

```bash
cd web && npm run audit
npm run dev   # with .env.local
# Webhook: stripe listen --forward-to localhost:4321/api/stripe/webhook
# Cron: curl -H "Authorization: Bearer $SPT_CRON_SECRET" http://localhost:4321/api/cron/deadline-reminders
```
