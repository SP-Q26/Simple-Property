# Minimum stack · transactional email + scheduled jobs (Vercel)

One-page pattern for any product that needs **“user signs up / schedules something → we email them later.”** Reference implementation: **Deposit Desk** (`simple-property`).

---

## What you are building (three layers)

```
┌─────────────┐     POST subscribe      ┌──────────────────┐
│  UI / form  │ ──────────────────────► │  Serverless API  │
└─────────────┘                         │  (validate,      │
                                        │   enqueue jobs)  │
                                        └────────┬─────────┘
                                                 │ write
                                                 ▼
                                        ┌──────────────────┐
                                        │  Upstash Redis   │
                                        │  (KV via Vercel) │
                                        │  job payload +   │
                                        │  due-time zset   │
                                        └────────┬─────────┘
                                                 │
     Vercel Cron (daily/hourly)                  │ read due
            │                                    ▼
            └────────────────────────► ┌──────────────────┐
                                         │  Cron API route │
                                         │  send due mail  │
                                         └────────┬─────────┘
                                                  │ HTTPS
                                                  ▼
                                         ┌──────────────────┐
                                         │  Resend API      │
                                         │  (verified from) │
                                         └──────────────────┘
```

| Layer | Job | If missing |
|-------|-----|------------|
| **Enqueue API** | Accept request, validate, persist jobs | User sees 4xx/5xx immediately |
| **KV (Upstash)** | Durable queue + schedule (scores = send time) | `503 reminders_storage_not_configured` |
| **Resend** | Outbound email | `503 email_not_configured`; cron cannot send |
| **Cron** | Wake worker on a schedule | Jobs pile up; nothing sends until cron runs |
| **DNS on sending domain** | Resend domain verified | API may accept jobs; **sends fail** until verified |

**Do not** store queue state only in memory, only in the browser, or only in Postgres unless you already operate that DB and backups. For small Vercel apps, **Redis + cron** is the minimum durable pattern.

---

## Environment variables (never in git)

Set on **each Vercel project** (Production + Preview as needed). Redeploy after any change.

| Variable | Source | Purpose |
|----------|--------|---------|
| `KV_REST_API_URL` | Vercel **Storage → Upstash Redis** (connect project) | REST endpoint for `@vercel/kv` |
| `KV_REST_API_TOKEN` | Same integration | Auth for KV REST |
| `RESEND_API_KEY` | [Resend](https://resend.com/api-keys) → manual env var | Send mail |
| `{PRODUCT}_EMAIL_FROM` | You (e.g. `Deposit Desk <hello@simple-property.com>`) | From header; domain must match Resend |
| `CRON_SECRET` | Often **auto-injected** by Vercel on cron invocations | Bearer auth on cron routes |
| `{PRODUCT}_CRON_SECRET` | Optional duplicate for local/manual cron tests | Same as above |

Other product secrets (Stripe, HMAC, site URL) are separate but should use the same **readiness probe** pattern (below).

**Local dev:** `vercel link` once → `vercel env pull` into `web/.env.local` (from `.env.example`). Production secrets stay on Vercel.

**Ignore** generic Upstash wizard steps that install `@upstash/redis` and rewrite routes unless you are greenfield Next.js. Existing apps can use **`@vercel/kv`** with the same `KV_REST_*` vars.

---

## Vercel setup checklist (per product)

1. **Storage** — Project → **Storage** → Create **Upstash Redis** → **Connect to this project** → confirm `KV_REST_API_URL` + `KV_REST_API_TOKEN` on **Production** (and Preview if you test there).
2. **Resend** — Create API key → **Settings → Environment Variables** → `RESEND_API_KEY` (Sensitive).
3. **From address** — Set `{PRODUCT}_EMAIL_FROM` to an address on a domain you will verify in Resend.
4. **Redeploy Production** — Connecting storage or adding env does **not** update already-running deployments.
5. **DNS** — Resend → Domains → add **DKIM** (+ SPF / return-path as shown) at your DNS host → wait until **Verified**.
6. **Cron** — `vercel.json` `crons` array pointing at your worker route (e.g. daily `0 14 * * *` UTC). Worker must check `Authorization: Bearer ${CRON_SECRET}` (or your alias).
7. **Smoke** — `GET /api/health/services` (or product equivalent) → all required checks `true` → one test `POST` subscribe → optional wait for cron or trigger cron manually with Bearer secret.

---

## Code minimum (copy the shape, not necessarily the filenames)

| Piece | Responsibility |
|-------|----------------|
| `kvConfigured()` | `Boolean(KV_REST_API_URL && KV_REST_API_TOKEN)` |
| `resendConfigured()` | `Boolean(RESEND_API_KEY)` |
| **Subscribe route** | Method POST only → fail fast if email/KV not configured → validate → `schedule*()` writes job JSON + zadd due set |
| **Cron route** | Auth header → load due job IDs → Resend send → remove from zset |
| **Health route** | Public GET, `Cache-Control: no-store`, JSON booleans only (no secret values) |

Deposit Desk paths:

- `web/api/reminders/subscribe.js`
- `web/api/cron/deadline-reminders.js`
- `web/api/health/services.js`
- `web/lib/kv-client.mjs` · `web/lib/reminder-store.mjs` · `web/lib/resend.mjs`

---

## Readiness probe (required for every product)

Expose **`GET /api/health/services`** (or `/api/health`) that returns:

- `ready`: aggregate boolean (your definition of “ship reminders” or “ship magic links”).
- `checks`: per-integration flags (`resend`, `kv`, `stripe`, `cronAuth`, …).
- `hints`: links to internal docs — no API keys, no PII.

Run after every deploy:

```bash
curl -s https://YOUR_APEX/api/health/services
```

Repo script (Deposit Desk): `npm run smoke:health` from `simple-property` root.

---

## Before vs after DNS verification

| Capability | API key + KV + redeploy | + Resend domain **Verified** |
|------------|-------------------------|------------------------------|
| Health `resend: true` | Yes | Yes |
| Enqueue reminders / write KV | Yes | Yes |
| Resend actually delivers mail | No | Yes |

---

## Security baseline

- Cron routes: **always** require shared secret; never public GET that sends mail.
- Subscribe routes: rate-limit or CAPTCHA at edge when exposed to anonymous users (product decision).
- Resend: one API key per environment or per product; rotate in Vercel without committing.
- KV: treat as **PII store** if jobs hold emails — TTL on job keys (Deposit Desk uses ~120d `ex`).

---

## New product “minimum bar” sign-off

- [ ] Upstash Redis connected to Vercel project; Production redeployed; health shows `kv: true`
- [ ] `RESEND_API_KEY` set; health shows `resend: true`
- [ ] Sending domain verified in Resend; `*_EMAIL_FROM` matches that domain
- [ ] Cron registered in `vercel.json`; worker auth tested once with Bearer secret
- [ ] Public health endpoint documented in repo README or ops doc
- [ ] One automated or manual smoke documented (curl or `smoke:health`)

---

## Related docs (Deposit Desk)

| Doc | Contents |
|-----|----------|
| `docs/VERCEL_SETUP.md` | Full env matrix, Phase 3 steps, Stripe |
| `docs/REMINDERS_SYSTEM_2026-10-12.md` | Wizard + PM email behavior |
| `docs/PHASE3.md` | Operator smoke |

When cloning this pattern to **Innsegall**, **WW Luxe**, or **SPQ**, keep the same **KV + Resend + cron + health** quartet even if job types and routes differ.
