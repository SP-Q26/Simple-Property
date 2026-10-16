# Simple Property · telemetry spec (PBS v1 + funnel)

**Lane:** `simple_property` · `isles_brand: deposit_desk` (checkout/email)  
**Aligns with:** FieldDrop `packet_bar_*` · Berth `BERTH_TELEMETRY_PBS_v1.md` (shared dictionary)  
**Code:** `web/lib/spt-telemetry.mjs` · `web/sp-events.js` · `web/api/events.js` (log sink)

---

## Principle

- **No tenant email, street address, or name** in client events.
- `receipt_id` only as **`receipt_id_hash`** (optional · SHA-256 truncated).
- **Money truth:** `checkout_complete` · `subscription_*` on **Stripe webhook only** (never trust client).

---

## Dimensions (attach when known)

| Dim | Simple Property value |
|-----|------------------------|
| `isles_brand` | `deposit_desk` |
| `template_id` | `deposit_deduction_exhibit` (Deposit Desk packet) |
| `skin_id` | `simple_property` (app shell) |
| `env` | `production` on apex · else `preview` |
| `door_band` | `1-4` · `5-15` · `16-40` · `41+` (from unit count) |

---

## Marketing / site

| Event | Payload |
|-------|---------|
| `spt_page_view` | `page`, `path`, `ref?` |
| `spt_blog_view` | `slug` |
| `spt_start_intent` | `ref` (e.g. `move-out`, `launch-stack`), `template_id?` |
| `spt_hub_handoff_applied` | `template_id`, `field_count` (Condition hub → Desk prefill) |
| `spt_module_click` | `module`: `deposit_desk` \| `condition_hub` \| `operator_logs` |

---

## Deposit Desk wizard

| Event | Payload |
|-------|---------|
| `sp_wizard_start` | `template_id`, `skin_id: simple_property` |
| `sp_wizard_step` | `template_id`, `step_id`, `index` |
| `sp_finalize_attempt` | `template_id`, `verdict?` |
| `sp_finalize_success` | `template_id`, `receipt_id_hash`, `trust_index?` |
| `sp_finalize_fail` | `template_id`, `reason` |

---

## Packet bar (PBS v1 · priority)

| Event | Payload |
|-------|---------|
| `packet_bar_copy_link` | `isles_brand`, `template_id` |
| `packet_bar_copy_tsv` | `isles_brand`, `template_id` |
| `packet_bar_pdf` | `isles_brand`, `template_id` |
| `packet_bar_ics` | `isles_brand`, `template_id` |
| `packet_bar_email_tenant` | `isles_brand` (Resend live) |

---

## Money (server-only)

| Event | Payload |
|-------|---------|
| `checkout_intent` | `sku`, `page` (optional client mirror via `checkout_click`) |
| `paywall_view` | `state` |
| `paywall_urgency` | `days_left`, `state` |
| `unlock_scroll` | `state` |
| `purchase_success` | `plan` |
| `spt_guide_cta_click` | `href`, `page` |
| `reminder_subscribe` | `scheduled` (server) |
| `feedback_submit` | `category`, `stored`, `emailed` (server) |
| `magic_link_request` | `sent` (server) |
| `hub_spa_view` | `route` |
| `checkout_complete` | `sku`, `isles_brand: deposit_desk` |
| `subscription_updated` | `sku`, `status` |
| `subscription_deleted` | `sku` |
| `subscription_renewal` | `sku` |

Logged from `web/api/stripe/webhook.js` as structured JSON (`spt_telemetry: true`).

---

## Weekly ops (dashboards)

- `sp_finalize_success` by `template_id`
- `packet_bar_copy_tsv` rate vs `sp_finalize_attempt`
- `checkout_complete` count by `sku`
- Top `ref` on `spt_start_intent`

---

## Sink

1. **Now:** Vercel Web Analytics (`window.va`) + `POST /api/events` (console log + **KV funnel counters** when `KV_REST_*` set) + webhook logs.
2. **Weekly:** `GET /api/funnel/report` (Bearer cron secret) · cron `/api/cron/funnel-weekly-report` · local `npm run report:funnel-weekly`.
3. **Later:** Xano or unified `isles_events` (same event names).

**Audit:** `npm run audit:telemetry`

*Internal · not legal advice.*
