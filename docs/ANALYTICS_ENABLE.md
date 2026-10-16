# Analytics · enable everything (Deposit Desk)

## Vercel dashboard (required once per project)

1. **Analytics → Web Analytics → Enable** (production + preview if you want).
2. **Analytics → Speed Insights → Enable**.
3. **Storage → Upstash Redis** connected (same KV as reminders) · auto-injects `KV_REST_API_URL` + `KV_REST_API_TOKEN`.

Repo already ships scripts on every HTML page via `npm run sync-chrome`:

- `/_vercel/insights/script.js` · page views + custom events (`window.va`)
- `/_vercel/speed-insights/script.js` · Web Vitals
- `/sp-events.js` · custom events → `POST /api/events` → **KV funnel counters** + logs

## What we capture

| Layer | Where to look |
|-------|----------------|
| Vercel Web Analytics | Project → Analytics · Events tab (`sp_wizard_start`, `checkout_intent`, …) |
| Speed Insights | Analytics → Speed |
| KV funnel rollups | `npm run report:funnel-weekly` · `GET /api/funnel/report` (cron Bearer) |
| Stripe money events | Webhook logs · `checkout_complete` · `subscription_*` |
| Server actions | `reminder_subscribe` · `feedback_submit` · `magic_link_request` |

## Ops commands

```bash
npm run sync-chrome              # inject sp-events + Vercel snippets on all HTML
node scripts/audit-analytics-coverage.mjs
npm run report:funnel-weekly     # needs KV env locally to read prod counters
```

Weekly cron (already in `vercel.json`): `/api/cron/funnel-weekly-report` · Mondays 15:00 UTC.

Canon: `docs/receipt-rail/SIMPLE_PROPERTY_TELEMETRY_PBS_v1.md`

**Deploy note:** Hobby Vercel caps **12** `/api` functions · `GET /api/funnel/report` is served through `api/ops.js` (same URL).
