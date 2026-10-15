# Vercel setup · Simple Property Tools

**Repo:** [SP-Q26/Simple-Property](https://github.com/SP-Q26/Simple-Property) · **Root directory:** `web` · **Production branch:** `main`

## 1. Create or link project

1. [vercel.com/new](https://vercel.com/new) → Import **SP-Q26/Simple-Property**
2. **Root Directory:** `web` (Edit → set before first deploy) — **required**. If unset, `https://…vercel.app/` returns **404** (repo root has no `index.html`).
3. Framework: **Other** (static + `/api` serverless)
4. Production branch: **`main`** · Preview: all other branches + PRs

**Dashboard:** [vercel.com/spq/simple-property](https://vercel.com/spq/simple-property)

**Canonical project name:** `simple-property` only. Do **not** create a second Vercel project for this repo.

| Project | Domains | Role |
|---------|---------|------|
| **simple-property** | `simple-property.com`, `www`, `simple-property-*.vercel.app` | Production — use this |
| **web** (if it appears) | `web-*.vercel.app` only | Accidental duplicate — usually from `npx vercel link` inside `web/` without picking `simple-property` |

If both projects show the same GitHub repo icon, every `main` push builds **twice**. Apex traffic still goes to **simple-property** only. Remove the duplicate: Vercel → **web** → Settings → **Delete Project** (safe; no custom domains on that project).

When linking the CLI from `web/`, choose existing project **`simple-property`**, not a new project named `web`.

**Project icon (dashboard):** Settings → General → **Project Icon** — upload `web/sp-vercel-logo.svg` or `web/favicon.svg` · see `SPQ/docs/isles/VERCEL_SITE_ICONS.md`. Deployments also serve `/favicon.ico` for browser tabs.

## 1b. Deployment Protection (public alpha)

SPQ team defaults may enable **Vercel Authentication** on `*.vercel.app` URLs. Anonymous visitors then hit SSO instead of Deposit Desk.

| Goal | Action |
|------|--------|
| Public smoke on `*.vercel.app` | Project → **Settings** → **Deployment Protection** → disable Vercel Authentication for this project, or limit to preview-only |
| Public production on apex only | Add **`simple-property.com`** — team policy `all_except_custom_domains` bypasses SSO on custom domains |

Until fixed, only logged-in team members can open default deployment URLs.

## 2. Enable tracking (dashboard)

After first deploy:

| Product | Path | Dashboard |
|---------|------|-----------|
| **Web Analytics** | `/_vercel/insights/script.js` | Project → **Analytics** → Web Analytics → **Enable** · or `npx vercel project web-analytics enable simple-property -S team_HqMoC6Iyl5J5qMn9YmR6pJRL` |
| **Speed Insights** | `/_vercel/speed-insights/script.js` | Project → **Analytics** → Speed Insights → **Enable** |

Git already injects both scripts on every public HTML page (`npm run sync-chrome`). Collective batch: `SPQ/scripts/enable-collective-vercel-analytics.sh` (from SPQ repo). Canon: `SPQ/docs/isles/VERCEL_ANALYTICS_COLLECTIVE.md`. Until enabled in the dashboard, scripts 404 on production until toggle is on.

Privacy copy: `web/privacy.html` · **Usage analytics** section.

## 3. Environment variables

Copy from `web/.env.example`. Set per **Preview** and **Production** in Vercel → Settings → Environment Variables.

| Variable | Preview | Production | Notes |
|----------|---------|------------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_live_…` when live | Test mode for preview |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI or test endpoint | Live webhook secret | See below |
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` | Optional test price IDs | Live price IDs | Inline `price_data` fallback if unset |
| `SPT_ENTITLEMENT_SECRET` | Random 32+ bytes | **Different** random value | HMAC for entitlement + magic links |
| `SPT_SITE_URL` | `https://<preview-host>.vercel.app` | `https://simple-property.com` | Checkout success/cancel URLs |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash via Marketplace | Same or prod store | **Only pair the app reads** (`web/lib/kv-client.mjs`) |
| `STRIPE_PRICE_KEEPER_MONTHLY` / `STRIPE_PRICE_PORTFOLIO_MONTHLY` | Live IDs (or test parallels) | Same | Condition hub subscriptions · canon in `stripe-catalog.mjs` |
| `STRIPE_PRICE_MONTHLY` / `ANNUAL` / `TURN_*` | Live IDs on prod | Test IDs on preview if using `sk_test_` | Optional on `sk_live` (catalog wins) |
| `RESEND_API_KEY` | `re_…` | `re_…` | Magic link + reminders |
| `SPT_EMAIL_FROM` | `Deposit Desk <hello@simple-property.com>` | Same (domain verified) | |
| `SPT_FEEDBACK_TO` | Optional | `hello@simple-property.com` or `feedback@…` | Feedback notification inbox |
| `SPT_CRON_SECRET` | Optional | Optional | Vercel sets `CRON_SECRET` for cron routes |

### Upstash “Needs Attention” (KV_REST_API_TOKEN, REDIS_URL, …)

Connecting **Storage → Upstash Redis** may inject five variables. Deposit Desk uses **only** `KV_REST_API_URL` and `KV_REST_API_TOKEN`. **Delete** the unused keys in Vercel if present: `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`, `REDIS_URL` (CLI: `cd web && npx vercel env rm <KEY> production --yes` and repeat for `preview`). Same for unused Resend inject `RESEND_EMAIL_DOMAIN` — the app uses `SPT_EMAIL_FROM` only.

Vercel may flag **readable-secret** on integration-injected tokens. That is a visibility recommendation, not a broken KV. Fix: open each flagged var → **Sensitive**, or **Storage → your database → Reconnect**. After any env change, **Redeploy Production** once. Smoke: `GET /api/health/services` → `checks.kv: true`.

Repo audit: `npm run audit:vercel-env`

### Phase 3 · make reminders + Pro KV fully live

Production **`simple-property`** currently needs **Upstash Redis** and **Resend** (Stripe is already set). After env is complete, redeploy **Production** once.

| Step | Dashboard |
|------|-----------|
| 1 · **KV** | [simple-property → Storage](https://vercel.com/spq/simple-property/stores) → **Create Database** → **Upstash Redis** → name `simple-property-kv` → connect to **simple-property** → confirm `KV_REST_API_URL` + `KV_REST_API_TOKEN` on **Production** (and Preview if you test reminders there). |
| 2 · **Resend** | [Resend](https://resend.com/api-keys) → API key → Vercel → **Settings → Environment Variables** → `RESEND_API_KEY` (Sensitive) on **Production** + **Preview**. Verify sending domain for `hello@simple-property.com` (or your from-address). |
| 3 · **From address** | `SPT_EMAIL_FROM` = `Deposit Desk <hello@simple-property.com>` on Production + Preview (plain or sensitive). |
| 4 · **Redeploy** | Deployments → latest **Production** → **Redeploy** (env vars apply on next build/runtime). |
| 5 · **Smoke** | `curl -s https://simple-property.com/api/health/services` → `ready: true` · wizard step 5 → **Schedule emails** → not `email_not_configured`. |

**Readiness probe (no secrets):** `GET /api/health/services` returns booleans for `resend`, `kv`, `stripe`, etc.

```bash
npm run smoke:health   # from repo root after deploy
```

Cron is already in `web/vercel.json` (`0 14 * * *` → `/api/cron/deadline-reminders`). Vercel injects `CRON_SECRET` on Hobby/Pro; optional duplicate as `SPT_CRON_SECRET` for local cron tests.

**Preview Stripe webhook:** Stripe Dashboard → Developers → Webhooks → Add endpoint:

`https://<your-preview>.vercel.app/api/stripe/webhook`

Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`.

**Production webhook:** `https://simple-property.com/api/stripe/webhook`

## 4. Preview deploy (recommended first)

**Option A — Git (best):**

```bash
cd ~/SPQ/simple-property
npm run preflight
git push origin main          # or push branch `preview` for preview-only smoke
```

Vercel builds automatically; open **Deployments** → latest **Preview** or **Production** URL.

**Option B — CLI (one-off):**

```bash
cd ~/SPQ/simple-property/web
npx vercel login
npx vercel link               # team + project name e.g. simple-property
npx vercel                    # preview URL (no --prod)
```

## 5. Post-deploy smoke

**Automated full send (Stripe + Resend + proud-ship audits):**

```bash
export STRIPE_SECRET_KEY='sk_live_…'   # Dashboard audit only; optional for health/checkout smokes
npm run full-send
```

Details: `docs/FULL_SEND_STRIPE.md` · this repo is **`main` only** — not SPQ `weweb-export` (`docs/LANE_ISOLATION.md`).

| Check | URL |
|-------|-----|
| Platform health | `GET /api/health/services` |
| Home + nav | `/` |
| Pricing | `/pricing` |
| Wizard demo Pro | `/app?demo=pro` (preview / localhost only) |
| Blog | `/blog/landlord-tools-by-door-count` |
| Launch stack | `/launch-stack` |
| Entitlement API | `/api/entitlement` (GET without params → 400, not 500) |

Cron (production): daily 14:00 UTC → `/api/cron/deadline-reminders` (`vercel.json`).

## 6. Production apex

When ready:

1. Vercel → Domains → add `simple-property.com` + `www` (www redirect already in `vercel.json`)
2. Namecheap DNS: `@` A `76.76.21.21` · `www` CNAME `cname.vercel-dns.com`
3. Flip Stripe to live keys + live webhook on apex
4. GSC sitemap: `https://simple-property.com/sitemap.xml`

## Repo scripts

```bash
npm run sync-chrome    # inject Vercel analytics scripts into HTML
npm run preflight      # git + web audits (includes tracking audit)
```

See also: `docs/DEPLOY.md` · `docs/PHASE3.md` · `docs/GIT_AGENT_CONNECTION.md`
